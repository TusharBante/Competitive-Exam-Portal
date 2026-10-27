import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Send, 
  Trash2, 
  ChevronUp, 
  ChevronDown 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toggleLike, addComment, deleteComment, toggleSave, deleteReel, shareReel } from '../../services/reelService';
import toast from 'react-hot-toast';

const ReelViewer = ({ reel, onClose, onReelUpdated, onReelDeleted, onNext, onPrev }) => {
  const { user } = useAuth();
  const videoRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likes, setLikes] = useState(reel?.likes || []);
  const [comments, setComments] = useState(reel?.comments || []);
  const [isSaved, setIsSaved] = useState(
    user?.savedReels?.some((sr) => (typeof sr === 'string' ? sr === reel?._id : sr._id === reel?._id)) || false
  );
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const isCreator = user?._id === (reel?.creator?._id || reel?.creator);
  const hasLiked = likes.some((id) => (typeof id === 'string' ? id === user?._id : id._id === user?._id));

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => setIsPlaying(false));
      setIsPlaying(true);
    }
    setLikes(reel?.likes || []);
    setComments(reel?.comments || []);
  }, [reel]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const res = await toggleLike(reel._id);
      if (res.success) {
        if (hasLiked) {
          setLikes(likes.filter((id) => (typeof id === 'string' ? id !== user?._id : id._id !== user?._id)));
        } else {
          setLikes([...likes, user._id]);
        }
      }
    } catch (err) {
      toast.error('Could not like reel.');
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      const res = await toggleSave(reel._id);
      if (res.success) {
        setIsSaved(res.data.isSaved);
        toast.success(res.data.isSaved ? 'Reel saved.' : 'Removed from saved reels.');
      }
    } catch (err) {
      toast.error('Failed to save reel.');
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/community?reel=${reel._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.caption,
          text: 'Watch this educational reel on ExamPrep Portal!',
          url: shareUrl,
        });
      } catch (err) {
        // Fallback to copy
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.success('Reel link copied to clipboard!');
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await addComment(reel._id, commentText.trim());
      if (res.success) {
        setComments(res.data.comments || []);
        setCommentText('');
        toast.success('Comment posted.');
      }
    } catch (err) {
      toast.error('Failed to add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await deleteComment(reel._id, commentId);
      if (res.success) {
        setComments(comments.filter((c) => c._id !== commentId));
        toast.success('Comment deleted.');
      }
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  const handleDeleteReel = async () => {
    if (!window.confirm('Are you sure you want to delete this reel?')) return;
    try {
      const res = await deleteReel(reel._id);
      if (res.success) {
        toast.success('Reel deleted.');
        if (onReelDeleted) onReelDeleted(reel._id);
        onClose();
      }
    } catch (err) {
      toast.error('Could not delete reel.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-40 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Reels Container */}
      <div className="relative w-full max-w-sm h-[90vh] rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col justify-between">
        {/* Video Player */}
        <div onClick={togglePlay} className="absolute inset-0 cursor-pointer">
          <video
            ref={videoRef}
            src={reel.videoUrl}
            className="w-full h-full object-cover"
            loop
            playsInline
            muted={isMuted}
          />

          {/* Pause overlay icon */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
            </div>
          )}

          {/* Gradient for caption visibility */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
        </div>

        {/* Top Controls: Sound Toggle */}
        <div className="relative z-20 p-4 flex items-center justify-between">
          <button
            onClick={toggleMute}
            className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-xs transition"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {isCreator && (
            <button
              onClick={handleDeleteReel}
              className="p-2 rounded-full bg-black/40 text-rose-400 hover:bg-rose-500 hover:text-white backdrop-blur-xs transition"
              title="Delete reel"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Next/Prev Navigation Buttons (desktop) */}
        <div className="absolute -left-16 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3">
          {onPrev && (
            <button
              onClick={onPrev}
              className="p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition"
            >
              <ChevronUp className="w-6 h-6" />
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              className="p-3 rounded-full bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Right Vertical Action Bar */}
        <div className="absolute right-3 bottom-20 z-20 flex flex-col items-center gap-5 text-white">
          {/* Like */}
          <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
            <div className={`p-3 rounded-full bg-black/40 backdrop-blur-md transition ${hasLiked ? 'text-rose-500' : 'group-hover:bg-white/20'}`}>
              <Heart className={`w-6 h-6 ${hasLiked ? 'fill-current text-rose-500' : ''}`} />
            </div>
            <span className="text-[11px] font-bold">{likes.length}</span>
          </button>

          {/* Comments */}
          <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 group">
            <div className="p-3 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-white/20 transition">
              <MessageSquare className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold">{comments.length}</span>
          </button>

          {/* Bookmark */}
          <button onClick={handleSave} className="flex flex-col items-center gap-1 group">
            <div className={`p-3 rounded-full bg-black/40 backdrop-blur-md transition ${isSaved ? 'text-indigo-400' : 'group-hover:bg-white/20'}`}>
              <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current text-indigo-400' : ''}`} />
            </div>
            <span className="text-[11px] font-bold">Save</span>
          </button>

          {/* Share */}
          <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
            <div className="p-3 rounded-full bg-black/40 backdrop-blur-md group-hover:bg-white/20 transition">
              <Share2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold">Share</span>
          </button>
        </div>

        {/* Bottom Details (Creator & Caption) */}
        <div className="relative z-20 p-5 text-white pr-16 pointer-events-none">
          <div className="flex items-center gap-2 mb-2 pointer-events-auto">
            {reel.creator?.profileImage?.url ? (
              <img
                src={reel.creator.profileImage.url}
                alt={reel.creator.name}
                className="w-8 h-8 rounded-full object-cover border border-white/50"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {reel.creator?.name ? reel.creator.name[0].toUpperCase() : 'U'}
              </div>
            )}
            <span className="font-bold text-sm drop-shadow-sm">{reel.creator?.name || 'Creator'}</span>
          </div>

          <p className="text-xs font-medium leading-relaxed drop-shadow-md text-slate-100 line-clamp-3">
            {reel.caption}
          </p>

          {reel.hashtags && reel.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {reel.hashtags.map((tag, idx) => (
                <span key={idx} className="text-[11px] font-semibold text-indigo-300 drop-shadow-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Comments Overlay Sheet */}
        {showComments && (
          <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl z-30 flex flex-col justify-between p-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <h4 className="text-sm font-bold text-white">Comments ({comments.length})</h4>
              <button onClick={() => setShowComments(false)} className="p-1 rounded text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments list */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {comments.length > 0 ? (
                comments.map((c) => {
                  const isCommentAuthor = user?._id === (c.author?._id || c.author);
                  return (
                    <div key={c._id} className="flex items-start justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-indigo-400">{c.author?.name || 'Aspirant'}</span>
                        <p className="text-slate-300 mt-0.5">{c.content}</p>
                      </div>
                      {isCommentAuthor && (
                        <button
                          onClick={() => handleDeleteComment(c._id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 text-center py-8">No comments yet. Be first to comment!</p>
              )}
            </div>

            {/* Comment input form */}
            <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-700 flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelViewer;
