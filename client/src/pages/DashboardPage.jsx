import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Trophy, 
  Target, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  Play, 
  MessageSquare, 
  Sparkles,
  ChevronRight,
  Flame,
  Award,
  AlertCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { getDashboardStats, getPerformanceChart } from '../services/dashboardService';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/helpers';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, chartRes] = await Promise.all([
        getDashboardStats(),
        getPerformanceChart(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (chartRes.success) {
        // Format chart items for recharts
        const rawChart = Array.isArray(chartRes.data)
          ? chartRes.data
          : (chartRes.data?.chartData || []);
        const formattedChart = rawChart.map((item, idx) => ({
          name: item.testTitle ? item.testTitle.slice(0, 10) + '...' : `Test ${idx + 1}`,
          score: item.score || 0,
          accuracy: Math.round(item.accuracy || 0),
          date: item.date ? formatDate(item.date) : '',
        }));
        setChartData(formattedChart);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Loader text="Loading your performance dashboard..." />
      </div>
    );
  }

  const { overview, recentResults = [], recommendedTests = [], recentPosts = [] } = stats || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-900 text-white p-6 sm:p-8 shadow-xl shadow-indigo-100">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-100 text-xs font-semibold mb-3">
            <Flame className="w-4 h-4 text-amber-400" />
            Consistency is the key to cracking exams
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Aspirant'}! 👋
          </h1>
          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Your exam preparation dashboard is up to date. Keep pushing your limits, take mock tests regularly, and analyze your weak spots.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/mock-tests"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm shadow-md hover:bg-indigo-50 transition"
            >
              <Play className="w-4 h-4 fill-current" />
              Take a Mock Test
            </Link>
            <Link
              to="/results"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-xs transition border border-white/20"
            >
              View Detailed Analytics
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tests Attempted</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{overview?.totalAttempts || 0}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Score</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {overview?.averageScore ? Number(overview.averageScore).toFixed(1) : '0.0'}
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Accuracy</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {overview?.averageAccuracy ? Math.round(overview.averageAccuracy) : 0}%
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Latest Score</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">
              {recentResults.length > 0 ? recentResults[0].totalScore : '--'}
            </h3>
          </div>
        </div>
      </div>

      {/* Performance Analytics Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Score & Accuracy Progression
            </h2>
            <p className="text-xs text-slate-500">Track your score improvements across recent test attempts</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-3 h-3 rounded-full bg-indigo-600" />
              Score
            </div>
            <div className="flex items-center gap-1.5 text-emerald-500">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Accuracy (%)
            </div>
          </div>
        </div>

        <div className="mt-6 h-72 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#4f46e5' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6">
              <div className="max-w-xs">
                <Target className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No test attempts yet</p>
                <p className="text-xs text-slate-400 mt-1">Take your first mock test to unlock real-time performance analytics.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Grid: Recent Results & Recommended Mock Tests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Results */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                Recent Test Attempts
              </h2>
              <Link to="/results" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentResults.length > 0 ? (
              <div className="space-y-3">
                {recentResults.map((att) => (
                  <div
                    key={att._id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-800 truncate">
                        {att.testId?.title || 'Competitive Mock Test'}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span>{formatDate(att.completedAt || att.startedAt)}</span>
                        <span>•</span>
                        <span className="text-indigo-600 font-medium">Acc: {Math.round(att.accuracy || 0)}%</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-slate-900">
                        {att.totalScore} <span className="text-xs font-normal text-slate-400">/ {att.maxScore || 100}</span>
                      </div>
                      <Link
                        to={`/test/result/${att._id}`}
                        className="text-xs font-semibold text-indigo-600 hover:underline block mt-0.5"
                      >
                        Review Solution
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No tests attempted"
                description="Start with a beginner mock test to evaluate your readiness."
                actionText="Explore Tests"
                actionTo="/mock-tests"
              />
            )}
          </div>
        </div>

        {/* Recommended Tests */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                Recommended For You
              </h2>
              <Link to="/mock-tests" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                Explore All <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recommendedTests.length > 0 ? (
              <div className="space-y-3">
                {recommendedTests.map((t) => (
                  <div
                    key={t._id}
                    className="p-3.5 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-slate-50 transition flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                          {t.category}
                        </span>
                        <span className="text-xs text-slate-400">• {t.subject}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 mt-1">{t.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {t.duration} mins</span>
                        <span>•</span>
                        <span>{t.totalQuestions} Questions</span>
                      </div>
                    </div>
                    <Link
                      to={`/test/${t._id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition shrink-0"
                    >
                      Start
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="All caught up!"
                description="Browse our comprehensive mock tests catalogue to practice more."
                actionText="Browse Tests"
                actionTo="/mock-tests"
              />
            )}
          </div>
        </div>
      </div>

      {/* Community Feed Sneak Peek */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Active Community Discussions
          </h2>
          <Link to="/community" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            Join Discussions <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPosts.map((post) => (
              <Link
                key={post._id}
                to="/community"
                className="p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/10 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {post.author?.name ? post.author.name[0].toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{post.author?.name}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{post.title || post.content}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{post.content}</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-3 pt-3 border-t border-slate-50">
                  <span>❤️ {post.likes?.length || 0} likes</span>
                  <span>💬 {post.comments?.length || 0} comments</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No community posts yet. Be the first to share an exam tip!</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
