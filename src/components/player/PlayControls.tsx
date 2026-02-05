import { motion } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat,
  Repeat1,
  Heart
} from 'lucide-react';
import { NeuButton } from '@/components/neu/NeuButton';
import type { PlayMode } from '@/types';
import { cn } from '@/lib/utils';

interface PlayControlsProps {
  isPlaying: boolean;
  playMode: PlayMode;
  isFavorite: boolean;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleMode: () => void;
  onToggleFavorite: () => void;
  className?: string;
}

export const PlayControls: React.FC<PlayControlsProps> = ({
  isPlaying,
  playMode,
  isFavorite,
  onPlayPause,
  onPrevious,
  onNext,
  onToggleMode,
  onToggleFavorite,
  className,
}) => {
  const getModeIcon = () => {
    switch (playMode) {
      case 'random':
        return <Shuffle className="w-4 h-4" />;
      case 'loop':
        return <Repeat className="w-4 h-4" />;
      case 'single-loop':
        return <Repeat1 className="w-4 h-4" />;
      default:
        return <Repeat className="w-4 h-4 text-[#A0AEC0]" />;
    }
  };

  const getModeTitle = () => {
    switch (playMode) {
      case 'random':
        return '随机播放';
      case 'loop':
        return '列表循环';
      case 'single-loop':
        return '单曲循环';
      default:
        return '顺序播放';
    }
  };

  return (
    <div className={cn('flex items-center justify-center gap-4', className)}>
      {/* Mode button */}
      <NeuButton
        variant="raised"
        size="sm"
        shape="circle"
        onClick={onToggleMode}
        title={getModeTitle()}
        className={cn(
          playMode !== 'sequence' && 'text-[#4A5568]'
        )}
      >
        {getModeIcon()}
      </NeuButton>

      {/* Previous button */}
      <NeuButton
        variant="raised"
        size="md"
        shape="circle"
        onClick={onPrevious}
        title="上一首"
      >
        <SkipBack className="w-5 h-5" />
      </NeuButton>

      {/* Play/Pause button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <NeuButton
          variant="raised"
          size="lg"
          shape="circle"
          onClick={onPlayPause}
          title={isPlaying ? '暂停' : '播放'}
          className="text-[#4A5568]"
        >
          {isPlaying ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </NeuButton>
      </motion.div>

      {/* Next button */}
      <NeuButton
        variant="raised"
        size="md"
        shape="circle"
        onClick={onNext}
        title="下一首"
      >
        <SkipForward className="w-5 h-5" />
      </NeuButton>

      {/* Favorite button */}
      <NeuButton
        variant={isFavorite ? 'pressed' : 'raised'}
        size="sm"
        shape="circle"
        onClick={onToggleFavorite}
        title={isFavorite ? '取消收藏' : '收藏'}
        className={cn(
          isFavorite && 'text-red-500'
        )}
      >
        <Heart className={cn('w-4 h-4', isFavorite && 'fill-current')} />
      </NeuButton>
    </div>
  );
};

export default PlayControls;
