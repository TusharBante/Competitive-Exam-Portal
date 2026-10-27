const Reel = require('../models/Reel');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * Helper: upload buffer to cloudinary as video with fallback for local dev
 */
const uploadVideoToCloudinary = (buffer, folder, mimetype = 'video/mp4') => {
  return new Promise((resolve) => {
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY.includes('1234567890')) {
      const base64 = buffer.toString('base64');
      return resolve({
        secure_url: `data:${mimetype};base64,${base64}`,
        public_id: `local_video_${Date.now()}`,
      });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'video' },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary video upload warning (using fallback data URI):', error.message);
          const base64 = buffer.toString('base64');
          return resolve({
            secure_url: `data:${mimetype};base64,${base64}`,
            public_id: `local_video_${Date.now()}`,
          });
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * Helper: parse hashtags from caption
 */
const parseHashtags = (caption) => {
  if (!caption) return [];
  const matches = caption.match(/#\w+/g);
  return matches ? matches.map((tag) => tag.slice(1).toLowerCase()) : [];
};

/**
 * @desc    Create a new reel
 * @route   POST /api/reels
 */
const createReel = catchAsync(async (req, res) => {
  const { caption, description } = req.body;

  if (!req.file) {
    throw new ApiError(400, 'Video file is required.');
  }

  // Upload video to cloudinary
  const result = await uploadVideoToCloudinary(
    req.file.buffer,
    'exam-portal/reels'
  );

  const hashtags = req.body.hashtags
    ? JSON.parse(req.body.hashtags)
    : parseHashtags(caption);

  const reel = await Reel.create({
    creator: req.user._id,
    caption: caption || '',
    description: description || '',
    hashtags,
    videoUrl: result.secure_url,
    videoPublicId: result.public_id,
    thumbnail: result.secure_url.replace(/\.\w+$/, '.jpg'),
  });

  const populatedReel = await Reel.findById(reel._id).populate(
    'creator',
    'name profileImage'
  );

  res.status(201).json(ApiResponse.success('Reel created.', { reel: populatedReel }));
});

/**
 * @desc    Get paginated reels
 * @route   GET /api/reels
 */
const getReels = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Reel.countDocuments();

  const reels = await Reel.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('creator', 'name profileImage');

  res.status(200).json(
    ApiResponse.success('Reels fetched.', {
      reels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  );
});

/**
 * @desc    Get a single reel by ID
 * @route   GET /api/reels/:id
 */
const getReelById = catchAsync(async (req, res) => {
  const reel = await Reel.findById(req.params.id)
    .populate('creator', 'name profileImage')
    .populate('comments.author', 'name profileImage');

  if (!reel) {
    throw new ApiError(404, 'Reel not found.');
  }

  res.status(200).json(ApiResponse.success('Reel fetched.', { reel }));
});

/**
 * @desc    Update a reel
 * @route   PUT /api/reels/:id
 */
const updateReel = catchAsync(async (req, res) => {
  const { caption, description, hashtags } = req.body;

  const reel = await Reel.findById(req.params.id);
  if (!reel) {
    throw new ApiError(404, 'Reel not found.');
  }

  // Check ownership
  if (reel.creator.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this reel.');
  }

  if (caption !== undefined) reel.caption = caption;
  if (description !== undefined) reel.description = description;
  if (hashtags !== undefined) {
    reel.hashtags = Array.isArray(hashtags) ? hashtags : parseHashtags(caption);
  }

  await reel.save();

  const updatedReel = await Reel.findById(reel._id).populate(
    'creator',
    'name profileImage'
  );

  res.status(200).json(ApiResponse.success('Reel updated.', { reel: updatedReel }));
});

/**
 * @desc    Delete a reel
 * @route   DELETE /api/reels/:id
 */
const deleteReel = catchAsync(async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) {
    throw new ApiError(404, 'Reel not found.');
  }

  // Check ownership
  if (reel.creator.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this reel.');
  }

  // Delete video from cloudinary
  if (reel.videoPublicId) {
    await cloudinary.uploader.destroy(reel.videoPublicId, {
      resource_type: 'video',
    });
  }

  // Remove from all users' savedReels
  await User.updateMany(
    { savedReels: reel._id },
    { $pull: { savedReels: reel._id } }
  );

  await Reel.findByIdAndDelete(req.params.id);

  res.status(200).json(ApiResponse.success('Reel deleted.'));
});

/**
 * @desc    Toggle like on a reel
 * @route   POST /api/reels/:id/like
 */
const toggleLike = catchAsync(async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) {
    throw new ApiError(404, 'Reel not found.');
  }

  const userId = req.user._id;
  const likeIndex = reel.likes.findIndex(
    (id) => id.toString() === userId.toString()
  );

  if (likeIndex > -1) {
    reel.likes.splice(likeIndex, 1);
  } else {
    reel.likes.push(userId);
  }

  await reel.save();

  res.status(200).json(
    ApiResponse.success(likeIndex > -1 ? 'Reel unliked.' : 'Reel liked.', {
      likesCount: reel.likes.length,
      isLiked: likeIndex === -1,
    })
  );
});

