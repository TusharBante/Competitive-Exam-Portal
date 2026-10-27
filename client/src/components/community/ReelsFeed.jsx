import React, { useState, useEffect } from 'react';
import { Video, Plus, Sparkles } from 'lucide-react';
import { getReels } from '../../services/reelService';
import ReelCard from './ReelCard';
import ReelViewer from './ReelViewer';
import CreateReelModal from './CreateReelModal';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';

const ReelsFeed = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });
  const [selectedReelIndex, setSelectedReelIndex] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchReels();
  }, [page]);

  const fetchReels = async () => {
    try {
      setLoading(true);
      const res = await getReels({ page, limit: 12 });
      if (res.success) {
        setReels(res.data.reels || []);
        setPagination(res.data.pagination || { totalPages: 1, total: 0 });
      }
    } catch (err) {
      console.error('Failed to load reels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReelCreated = (newReel) => {
    setReels([newReel, ...reels]);
  };

  const handleReelDeleted = (deletedId) => {
    setReels(reels.filter((r) => r._id !== deletedId));
    setSelectedReelIndex(null);
  };

  const handleNext = () => {
    if (selectedReelIndex < reels.length - 1) {
      setSelectedReelIndex(selectedReelIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedReelIndex > 0) {
      setSelectedReelIndex(selectedReelIndex - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Quick Learning Reels
          </h2>
          <p className="text-xs text-slate-500">Short video explanations, shortcuts, and memory mnemonics.</p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-100 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Upload Reel
        </button>
      </div>

      {/* Grid of Reels */}
      {loading ? (
        <div className="py-12">
          <Loader text="Loading educational reels..." />
        </div>
      ) : reels.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {reels.map((reel, idx) => (
            <ReelCard
              key={reel._id}
              reel={reel}
              onClick={() => setSelectedReelIndex(idx)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Video}
          title="No reels published yet"
          description="Upload a short vertical video teaching a concept or shortcut to kickstart the feed."
          actionText="Upload Reel"
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

      {/* Fullscreen Reel Viewer */}
      {selectedReelIndex !== null && reels[selectedReelIndex] && (
        <ReelViewer
          reel={reels[selectedReelIndex]}
          onClose={() => setSelectedReelIndex(null)}
          onReelDeleted={handleReelDeleted}
          onNext={selectedReelIndex < reels.length - 1 ? handleNext : null}
          onPrev={selectedReelIndex > 0 ? handlePrev : null}
        />
      )}

      {/* Upload Reel Modal */}
      <CreateReelModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onReelCreated={handleReelCreated}
      />
    </div>
  );
};

export default ReelsFeed;
