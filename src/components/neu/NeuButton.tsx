import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeuButtonProps {
  children: React.ReactNode;
  variant?: 'raised' | 'pressed' | 'flat';
  size?: 'sm' | 'md' | 'lg';
  shape?: 'rounded' | 'circle';
  className?: string;
  disabled?: boolean;
  active?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  title?: string;
}

export const NeuButton: React.FC<NeuButtonProps> = ({
  children,
  variant = 'raised',
  size = 'md',
  shape = 'rounded',
  className,
  disabled = false,
  active = false,
  onClick,
  title,
}) => {
  const sizeClasses = {
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
  };

  const shapeClasses = {
    rounded: 'rounded-2xl',
    circle: 'rounded-full',
  };

  return (
    <motion.button
      className={cn(
        'bg-[#F0F2F5] transition-all duration-200 flex items-center justify-center',
        sizeClasses[size],
        shapeClasses[shape],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        boxShadow: active || variant === 'pressed'
          ? 'inset 4px 4px 8px #A0AEC0, inset -4px -4px 8px #FFFFFF'
          : variant === 'flat'
          ? 'none'
          : '8px 8px 16px #A0AEC0, -8px -8px 16px #FFFFFF',
      }}
      whileHover={!disabled && variant !== 'pressed' ? {
        boxShadow: '12px 12px 24px #A0AEC0, -12px -12px 24px #FFFFFF',
        y: -2,
      } : {}}
      // whileTap={!disabled ? {
      //   boxShadow: 'inset 4px 4px 8px #A0AEC0, inset -4px -4px 8px #FFFFFF',
      //   y: 0,
      //   scale: 0.98,
      // } : {}}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      {children}
    </motion.button>
  );
};

export default NeuButton;
