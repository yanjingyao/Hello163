import { motion } from 'framer-motion';
import { Play, Heart, Download, Check, Clock } from 'lucide-react';
import { NeuButton } from '@/components/neu/NeuButton';
import type { Track } from '@/types';
import { cn } from '@/lib/utils';

interface TrackItemProps {
  track: Track;
  isPlaying: boolean;
  isCurrentTrack: boolean;
  isFavorite: boolean;
  isSelected?: boolean;
  showCheckbox?: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
  onToggleSelection?: () => void;
  onDownload?: () => void;
  index?: number;
}

export const TrackItem: React.FC<TrackItemProps> = ({
  track,
  isPlaying,
  isCurrentTrack,
  isFavorite,
  isSelected = false,
  showCheckbox = false,
  onPlay,
  onToggleFavorite,
  onToggleSelection,
  onDownload,
  index,
}) => {
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      className={cn(
        'flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl transition-all duration-200',
        isCurrentTrack && 'bg-[#F0F2F5]'
      )}
      style={{
        background: isCurrentTrack ? '#F0F2F5' : 'transparent',
        boxShadow: isCurrentTrack
          ? 'inset 3px 3px 6px #A0AEC0, inset -3px -3px 6px #FFFFFF'
          : 'none',
      }}
      whileHover={!isCurrentTrack ? {
        background: '#F0F2F5',
        boxShadow: '4px 4px 8px #A0AEC0, -4px -4px 8px #FFFFFF',
      } : {}}
    >
      {/* Checkbox for batch selection */}
      {showCheckbox && (
        <NeuButton
          variant={isSelected ? 'pressed' : 'raised'}
          size="sm"
          shape="circle"
          onClick={onToggleSelection}
          className="flex-shrink-0 w-8 h-8"
        >
          {isSelected && <Check className="w-3 h-3" />}
        </NeuButton>
      )}

      {/* Index or Play button */}
      {!showCheckbox && (
        <div className="w-6 sm:w-8 flex-shrink-0 flex justify-center">
          {isCurrentTrack ? (
            <NeuButton
              variant="pressed"
              size="sm"
              shape="circle"
              onClick={onPlay}
              className="w-7 h-7 sm:w-8 sm:h-8"
            >
              {isPlaying ? (
                <div className="flex gap-0.5">
                  <span className="w-0.5 h-2.5 sm:h-3 bg-[#4A5568] animate-pulse" />
                  <span className="w-0.5 h-2.5 sm:h-3 bg-[#4A5568] animate-pulse delay-75" />
                  <span className="w-0.5 h-2.5 sm:h-3 bg-[#4A5568] animate-pulse delay-150" />
                </div>
              ) : (
                <Play className="w-3 h-3" />
              )}
            </NeuButton>
          ) : (
            <span className="text-xs sm:text-sm text-[#A0AEC0]">{index}</span>
          )}
        </div>
      )}

      {/* Cover */}
      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'text-sm sm:text-base font-medium truncate',
          isCurrentTrack ? 'text-[#4A5568]' : 'text-[#2D3748]'
        )}>
          {track.title}
        </h4>
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#718096]">
          <span className="truncate">{track.artist}</span>
          <span className="text-[#A0AEC0] hidden sm:inline">·</span>
          <span className="truncate hidden sm:inline">{track.album}</span>
        </div>
      </div>

      {/* Duration */}
      <div className="hidden sm:flex items-center gap-1 text-xs text-[#A0AEC0] flex-shrink-0">
        <Clock className="w-3 h-3" />
        {formatDuration(track.duration)}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        <NeuButton
          variant={isFavorite ? 'pressed' : 'raised'}
          size="sm"
          shape="circle"
          onClick={onToggleFavorite}
          className={cn(
            'w-8 h-8 sm:w-9 sm:h-9',
            isFavorite && 'text-red-500'
          )}
        >
          <Heart className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', isFavorite && 'fill-current')} />
        </NeuButton>

        {onDownload && (
          <NeuButton
            variant="raised"
            size="sm"
            shape="circle"
            onClick={onDownload}
            className="w-8 h-8 sm:w-9 sm:h-9"
          >
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </NeuButton>
        )}
      </div>
    </motion.div>
  );
};

export default TrackItem;
