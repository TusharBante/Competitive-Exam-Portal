import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Bookmark, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  RotateCcw,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';
import { startTest, submitTest } from '../services/testService';
import Loader from '../components/common/Loader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import toast from 'react-hot-toast';

const TestPage = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [test, setTest] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Selected answers: { [questionId]: optionIndex }
  const [answers, setAnswers] = useState({});
  // Marked for review set: { [questionId]: boolean }
  const [marked, setMarked] = useState({});

  // Countdown timer in seconds
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    initiateTest();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testId]);

  const initiateTest = async () => {
    try {
      setLoading(true);
      const res = await startTest(testId);
      if (res.success) {
        const { test: testData, attempt: attemptData } = res.data;
        setTest(testData);
        setAttempt(attemptData);
        setQuestions(testData.questions || []);

        // Calculate timer duration
        const durationSec = (testData.duration || 60) * 60;
        setTimeLeft(durationSec);

        // Prepopulate existing answers if recovering an attempt
        if (attemptData.answers && attemptData.answers.length > 0) {
          const preAns = {};
          attemptData.answers.forEach((a) => {
            if (a.selectedOption !== null && a.selectedOption !== undefined) {
              preAns[a.questionId] = a.selectedOption;
            }
          });
          setAnswers(preAns);
        }

        // Start countdown
        startCountdown(durationSec);
      }
    } catch (err) {
      console.error('Error starting test:', err);
      toast.error(err.response?.data?.message || 'Could not start test');
      navigate('/mock-tests');
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = (durationInSeconds) => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleAutoSubmit = () => {
    toast.error('Time is up! Submitting your test automatically...');
    doSubmit();
  };

  const handleSelectOption = (qId, optionIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const handleClearOption = (qId) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
  };

  const toggleMarkForReview = (qId) => {
    setMarked((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const doSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      // Format answers payload
      const formattedAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedOption: answers[q._id] !== undefined ? answers[q._id] : null,
      }));

      const res = await submitTest(attempt._id, {
        answers: formattedAnswers,
        timeTaken: (test.duration * 60) - timeLeft,
      });

      if (res.success) {
        toast.success('Test submitted successfully!');
        navigate(`/test/result/${attempt._id}`);
      }
    } catch (err) {
      console.error('Failed to submit test:', err);
      toast.error(err.response?.data?.message || 'Submission error');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader text="Initializing secure test environment..." />
      </div>
    );
  }

  const currentQ = questions[currentIndex] || {};
  const currentQId = currentQ._id;
  const currentSelectedOpt = answers[currentQId];

  // Formatting mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeCritical = timeLeft < 300; // < 5 mins

  // Question stats counts
  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(marked).filter(Boolean).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans select-none">
      {/* Top Test Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shadow-xs sticky top-0 z-30">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full mr-2">
            {test?.category}
          </span>
          <span className="font-bold text-slate-800 text-base">{test?.title}</span>
        </div>

        <div className="flex items-center gap-6">
          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm shadow-xs transition-colors ${
              isTimeCritical
                ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-500' : 'text-slate-500'}`} />
            <span>{timeFormatted}</span>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs tracking-wide uppercase shadow-sm transition cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Test Layout (Left: Question area, Right: Navigation Palette) */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6">
        {/* Left Side: Question Display */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between overflow-hidden">
          {/* Question Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                Q{currentIndex + 1}
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Marks: <strong className="text-slate-700">+{currentQ.marks || 1}</strong> | Negative:{' '}
                <strong className="text-rose-600">-{test?.negativeMarking || 0.25}</strong>
              </span>
            </div>

            <button
              onClick={() => toggleMarkForReview(currentQId)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                marked[currentQId]
                  ? 'bg-amber-500 text-white border-amber-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {marked[currentQId] ? 'Marked for Review' : 'Mark for Review'}
            </button>
          </div>

          {/* Question Text & Options */}
          <div className="p-6 overflow-y-auto flex-1">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed mb-6">
              {currentQ.questionText}
            </h2>

            <div className="space-y-3">
              {currentQ.options &&
                currentQ.options.map((opt, oIdx) => {
                  const isSelected = currentSelectedOpt === oIdx;
                  return (
                    <div
                      key={oIdx}
                      onClick={() => handleSelectOption(currentQId, oIdx)}
                      className={`p-4 rounded-xl border-2 flex items-start gap-3.5 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition ${
                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <span className={`text-sm ${isSelected ? 'font-semibold text-indigo-950' : 'text-slate-700'}`}>
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Action Bar at Bottom */}
          <div className="p-4 sm:p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {currentSelectedOpt !== undefined && (
              <button
                onClick={() => handleClearOption(currentQId)}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear Response
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Question Navigation Palette */}
        <div className="w-full md:w-80 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between shrink-0">
          <div>
            <h3 className="font-bold text-sm text-slate-800 pb-3 border-b border-slate-100 mb-4">
              Question Palette
            </h3>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-5">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500" />
                <span className="text-slate-600">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-500" />
                <span className="text-slate-600">Marked ({markedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-200" />
                <span className="text-slate-600">Not Visited</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-rose-100 border border-rose-300" />
                <span className="text-slate-600">Unanswered ({unansweredCount})</span>
              </div>
            </div>

            {/* Question Buttons Matrix */}
            <div className="grid grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1">
              {questions.map((q, idx) => {
                const qId = q._id;
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[qId] !== undefined;
                const isMarked = marked[qId];

                let btnClass = 'bg-slate-100 text-slate-600 border-slate-200';
                if (isAnswered) {
                  btnClass = 'bg-emerald-500 text-white border-emerald-600 font-bold';
                } else if (isMarked) {
                  btnClass = 'bg-amber-500 text-white border-amber-600 font-bold';
                }

                if (isCurrent) {
                  btnClass += ' ring-2 ring-indigo-600 ring-offset-2';
                }

                return (
                  <button
                    key={qId}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-9 rounded-lg border text-xs font-semibold flex items-center justify-center transition cursor-pointer ${btnClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Submit Block */}
          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => setShowConfirmModal(true)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-indigo-100 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Send className="w-3.5 h-3.5" />
              Complete Test
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={doSubmit}
        title="Submit Test Attempt?"
        message={`You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to finalize your submission? You cannot alter answers once submitted.`}
        confirmText="Yes, Submit Test"
        cancelText="Continue Test"
      />
    </div>
  );
};

export default TestPage;
