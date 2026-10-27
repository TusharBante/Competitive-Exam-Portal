const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    caption: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    hashtags: {
      type: [String],
      default: [],
    },
    videoUrl: {
      type: String,
      required: [true, 'Video URL is required'],
    },
    videoPublicId: {
      type: String,
      default: '',
    },
    thumbnail: {
      type: String,
      default: '',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
reelSchema.index({ creator: 1 });
reelSchema.index({ createdAt: -1 });

const Reel = mongoose.model('Reel', reelSchema);

module.exports = Reel;
