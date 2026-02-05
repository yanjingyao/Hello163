import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeuSliderProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  className?: string;
  showTooltip?: boolean;
  formatValue?: (value: number) => string;
}

export const NeuSlider: React.FC<NeuSliderProps> = ({
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  className,
  showTooltip = false,
  formatValue = (v) => `${v}`,
}) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newPercentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const newValue = min + (newPercentage / 100) * (max - min);
    onChange(Math.round(newValue / step) * step);
  };

  return (
    <div className={cn('relative w-full', className)}>
      <div
        className="relative h-3 rounded-full cursor-pointer"
        style={{
          background: '#F0F2F5',
          boxShadow: 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF',
        }}
        onClick={handleClick}
      >
        {/* Fill */}
        <div
          className="absolute h-full rounded-full transition-all duration-100"
          style={{
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #4A5568, #718096)',
            boxShadow: '2px 2px 4px #A0AEC0, -2px -2px 4px #FFFFFF',
          }}
        />
        
        {/* Thumb */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full cursor-grab active:cursor-grabbing"
          style={{
            left: `calc(${percentage}% - 10px)`,
            background: '#F0F2F5',
            boxShadow: '4px 4px 8px #A0AEC0, -4px -4px 8px #FFFFFF',
          }}
          whileHover={{
            scale: 1.2,
            boxShadow: '6px 6px 12px #A0AEC0, -6px -6px 12px #FFFFFF',
          }}
          whileTap={{
            scale: 0.95,
            boxShadow: 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF',
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const rect = e.currentTarget.parentElement?.getBoundingClientRect();
              if (!rect) return;
              const clickX = moveEvent.clientX - rect.left;
              const newPercentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
              const newValue = min + (newPercentage / 100) * (max - min);
              onChange(Math.round(newValue / step) * step);
            };
            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      </div>
      
      {showTooltip && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg text-xs text-[#2D3748]"
          style={{
            background: '#F0F2F5',
            boxShadow: '4px 4px 8px #A0AEC0, -4px -4px 8px #FFFFFF',
          }}
        >
          {formatValue(value)}
        </div>
      )}
    </div>
  );
};

export default NeuSlider;
