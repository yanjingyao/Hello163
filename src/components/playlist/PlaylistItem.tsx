import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ListMusic, Heart, Play } from 'lucide-react';
import { NeuCard } from '@/components/neu/NeuCard';
import { NeuButton } from '@/components/neu/NeuButton';
import type { Playlist } from '@/types';
import { cn } from '@/lib/utils';

interface PlaylistItemProps {
  playlist: Playlist;
  isExpanded: boolean;
  isFavorite: boolean;
  onToggleExpand: () => void;
  onToggleFavorite: () => void;
  onPlayAll: () => void;
  children?: React.ReactNode;
}

export const PlaylistItem: React.FC<PlaylistItemProps> = ({
  playlist,
  isExpanded,
  isFavorite,
  onToggleExpand,
  onToggleFavorite,
  onPlayAll,
  children,
}) => {
  return (
    <NeuCard variant="raised" className="overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 sm:gap-4 cursor-pointer p-1"
        onClick={onToggleExpand}
      >
        {/* Cover */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden flex-shrink-0">
          {playlist.coverUrl ? (
            <img
              src={playlist.coverUrl}
              alt={playlist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center bg-[#F0F2F5]"
              style={{
                boxShadow: 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF',
              }}
            >
              <ListMusic className="w-6 h-6 sm:w-8 sm:h-8 text-[#A0AEC0]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] truncate">
            {playlist.name}
          </h3>
          <p className="text-xs sm:text-sm text-[#718096] truncate">
            {playlist.description}
          </p>
          <p className="text-xs text-[#A0AEC0] mt-0.5">
            {playlist.tracks.length} 首歌曲
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <NeuButton
            variant={isFavorite ? 'pressed' : 'raised'}
            size="sm"
            shape="circle"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={cn(
              'w-8 h-8 sm:w-10 sm:h-10',
              isFavorite && 'text-red-500'
            )}
          >
            <Heart className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', isFavorite && 'fill-current')} />
          </NeuButton>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <NeuButton
              variant="raised"
              size="sm"
              shape="circle"
              className="w-8 h-8 sm:w-10 sm:h-10"
            >
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </NeuButton>
          </motion.div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.68, -0.55, 0.265, 1.55] }}
            className="overflow-hidden"
          >
            <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-[#CBD5E0]/30">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm text-[#718096]">
                  共 {playlist.tracks.length} 首歌曲
                </span>
                <NeuButton
                  variant="raised"
                  size="sm"
                  onClick={onPlayAll}
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                  播放全部
                </NeuButton>
              </div>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </NeuCard>
  );
};

export default PlaylistItem;
