const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTest',
      required: [true, 'Test ID is required'],
    },
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
    },
    options: [
      {
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true, default: false },
      },
    ],
    explanation: {
      type: String,
      default: '',
    },
    marks: {
      type: Number,
      default: 1,
    },
    questionNumber: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index on testId for efficient querying
questionSchema.index({ testId: 1 });

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
