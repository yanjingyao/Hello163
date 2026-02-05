import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeuCardProps {
  children: React.ReactNode;
  variant?: 'raised' | 'pressed' | 'flat';
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export const NeuCard: React.FC<NeuCardProps> = ({
  children,
  variant = 'raised',
  className,
  hoverable = true,
  onClick,
}) => {
  return (
    <motion.div
      className={cn(
        'bg-[#F0F2F5] rounded-3xl p-6',
        className
      )}
      style={{
        boxShadow: variant === 'pressed'
          ? 'inset 4px 4px 8px #A0AEC0, inset -4px -4px 8px #FFFFFF'
          : variant === 'flat'
          ? 'none'
          : '8px 8px 16px #A0AEC0, -8px -8px 16px #FFFFFF',
      }}
      whileHover={hoverable && variant !== 'pressed' ? {
        boxShadow: '12px 12px 24px #A0AEC0, -12px -12px 24px #FFFFFF',
        y: -4,
      } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default NeuCard;
