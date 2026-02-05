import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FilterTagsProps {
  tags: string[];
  selectedTag: string;
  onTagSelect: (tag: string) => void;
  className?: string;
}

export const FilterTags: React.FC<FilterTagsProps> = ({
  tags,
  selectedTag,
  onTagSelect,
  className,
}) => {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {tags.map((tag, index) => (
        <motion.button
          key={tag}
          className={cn(
            'px-4 py-2 rounded-full text-sm transition-all duration-200',
            selectedTag === tag
              ? 'text-[#4A5568] font-medium'
              : 'text-[#718096] hover:text-[#2D3748]'
          )}
          style={{
            background: '#F0F2F5',
            boxShadow: selectedTag === tag
              ? 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF'
              : '3px 3px 6px #A0AEC0, -3px -3px 6px #FFFFFF',
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={selectedTag !== tag ? {
            boxShadow: '5px 5px 10px #A0AEC0, -5px -5px 10px #FFFFFF',
            y: -1,
          } : {}}
          whileTap={{
            boxShadow: 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF',
          }}
          onClick={() => onTagSelect(tag)}
        >
          {tag}
        </motion.button>
      ))}
    </div>
  );
};

export default FilterTags;
