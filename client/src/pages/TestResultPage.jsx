import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Clock, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  ArrowLeft, 
  BookOpen, 
  Sparkles,
  BarChart2
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { getAttemptResult } from '../services/testService';
import Loader from '../components/common/Loader';
import { formatDuration } from '../utils/helpers';

const TestResultPage = () => {
  const { attemptId } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  useEffect(() => {
    fetchResult();
  }, [attemptId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await getAttemptResult(attemptId);
      if (res.success) {
        setResult(res.data);
      }
    } catch (err) {
      console.error('Error fetching result:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Loader text="Generating detailed test analysis..." />
      </div>
    );
  }

  if (!result || !result.attempt) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600">Test result not found.</p>
        <Link to="/results" className="mt-4 inline-block text-indigo-600 font-semibold">
          Return to Results
        </Link>
      </div>
    );
  }

  const { attempt, test, questionsWithSolutions = [] } = result;

  const pieData = [
    { name: 'Correct', value: attempt.correctAnswers || 0, color: '#10b981' },
    { name: 'Incorrect', value: attempt.incorrectAnswers || 0, color: '#f43f5e' },
    { name: 'Unanswered', value: attempt.unanswered || 0, color: '#cbd5e1' },
  ];

  const scorePercentage = Math.round(((attempt.totalScore || 0) / (attempt.maxScore || 1)) * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/results"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Results History
        </Link>
        <Link
          to="/mock-tests"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Take Another Test
        </Link>
      </div>

      {/* Main Scorecard Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
              {test?.category || 'General'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {test?.title || 'Mock Test Examination'}
            </h1>
            <p className="text-xs text-slate-500">
              Performance scorecard and question-wise answer key breakdown.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Time Taken: {formatDuration(attempt.timeTaken)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Target className="w-4 h-4 text-emerald-500" />
                <span>Accuracy: {Math.round(attempt.accuracy || 0)}%</span>
              </div>
            </div>
          </div>

          {/* Big Score Badge */}
          <div className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100 shrink-0">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-indigo-600">
                {attempt.totalScore}
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Out of {attempt.maxScore} Marks
              </div>
            </div>
            <div className="h-10 w-px bg-slate-200" />
            <div className="text-center">
              <div className="text-3xl sm:text-4xl font-black text-slate-800">
                {scorePercentage}%
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Score %
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Breakdown Row with Chart */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Correct</div>
            <div className="text-xl font-bold text-slate-800">{attempt.correctAnswers || 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Incorrect</div>
            <div className="text-xl font-bold text-slate-800">{attempt.incorrectAnswers || 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
            <MinusCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Unanswered</div>
            <div className="text-xl font-bold text-slate-800">{attempt.unanswered || 0}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase">Accuracy</div>
            <div className="text-xl font-bold text-slate-800">{Math.round(attempt.accuracy || 0)}%</div>
          </div>
        </div>
      </div>

      {/* Answer Key & In-Depth Explanations */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Question-wise Solutions & Explanations
            </h2>
            <p className="text-xs text-slate-500">
              Review correct answers, your choices, and step-by-step reasoning.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            {questionsWithSolutions.length} Questions
          </span>
        </div>

        <div className="space-y-4">
          {questionsWithSolutions.map((item, idx) => {
            const isExpanded = expandedQuestion === idx;
            const isCorrect = item.isCorrect;
            const isUnanswered = item.selectedOption === null || item.selectedOption === undefined;

            let badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
            let badgeText = 'Incorrect';
            if (isCorrect) {
              badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              badgeText = 'Correct';
            } else if (isUnanswered) {
              badgeColor = 'bg-slate-100 text-slate-600 border-slate-200';
              badgeText = 'Unanswered';
            }

            return (
              <div
                key={item.questionId || idx}
                className="border border-slate-200 rounded-2xl overflow-hidden transition"
              >
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-800 line-clamp-1">
                      {item.questionText}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${badgeColor}`}>
                      {badgeText}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-5 bg-slate-50/70 border-t border-slate-100 space-y-4">
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      {item.questionText}
                    </p>

                    {/* Options Breakdown */}
                    <div className="space-y-2">
                      {item.options &&
                        item.options.map((opt, oIdx) => {
                          const isOptionCorrect = opt.isCorrect;
                          const isUserPick = item.selectedOption === oIdx;

                          let optClass = 'bg-white border-slate-200 text-slate-700';
                          if (isOptionCorrect) {
                            optClass = 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold';
                          } else if (isUserPick && !isOptionCorrect) {
                            optClass = 'bg-rose-50 border-rose-300 text-rose-900 font-semibold';
                          }

                          return (
                            <div
                              key={oIdx}
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs sm:text-sm ${optClass}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt.text}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                {isUserPick && (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800 font-bold">
                                    Your Choice
                                  </span>
                                )}
                                {isOptionCorrect && (
                                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-600 text-white font-bold">
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Explanation */}
                    {item.explanation && (
                      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs sm:text-sm text-amber-900">
                        <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-800">
                          <Sparkles className="w-3.5 h-3.5" /> Explanation:
                        </div>
                        <p className="leading-relaxed">{item.explanation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TestResultPage;
