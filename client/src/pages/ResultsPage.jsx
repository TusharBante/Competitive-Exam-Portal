import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Award, 
  Calendar, 
  Target, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  BarChart2, 
  BookOpen, 
  Filter,
  CheckCircle2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { getTestHistory } from '../services/testService';
import { getPerformanceAnalytics } from '../services/profileService';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { formatDate, formatDuration } from '../utils/helpers';

const CATEGORIES = ['All', 'SSC', 'Banking', 'Railway', 'MPSC', 'UPSC', 'Other'];

const ResultsPage = () => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('All');
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [category, page]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (category !== 'All') params.category = category;

      const [histRes, analyticsRes] = await Promise.all([
        getTestHistory(params),
        getPerformanceAnalytics(),
      ]);

      if (histRes.success) {
        setHistory(histRes.data.history || histRes.data.attempts || []);
        setPagination(histRes.data.pagination || { totalPages: 1, total: 0 });
      }

      if (analyticsRes.success) {
        setAnalytics(analyticsRes.data);
      }
    } catch (err) {
      console.error('Error loading results:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trend chart data
  const trendData = [...history].reverse().map((item, idx) => ({
    name: item.testId?.title ? item.testId.title.slice(0, 8) + '..' : `Test ${idx + 1}`,
    score: item.totalScore,
    accuracy: Math.round(item.accuracy || 0),
    date: formatDate(item.completedAt || item.startedAt),
  }));

  // Subject performance bar chart
  const subjectData = (analytics?.subjectPerformance || []).map((sub) => ({
    subject: sub.subject,
    avgScore: Math.round(sub.averageScore || 0),
    tests: sub.attemptsCount || 0,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Performance Analytics & Results
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Historical breakdown of all your attempted mock tests with trend charts and subject accuracy.
        </p>
      </div>

      {/* Analytics Charts Section (Only if attempts exist) */}
      {trendData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Score Trend Across Attempts
            </h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Performance Bar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              Subject Performance
            </h2>
            <div className="h-64 w-full">
              {subjectData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="subject" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                      }}
                    />
                    <Bar dataKey="avgScore" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Take tests across different subjects to see performance distribution.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Category Filter:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  category === cat
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Attempts List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 text-sm">Attempt Records</h2>
          <span className="text-xs font-semibold text-slate-400">{history.length} records</span>
        </div>

        {loading ? (
          <div className="py-12">
            <Loader text="Loading attempt history..." />
          </div>
        ) : history.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {history.map((att) => (
              <div
                key={att._id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                      {att.testId?.category || 'General'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {formatDate(att.completedAt || att.startedAt)}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {att.testId?.title || 'Competitive Mock Test'}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDuration(att.timeTaken)}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <Target className="w-3.5 h-3.5" />
                      Acc: {Math.round(att.accuracy || 0)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900">
                      {att.totalScore} <span className="text-xs font-normal text-slate-400">/ {att.maxScore || 100}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Completed
                    </span>
                  </div>

                  <Link
                    to={`/test/result/${att._id}`}
                    className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold transition"
                  >
                    View Details
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={Award}
              title="No test attempts found"
              description="You have not completed any mock tests in this category yet. Start one now to build your test history."
              actionText="Take a Mock Test"
              actionTo="/mock-tests"
            />
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={pagination.totalPages}
          onPageChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
};

export default ResultsPage;
