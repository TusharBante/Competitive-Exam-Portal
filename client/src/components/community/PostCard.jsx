import React, { useState } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Bookmark, 
  Trash2, 
  Send, 
  Share2, 
  MoreVertical 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toggleLike, addComment, deleteComment, toggleSave, deletePost } from '../../services/postService';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const PostCard = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSaved, setIsSaved] = useState(
    user?.savedPosts?.some((sp) => (typeof sp === 'string' ? sp === post._id : sp._id === post._id)) || false
  );
  const [submittingComment, setSubmittingComment] = useState(false);

  const isAuthor = user?._id === (post.author?._id || post.author);
  const hasLiked = likes.some((id) => (typeof id === 'string' ? id === user?._id : id._id === user?._id));

  const handleLike = async () => {
    try {
      const res = await toggleLike(post._id);
      if (res.success) {
        if (hasLiked) {
          setLikes(likes.filter((id) => (typeof id === 'string' ? id !== user?._id : id._id !== user?._id)));
        } else {
          setLikes([...likes, user._id]);
        }
      }
    } catch (err) {
      toast.error('Could not update like.');
    }
  };

  const handleSave = async () => {
    try {
      const res = await toggleSave(post._id);
      if (res.success) {
        setIsSaved(res.data.isSaved);
        toast.success(res.data.isSaved ? 'Post bookmarked.' : 'Post removed from bookmarks.');
      }
    } catch (err) {
      toast.error('Could not save post.');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setSubmittingComment(true);
      const res = await addComment(post._id, commentText.trim());
      if (res.success) {
        setComments(res.data.comments || []);
        setCommentText('');
        toast.success('Comment added.');
      }
    } catch (err) {
      toast.error('Failed to submit comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await deleteComment(post._id, commentId);
      if (res.success) {
        setComments(comments.filter((c) => c._id !== commentId));
        toast.success('Comment removed.');
      }
    } catch (err) {
      toast.error('Failed to delete comment.');
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await deletePost(post._id);
      if (res.success) {
        toast.success('Post deleted successfully.');
        if (onPostDeleted) onPostDeleted(post._id);
      }
    } catch (err) {
      toast.error('Could not delete post.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition hover:border-slate-300">
      {/* Header */}
      <div className="p-5 flex items-center justify-between pb-3">
        <div className="flex items-center gap-3">
          {post.author?.profileImage?.url ? (
            <img
              src={post.author.profileImage.url}
              alt={post.author?.name}
              className="w-10 h-10 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-bold text-sm">
              {post.author?.name ? post.author.name[0].toUpperCase() : 'U'}
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold text-slate-900">{post.author?.name || 'Aspirant'}</h4>
            <p className="text-xs text-slate-400">{formatDate(post.createdAt)}</p>
          </div>
        </div>

        {isAuthor && (
          <button
            onClick={handleDeletePost}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Delete post"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        {post.title && (
          <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">{post.title}</h3>
        )}
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Optional Attached Image */}
      {post.image?.url && (
        <div className="border-t border-b border-slate-100 bg-slate-50 max-h-96 overflow-hidden flex items-center justify-center">
          <img
            src={post.image.url}
            alt={post.title || 'Post attachment'}
            className="w-full h-auto max-h-96 object-contain"
          />
        </div>
      )}

      {/* Action Bar */}
      <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
        <div className="flex items-center gap-6">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 transition cursor-pointer ${
              hasLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600 text-slate-600'
            }`}
          >
            <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current text-rose-600' : ''}`} />
            <span>{likes.length}</span>
          </button>

          {/* Comment toggle */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 hover:text-indigo-600 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{comments.length}</span>
          </button>
        </div>

        {/* Bookmark */}
        <button
          onClick={handleSave}
          className={`flex items-center gap-1 transition cursor-pointer ${
            isSaved ? 'text-indigo-600' : 'hover:text-indigo-600 text-slate-400'
          }`}
          title={isSaved ? 'Saved' : 'Save post'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="bg-slate-50/70 p-5 border-t border-slate-100 space-y-4">
          {/* Add Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a constructive response..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Comment Items */}
          {comments.length > 0 ? (
            <div className="space-y-3 pt-2">
              {comments.map((c) => {
                const isCommentAuthor = user?._id === (c.author?._id || c.author);
                return (
                  <div key={c._id} className="flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                        {c.author?.name ? c.author.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-slate-800">{c.author?.name || 'Aspirant'}</span>
                        <p className="text-slate-600 mt-0.5 leading-relaxed">{c.content}</p>
                      </div>
                    </div>

                    {isCommentAuthor && (
                      <button
                        onClick={() => handleDeleteComment(c._id)}
                        className="text-slate-400 hover:text-rose-500 transition p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No comments yet. Start the conversation!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
