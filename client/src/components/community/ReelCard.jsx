import React from 'react';
import { Play, Heart, MessageSquare } from 'lucide-react';

const ReelCard = ({ reel, onClick }) => {
  return (
    <div
      onClick={() => onClick(reel)}
      className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-900 group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Video Preview */}
      <video
        src={reel.videoUrl}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        preload="metadata"
        muted
        playsInline
      />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

      {/* Play Icon in center on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white shadow-lg">
          <Play className="w-6 h-6 fill-current ml-0.5" />
        </div>
      </div>

      {/* Creator & Caption Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white z-10">
        <div className="flex items-center gap-2 mb-1.5">
          {reel.creator?.profileImage?.url ? (
            <img
              src={reel.creator.profileImage.url}
              alt={reel.creator.name}
              className="w-6 h-6 rounded-full object-cover border border-white/40"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px]">
              {reel.creator?.name ? reel.creator.name[0].toUpperCase() : 'U'}
            </div>
          )}
          <span className="text-xs font-semibold drop-shadow-sm truncate">{reel.creator?.name}</span>
        </div>

        <p className="text-xs font-medium text-slate-100 line-clamp-2 drop-shadow-sm leading-snug">
          {reel.caption}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-300 font-medium">
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
            {reel.likes?.length || 0}
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            {reel.comments?.length || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReelCard;
