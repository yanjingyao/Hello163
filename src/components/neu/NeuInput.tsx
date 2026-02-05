import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NeuInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  icon?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const NeuInput: React.FC<NeuInputProps> = ({
  value,
  onChange,
  placeholder,
  className,
  type = 'text',
  icon,
  onFocus,
  onBlur,
  onKeyDown,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <motion.div
      className={cn(
        'relative flex items-center bg-[#F0F2F5] rounded-2xl overflow-hidden',
        className
      )}
      style={{
        boxShadow: isFocused
          ? 'inset 4px 4px 8px #A0AEC0, inset -4px -4px 8px #FFFFFF'
          : '8px 8px 16px #A0AEC0, -8px -8px 16px #FFFFFF',
      }}
      animate={{
        boxShadow: isFocused
          ? 'inset 4px 4px 8px #A0AEC0, inset -4px -4px 8px #FFFFFF'
          : '8px 8px 16px #A0AEC0, -8px -8px 16px #FFFFFF',
      }}
      transition={{ duration: 0.2 }}
    >
      {icon && (
        <div className="pl-4 text-[#718096]">
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'flex-1 bg-transparent border-none outline-none px-4 py-3 text-[#2D3748] placeholder:text-[#A0AEC0]',
          icon && 'pl-3'
        )}
        onFocus={() => {
          setIsFocused(true);
          onFocus?.();
        }}
        onBlur={() => {
          setIsFocused(false);
          onBlur?.();
        }}
        onKeyDown={onKeyDown}
      />
    </motion.div>
  );
};

export default NeuInput;
