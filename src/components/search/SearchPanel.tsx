import { motion } from 'framer-motion';
import { Search, Music, ListMusic, Disc } from 'lucide-react';
import { NeuInput } from '@/components/neu/NeuInput';
import { NeuButton } from '@/components/neu/NeuButton';
import { cn } from '@/lib/utils';

interface SearchPanelProps {
  searchType: 'keyword' | 'song' | 'playlist' | 'album';
  onSearchTypeChange: (type: 'keyword' | 'song' | 'playlist' | 'album') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
  className?: string;
}

const searchTypes: { value: 'keyword' | 'song' | 'playlist' | 'album'; label: string; icon: React.ReactNode }[] = [
  { value: 'keyword', label: '歌名/歌手', icon: <Search className="w-4 h-4" /> },
  { value: 'song', label: '歌曲ID', icon: <Music className="w-4 h-4" /> },
  { value: 'playlist', label: '歌单ID', icon: <ListMusic className="w-4 h-4" /> },
  { value: 'album', label: '专辑ID', icon: <Disc className="w-4 h-4" /> },
];

export const SearchPanel: React.FC<SearchPanelProps> = ({
  searchType,
  onSearchTypeChange,
  searchQuery,
  onSearchQueryChange,
  onSearch,
  className,
}) => {
  const getPlaceholder = () => {
    switch (searchType) {
      case 'keyword':
        return '搜索歌名或歌手名...';
      case 'song':
        return '输入歌曲ID...';
      case 'playlist':
        return '输入歌单ID...';
      case 'album':
        return '输入专辑ID...';
      default:
        return '搜索...';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search type tabs */}
      <div className="flex flex-wrap gap-2">
        {searchTypes.map((type) => (
          <motion.button
            key={type.value}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
              searchType === type.value
                ? 'text-[#4A5568]'
                : 'text-[#718096] hover:text-[#2D3748]'
            )}
            style={{
              background: '#F0F2F5',
              boxShadow: searchType === type.value
                ? 'inset 3px 3px 6px #A0AEC0, inset -3px -3px 6px #FFFFFF'
                : '4px 4px 8px #A0AEC0, -4px -4px 8px #FFFFFF',
            }}
            whileHover={searchType !== type.value ? {
              boxShadow: '6px 6px 12px #A0AEC0, -6px -6px 12px #FFFFFF',
            } : {}}
            whileTap={{
              boxShadow: 'inset 3px 3px 6px #A0AEC0, inset -3px -3px 6px #FFFFFF',
            }}
            onClick={() => onSearchTypeChange(type.value)}
          >
            {type.icon}
            {type.label}
          </motion.button>
        ))}
      </div>

      {/* Search input */}
      <div className="flex gap-3">
        <NeuInput
          value={searchQuery}
          onChange={onSearchQueryChange}
          placeholder={getPlaceholder()}
          className="flex-1"
          icon={<Search className="w-5 h-5" />}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        />
        <NeuButton
          variant="raised"
          size="md"
          onClick={onSearch}
          className="px-6"
        >
          <Search className="w-5 h-5 mr-2" />
          搜索
        </NeuButton>
      </div>
    </div>
  );
};

export default SearchPanel;
