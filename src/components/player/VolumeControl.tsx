import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';
import { NeuSlider } from '@/components/neu/NeuSlider';
import { NeuButton } from '@/components/neu/NeuButton';
import { cn } from '@/lib/utils';

interface VolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  onVolumeChange,
  className,
}) => {
  const getVolumeIcon = () => {
    if (volume === 0) return <VolumeX className="w-4 h-4" />;
    if (volume < 50) return <Volume1 className="w-4 h-4" />;
    return <Volume2 className="w-4 h-4" />;
  };

  const handleMute = () => {
    onVolumeChange(volume === 0 ? 50 : 0);
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <NeuButton
        variant="raised"
        size="sm"
        shape="circle"
        onClick={handleMute}
        title={volume === 0 ? '取消静音' : '静音'}
      >
        {getVolumeIcon()}
      </NeuButton>
      
      <div className="flex-1 max-w-[120px]">
        <NeuSlider
          value={volume}
          min={0}
          max={100}
          step={1}
          onChange={onVolumeChange}
        />
      </div>
    </div>
  );
};

export default VolumeControl;
