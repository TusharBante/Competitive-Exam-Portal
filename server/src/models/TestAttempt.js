const mongoose = require('mongoose');

const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTest',
      required: [true, 'Test ID is required'],
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        selectedOption: {
          type: Number,
          default: null,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
        marksAwarded: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalScore: {
      type: Number,
      default: 0,
    },
    maxScore: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
    },
    unanswered: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number, // seconds
      default: 0,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed'],
      default: 'in-progress',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index on userId and testId
testAttemptSchema.index({ userId: 1, testId: 1 });

// Compound index to prevent duplicate active attempts
testAttemptSchema.index(
  { userId: 1, testId: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'in-progress' },
  }
);

const TestAttempt = mongoose.model('TestAttempt', testAttemptSchema);

module.exports = TestAttempt;
