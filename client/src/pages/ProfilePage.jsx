import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  BookOpen, 
  Trophy, 
  Award, 
  Calendar, 
  Edit3, 
  Lock, 
  LogOut, 
  Bookmark, 
  MessageSquare, 
  Video, 
  Clock, 
  Sparkles,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getProfile, getUserPosts, getUserReels } from '../services/profileService';
import { getSavedPosts } from '../services/postService';
import { getSavedReels } from '../services/reelService';
import { getTestHistory } from '../services/testService';
import EditProfileModal from '../components/profile/EditProfileModal';
import ChangePasswordModal from '../components/profile/ChangePasswordModal';
import PostCard from '../components/community/PostCard';
import ReelCard from '../components/community/ReelCard';
import ReelViewer from '../components/community/ReelViewer';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { formatDate } from '../utils/helpers';
import { Link, useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'reels' | 'savedPosts' | 'savedReels' | 'tests'

  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedReels, setSavedReels] = useState([]);
  const [testHistory, setTestHistory] = useState([]);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);

  useEffect(() => {
    loadProfileDetails();
  }, []);

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadProfileDetails = async () => {
    try {
      setLoading(true);
      const res = await getProfile();
      if (res.success) {
        setProfileData(res.data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async (tab) => {
    try {
      if (tab === 'posts') {
        const res = await getUserPosts();
        if (res.success) setPosts(res.data.posts || []);
      } else if (tab === 'reels') {
        const res = await getUserReels();
        if (res.success) setReels(res.data.reels || []);
      } else if (tab === 'savedPosts') {
        const res = await getSavedPosts();
        if (res.success) setSavedPosts(res.data.posts || []);
      } else if (tab === 'savedReels') {
        const res = await getSavedReels();
        if (res.success) setSavedReels(res.data.reels || []);
      } else if (tab === 'tests') {
        const res = await getTestHistory({ limit: 10 });
        if (res.success) setTestHistory(res.data.history || res.data.attempts || []);
      }
    } catch (err) {
      console.error(`Error loading tab ${tab}:`, err);
    }
  };

  const handleProfileUpdated = (updatedUser) => {
    updateUser(updatedUser);
    setProfileData((prev) => ({
      ...prev,
      user: { ...prev.user, ...updatedUser },
    }));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="p-8">
        <Loader text="Loading candidate profile..." />
      </div>
    );
  }

  const currentUser = profileData?.user || user;
  const stats = profileData?.stats || {};

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            {currentUser?.profileImage?.url ? (
              <img
                src={currentUser.profileImage.url}
                alt={currentUser.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-indigo-50 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-extrabold text-3xl shadow-md border-4 border-indigo-50">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-2">
                  {currentUser?.name} <Sparkles className="w-4 h-4 text-amber-500" />
                </h1>
                <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5" />
                  {currentUser?.email}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setEditModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
                <button
                  onClick={() => setPasswordModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Password
                </button>
              </div>
            </div>

            {/* Bio */}
            {currentUser?.bio && (
              <p className="text-sm text-slate-700 pt-1 leading-relaxed">
                {currentUser.bio}
              </p>
            )}

            {/* Education & Joined */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-500">
              {currentUser?.education && (
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                  {currentUser.education}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {formatDate(currentUser?.createdAt)}
              </span>
            </div>

            {/* Exam Interests tags */}
            {currentUser?.examInterests && currentUser.examInterests.length > 0 && (
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-400">Targeting:</span>
                {currentUser.examInterests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-100">
          <div className="text-center p-3 rounded-2xl bg-slate-50">
            <div className="text-xl font-black text-slate-900">{stats.testsAttempted || 0}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Tests Taken</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-slate-50">
            <div className="text-xl font-black text-indigo-600">
              {stats.averageScore ? Number(stats.averageScore).toFixed(1) : '0.0'}
            </div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Avg Score</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-slate-50">
            <div className="text-xl font-black text-slate-900">{stats.postsCount || 0}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Posts</div>
          </div>
          <div className="text-center p-3 rounded-2xl bg-slate-50">
            <div className="text-xl font-black text-slate-900">{stats.reelsCount || 0}</div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">Reels</div>
          </div>
        </div>
      </div>

      {/* Profile Content Tabs */}
      <div className="space-y-6">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {[
            { id: 'posts', label: 'My Posts', icon: MessageSquare },
            { id: 'reels', label: 'My Reels', icon: Video },
            { id: 'savedPosts', label: 'Saved Posts', icon: Bookmark },
            { id: 'savedReels', label: 'Saved Reels', icon: Bookmark },
            { id: 'tests', label: 'Test History', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div>
          {/* My Posts */}
          {activeTab === 'posts' && (
            posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostDeleted={(id) => setPosts(posts.filter((p) => p._id !== id))}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="No posts yet"
                description="Share study materials and questions in the Community tab."
                actionText="Explore Community"
                actionTo="/community"
              />
            )
          )}

          {/* My Reels */}
          {activeTab === 'reels' && (
            reels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {reels.map((reel) => (
                  <ReelCard
                    key={reel._id}
                    reel={reel}
                    onClick={() => setSelectedReel(reel)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Video}
                title="No reels uploaded"
                description="Share helpful shortcuts and quick revision clips with other aspirants."
                actionText="Upload Reel"
                actionTo="/community"
              />
            )
          )}

          {/* Saved Posts */}
          {activeTab === 'savedPosts' && (
            savedPosts.length > 0 ? (
              <div className="space-y-4">
                {savedPosts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    onPostDeleted={(id) => setSavedPosts(savedPosts.filter((p) => p._id !== id))}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bookmark}
                title="No saved posts"
                description="Bookmark insightful community discussions to review them anytime here."
                actionText="Browse Community"
                actionTo="/community"
              />
            )
          )}

          {/* Saved Reels */}
          {activeTab === 'savedReels' && (
            savedReels.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {savedReels.map((reel) => (
                  <ReelCard
                    key={reel._id}
                    reel={reel}
                    onClick={() => setSelectedReel(reel)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bookmark}
                title="No saved reels"
                description="Save video shortcuts and mnemonic reels for quick revision before exams."
                actionText="Browse Reels"
                actionTo="/community"
              />
            )
          )}

          {/* Test History */}
          {activeTab === 'tests' && (
            testHistory.length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                {testHistory.map((att) => (
                  <div
                    key={att._id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                          {att.testId?.category || 'Exam'}
                        </span>
                        <span className="text-xs text-slate-400">
                          {formatDate(att.completedAt || att.startedAt)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">{att.testId?.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Accuracy: <strong className="text-emerald-600">{Math.round(att.accuracy || 0)}%</strong>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-bold text-slate-900">
                        {att.totalScore} / {att.maxScore || 100}
                      </div>
                      <Link
                        to={`/test/result/${att._id}`}
                        className="text-xs font-semibold text-indigo-600 hover:underline block mt-0.5"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={BookOpen}
                title="No test attempts"
                description="Start practicing mock tests to build your scorecard."
                actionText="Start Test"
                actionTo="/mock-tests"
              />
            )
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={currentUser}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />

      {/* Reel Viewer */}
      {selectedReel && (
        <ReelViewer
          reel={selectedReel}
          onClose={() => setSelectedReel(null)}
          onReelDeleted={(id) => {
            setReels(reels.filter((r) => r._id !== id));
            setSavedReels(savedReels.filter((r) => r._id !== id));
          }}
        />
      )}
    </div>
  );
};

export default ProfilePage;
