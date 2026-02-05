import React from 'react';
import { NeuSlider } from '@/components/neu/NeuSlider';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentTime,
  duration,
  onSeek,
  className,
}) => {
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn('w-full', className)}>
      <NeuSlider
        value={currentTime}
        min={0}
        max={duration || 100}
        step={1}
        onChange={onSeek}
      />
      <div className="flex justify-between mt-2 text-sm text-[#718096]">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
