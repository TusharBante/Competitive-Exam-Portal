const mongoose = require('mongoose');

const mockTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Test title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['SSC', 'Banking', 'Railway', 'MPSC', 'UPSC', 'Other'],
    },
    subject: {
      type: String,
      default: '',
    },
    duration: {
      type: Number,
      required: [true, 'Duration in minutes is required'],
    },
    totalQuestions: {
      type: Number,
      required: [true, 'Total questions count is required'],
    },
    maxMarks: {
      type: Number,
      required: [true, 'Maximum marks is required'],
    },
    negativeMarking: {
      type: Number,
      default: 0.25,
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty is required'],
      enum: ['Easy', 'Medium', 'Hard'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual populate: questions
mockTestSchema.virtual('questions', {
  ref: 'Question',
  localField: '_id',
  foreignField: 'testId',
});

const MockTest = mongoose.model('MockTest', mockTestSchema);

module.exports = MockTest;
