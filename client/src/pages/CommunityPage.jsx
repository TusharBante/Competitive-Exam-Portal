import React, { useState } from 'react';
import { MessageSquare, Video, Users, Sparkles } from 'lucide-react';
import PostsFeed from '../components/community/PostsFeed';
import ReelsFeed from '../components/community/ReelsFeed';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'reels'

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          Aspirant Community <Sparkles className="w-5 h-5 text-amber-500" />
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Connect, solve doubts, and learn together with fellow competitive examination candidates.
        </p>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'posts'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Community Posts
        </button>

        <button
          onClick={() => setActiveTab('reels')}
          className={`flex items-center gap-2 py-3 px-6 text-sm font-bold border-b-2 transition cursor-pointer ${
            activeTab === 'reels'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Video className="w-4 h-4" />
          Learning Reels
        </button>
      </div>

      {/* Active Tab Feed */}
      <div>
        {activeTab === 'posts' ? <PostsFeed /> : <ReelsFeed />}
      </div>
    </div>
  );
};

export default CommunityPage;
