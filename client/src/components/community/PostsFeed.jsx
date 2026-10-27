import React, { useState, useEffect } from 'react';
import { Plus, Flame, Clock, MessageSquare } from 'lucide-react';
import { getPosts } from '../../services/postService';
import PostCard from './PostCard';
import CreatePostModal from './CreatePostModal';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';

const PostsFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [sort, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await getPosts({ page, limit: 10, sort });
      if (res.success) {
        setPosts(res.data.posts || []);
        setPagination(res.data.pagination || { totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  const handlePostDeleted = (deletedId) => {
    setPosts(posts.filter((p) => p._id !== deletedId));
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Sort + Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Sort Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSort('newest');
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              sort === 'newest'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Newest First
          </button>
          <button
            onClick={() => {
              setSort('popular');
              setPage(1);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              sort === 'popular'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            Most Popular
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-100 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Share Exam Update
        </button>
      </div>

      {/* Posts Feed */}
      {loading ? (
        <div className="py-12">
          <Loader text="Loading community discussions..." />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-5">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={MessageSquare}
          title="No discussions yet"
          description="Be the first student to create a post and start learning together with the community."
          actionText="Create Post"
          onAction={() => setCreateModalOpen(true)}
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

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default PostsFeed;