/**
 * @desc    Add a comment to a reel
 * @route   POST /api/reels/:id/comments
 */
const addComment = catchAsync(async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) {
    throw new ApiError(404, 'Reel not found.');
  }

  const comment = {
    author: req.user._id,
    content: req.body.content,
    createdAt: new Date(),
  };

  reel.comments.push(comment);
  await reel.save();

  const updatedReel = await Reel.findById(reel._id)
    .populate('creator', 'name profileImage')
    .populate('comments.author', 'name profileImage');

  res.status(201).json(ApiResponse.success('Comment added.', { reel: updatedReel }));
});

/**
 * @desc    Delete a comment from a reel
 * @route   DELETE /api/reels/:id/comments/:commentId
 */
const deleteComment = catchAsync(async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) {
    throw new ApiError(404, 'Reel not found.');
  }

  const comment = reel.comments.id(req.params.commentId);
  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  // Check comment author ownership
  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this comment.');
  }

  reel.comments.pull({ _id: req.params.commentId });
  await reel.save();

  res.status(200).json(ApiResponse.success('Comment deleted.'));
});

/**
 * @desc    Toggle save a reel
 * @route   POST /api/reels/:id/save
 */
const toggleSave = catchAsync(async (req, res) => {
  const reelId = req.params.id;

  const reel = await Reel.findById(reelId);
  if (!reel) {
    throw new ApiError(404, 'Reel not found.');
  }

  const user = await User.findById(req.user._id);
  const savedIndex = user.savedReels.findIndex(
    (id) => id.toString() === reelId.toString()
  );

  if (savedIndex > -1) {
    user.savedReels.splice(savedIndex, 1);
  } else {
    user.savedReels.push(reelId);
  }

  await user.save();

  res.status(200).json(
    ApiResponse.success(
      savedIndex > -1 ? 'Reel removed from saved.' : 'Reel saved.',
      { isSaved: savedIndex === -1 }
    )
  );
});

/**
 * @desc    Get user's saved reels
 * @route   GET /api/reels/saved
 */
const getSavedReels = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedReels',
    populate: {
      path: 'creator',
      select: 'name profileImage',
    },
  });

  res.status(200).json(
    ApiResponse.success('Saved reels fetched.', { reels: user.savedReels })
  );
});

/**
 * @desc    Get shareable URL for a reel
 * @route   GET /api/reels/:id/share
 */
const shareReel = catchAsync(async (req, res) => {
  const reel = await Reel.findById(req.params.id);
  if (!reel) {
    throw new ApiError(404, 'Reel not found.');
  }

  const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reels/${reel._id}`;

  res.status(200).json(
    ApiResponse.success('Share URL generated.', { shareUrl })
  );
});

module.exports = {
  createReel,
  getReels,
  getReelById,
  updateReel,
  deleteReel,
  toggleLike,
  addComment,
  deleteComment,
  toggleSave,
  getSavedReels,
  shareReel,
};
