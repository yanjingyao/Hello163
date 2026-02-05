import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AlbumCoverProps {
  src: string;
  alt: string;
  isPlaying: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AlbumCover: React.FC<AlbumCoverProps> = ({
  src,
  alt,
  isPlaying,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-40 h-40',
    lg: 'w-64 h-64',
  };

  return (
    <div className={cn('relative', className)}>
      {/* Outer ring */}
      <motion.div
        className={cn(
          'rounded-full p-2 bg-[#F0F2F5]',
          sizeClasses[size]
        )}
        style={{
          boxShadow: '8px 8px 16px #A0AEC0, -8px -8px 16px #FFFFFF',
        }}
      >
        {/* Inner container with rotation */}
        <motion.div
          className="relative w-full h-full rounded-full overflow-hidden"
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{
            duration: 10,
            repeat: isPlaying ? Infinity : 0,
            ease: 'linear',
          }}
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
          
          {/* Center hole */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F0F2F5]"
            style={{
              boxShadow: 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF',
            }}
          />
        </motion.div>
      </motion.div>
      
      {/* Glow effect when playing */}
      {isPlaying && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 20px rgba(74, 85, 104, 0.2)',
              '0 0 40px rgba(74, 85, 104, 0.4)',
              '0 0 20px rgba(74, 85, 104, 0.2)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
};

export default AlbumCover;
