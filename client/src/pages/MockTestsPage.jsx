import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  HelpCircle, 
  Award, 
  Search, 
  Filter, 
  AlertTriangle,
  Play, 
  ChevronRight,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { getTests } from '../services/testService';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';

const CATEGORIES = ['All', 'SSC', 'Banking', 'Railway', 'MPSC', 'UPSC', 'Other'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const MockTestsPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  useEffect(() => {
    fetchTests();
  }, [category, difficulty, page]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 9 };
      if (category !== 'All') params.category = category;
      if (difficulty !== 'All') params.difficulty = difficulty;
      if (search.trim()) params.search = search.trim();

      const res = await getTests(params);
      if (res.success) {
        setTests(res.data.tests || []);
        setPagination(res.data.pagination || { totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTests();
  };

  const getDifficultyBadge = (diff) => {
    switch (diff) {
      case 'Easy':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Easy</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Medium</span>;
      case 'Hard':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Hard</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Competitive Mock Tests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Simulate actual exam conditions with timed sectional tests and negative marking.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search exams or subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition"
          />
        </form>
      </div>

      {/* Categories & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                category === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Difficulty Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Difficulty:</span>
          <select
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
            className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <div className="py-12">
          <Loader text="Loading mock tests catalogue..." />
        </div>
      ) : tests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <div
              key={test._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:shadow-lg hover:border-indigo-200 transition-all group"
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                    {test.category}
                  </span>
                  {getDifficultyBadge(test.difficulty)}
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                  {test.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {test.description || 'Comprehensive mock test designed according to latest exam syllabus and pattern.'}
                </p>

                {/* Subject */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Subject:</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-medium">
                    {test.subject || 'General Studies'}
                  </span>
                </div>

                {/* Test details grid */}
                <div className="grid grid-cols-3 gap-2 mt-3 p-3 bg-slate-50 rounded-xl text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Questions</div>
                    <div className="text-sm font-bold text-slate-800">{test.totalQuestions}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Duration</div>
                    <div className="text-sm font-bold text-slate-800">{test.duration} m</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-medium">Max Marks</div>
                    <div className="text-sm font-bold text-slate-800">{test.maxMarks}</div>
                  </div>
                </div>

                {/* Negative marking note */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-amber-700 bg-amber-50/70 p-2 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>Negative marking: -{test.negativeMarking} per wrong answer</span>
                </div>
              </div>

              {/* Start button */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => navigate(`/test/${test._id}`)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Start Test Now
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No mock tests found"
          description="Try selecting a different exam category or clear your search filters."
          actionText="Show All Tests"
          onAction={() => {
            setCategory('All');
            setDifficulty('All');
            setSearch('');
          }}
        />
      )}

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

export default MockTestsPage;
