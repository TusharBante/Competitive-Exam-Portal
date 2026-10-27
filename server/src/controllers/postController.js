const Post = require('../models/Post');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * Helper: upload buffer to cloudinary with fallback for local dev
 */
const uploadToCloudinary = (buffer, folder, mimetype = 'image/jpeg') => {
  return new Promise((resolve) => {
    if (!process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY.includes('1234567890')) {
      const base64 = buffer.toString('base64');
      return resolve({
        secure_url: `data:${mimetype};base64,${base64}`,
        public_id: `local_${Date.now()}`,
      });
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) {
          console.warn('Cloudinary upload warning (using fallback data URI):', error.message);
          const base64 = buffer.toString('base64');
          return resolve({
            secure_url: `data:${mimetype};base64,${base64}`,
            public_id: `local_${Date.now()}`,
          });
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 */
const createPost = catchAsync(async (req, res) => {
  const { title, content } = req.body;

  const postData = {
    author: req.user._id,
    title: title || '',
    content,
  };

  // Upload image to cloudinary if provided
  if (req.file) {
    const result = await uploadToCloudinary(
      req.file.buffer,
      'exam-portal/posts'
    );
    postData.image = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  const post = await Post.create(postData);
  const populatedPost = await Post.findById(post._id).populate(
    'author',
    'name profileImage'
  );

  res.status(201).json(ApiResponse.success('Post created.', { post: populatedPost }));
});

/**
 * @desc    Get paginated posts
 * @route   GET /api/posts
 */
const getPosts = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, sort = 'newest' } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Post.countDocuments();

  let sortOption = { createdAt: -1 };
  if (sort === 'most-liked') {
    // Sort by likes array length descending
    sortOption = { likesCount: -1, createdAt: -1 };
  }

  let posts;
  if (sort === 'most-liked') {
    posts = await Post.aggregate([
      { $addFields: { likesCount: { $size: '$likes' } } },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: parseInt(limit) },
    ]);
    // Populate after aggregation
    posts = await Post.populate(posts, {
      path: 'author',
      select: 'name profileImage',
    });
  } else {
    posts = await Post.find()
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name profileImage');
  }

  res.status(200).json(
    ApiResponse.success('Posts fetched.', {
      posts,
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
 * @desc    Get a single post by ID
 * @route   GET /api/posts/:id
 */
const getPostById = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate('author', 'name profileImage')
    .populate('comments.author', 'name profileImage');

  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  res.status(200).json(ApiResponse.success('Post fetched.', { post }));
});

/**
 * @desc    Update a post
 * @route   PUT /api/posts/:id
 */
const updatePost = catchAsync(async (req, res) => {
  const { title, content } = req.body;

  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  // Check ownership
  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to update this post.');
  }

  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = content;

  // Handle new image upload
  if (req.file) {
    // Delete old image from cloudinary
    if (post.image && post.image.publicId) {
      await cloudinary.uploader.destroy(post.image.publicId);
    }

    const result = await uploadToCloudinary(
      req.file.buffer,
      'exam-portal/posts'
    );
    post.image = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  await post.save();

  const updatedPost = await Post.findById(post._id).populate(
    'author',
    'name profileImage'
  );

  res.status(200).json(ApiResponse.success('Post updated.', { post: updatedPost }));
});

/**
 * @desc    Delete a post
 * @route   DELETE /api/posts/:id
 */
const deletePost = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  // Check ownership
  if (post.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this post.');
  }

  // Delete image from cloudinary if exists
  if (post.image && post.image.publicId) {
    await cloudinary.uploader.destroy(post.image.publicId);
  }

  // Remove from all users' savedPosts
  await User.updateMany(
    { savedPosts: post._id },
    { $pull: { savedPosts: post._id } }
  );

  await Post.findByIdAndDelete(req.params.id);

  res.status(200).json(ApiResponse.success('Post deleted.'));
});

/**
 * @desc    Toggle like on a post
 * @route   POST /api/posts/:id/like
 */
const toggleLike = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const userId = req.user._id;
  const likeIndex = post.likes.findIndex(
    (id) => id.toString() === userId.toString()
  );

  if (likeIndex > -1) {
    // Unlike
    post.likes.splice(likeIndex, 1);
  } else {
    // Like
    post.likes.push(userId);
  }

  await post.save();

  res.status(200).json(
    ApiResponse.success(likeIndex > -1 ? 'Post unliked.' : 'Post liked.', {
      likesCount: post.likes.length,
      isLiked: likeIndex === -1, // true if we just liked it
    })
  );
});

/**
 * @desc    Add a comment to a post
 * @route   POST /api/posts/:id/comments
 */
const addComment = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const comment = {
    author: req.user._id,
    content: req.body.content,
    createdAt: new Date(),
  };

  post.comments.push(comment);
  await post.save();

  const updatedPost = await Post.findById(post._id)
    .populate('author', 'name profileImage')
    .populate('comments.author', 'name profileImage');

  res.status(201).json(ApiResponse.success('Comment added.', { post: updatedPost }));
});

/**
 * @desc    Delete a comment from a post
 * @route   DELETE /api/posts/:id/comments/:commentId
 */
const deleteComment = catchAsync(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const comment = post.comments.id(req.params.commentId);
  if (!comment) {
    throw new ApiError(404, 'Comment not found.');
  }

  // Check comment author ownership
  if (comment.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to delete this comment.');
  }

  post.comments.pull({ _id: req.params.commentId });
  await post.save();

  res.status(200).json(ApiResponse.success('Comment deleted.'));
});

/**
 * @desc    Toggle save a post
 * @route   POST /api/posts/:id/save
 */
const toggleSave = catchAsync(async (req, res) => {
  const postId = req.params.id;

  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, 'Post not found.');
  }

  const user = await User.findById(req.user._id);
  const savedIndex = user.savedPosts.findIndex(
    (id) => id.toString() === postId.toString()
  );

  if (savedIndex > -1) {
    // Unsave
    user.savedPosts.splice(savedIndex, 1);
  } else {
    // Save
    user.savedPosts.push(postId);
  }

  await user.save();

  res.status(200).json(
    ApiResponse.success(
      savedIndex > -1 ? 'Post removed from saved.' : 'Post saved.',
      { isSaved: savedIndex === -1 }
    )
  );
});

/**
 * @desc    Get user's saved posts
 * @route   GET /api/posts/saved
 */
const getSavedPosts = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'savedPosts',
    populate: {
      path: 'author',
      select: 'name profileImage',
    },
  });

  res.status(200).json(
    ApiResponse.success('Saved posts fetched.', { posts: user.savedPosts })
  );
});

module.exports = {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  toggleSave,
  getSavedPosts,
};
