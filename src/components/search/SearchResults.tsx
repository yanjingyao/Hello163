import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Heart, Download, ListMusic, Clock, Disc, ChevronRight } from 'lucide-react';
import { NeuButton } from '@/components/neu/NeuButton';
import { NeuCard } from '@/components/neu/NeuCard';
import { PlaylistDetail } from '@/components/playlist/PlaylistDetail';
import { toast } from 'sonner';
import { downloadManager } from '@/lib/download';
import { BatchDownload } from '@/components/download/BatchDownload';
import type { Track, Playlist, SearchResult, AudioQuality } from '@/types';
import { cn } from '@/lib/utils';

interface SearchResultsProps {
  results: SearchResult;
  searchType: 'keyword' | 'song' | 'playlist' | 'album';
  favorites: string[];
  favoritePlaylists: string[];
  quality: AudioQuality;
  isSearching?: boolean;
  onPlayTrack: (track: Track, playlist?: Track[]) => void;
  onToggleFavorite: (trackId: string) => void;
  onTogglePlaylistFavorite: (playlistId: string) => void;
}

import { usePlayerStore } from '@/stores/playerStore';

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  searchType,
  favorites,
  favoritePlaylists,
  quality,
  isSearching = false,
  onPlayTrack,
  onToggleFavorite,
  onTogglePlaylistFavorite,
}) => {
  const { downloadFormat } = usePlayerStore();
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showBatchDownload, setShowBatchDownload] = useState(false);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTrackSelection = (trackId: string) => {
    setSelectedTracks(prev =>
      prev.includes(trackId)
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const selectAllTracks = () => {
    setSelectedTracks((results.songs || []).map(t => t.id));
  };

  const clearSelection = () => {
    setSelectedTracks([]);
  };

  const handleBatchDownload = async () => {
    const tracksToDownload = (results.songs || []).filter(t => selectedTracks.includes(t.id));
    if (tracksToDownload.length === 0) return;

    setShowBatchDownload(false);
    toast.info(`开始下载 ${tracksToDownload.length} 首歌曲...`);

    const count = await downloadManager.downloadBatch(
      tracksToDownload, 
      quality,
      downloadFormat,
      (current, total) => {
        toast.loading(`正在下载: ${current}/${total}`, { id: 'batch-download' });
      }
    );

    toast.dismiss('batch-download');
    if (count > 0) {
      toast.success(`成功下载 ${count} 首歌曲`);
    } else {
      toast.error('下载失败');
    }
    
    setSelectedTracks([]);
  };

  // 如果选择了歌单/专辑，显示详情
  if (selectedPlaylist) {
    return (
      <PlaylistDetail
        playlist={selectedPlaylist}
        isFavorite={favoritePlaylists.includes(selectedPlaylist.id)}
        favorites={favorites}
        quality={quality}
        onBack={() => setSelectedPlaylist(null)}
        onPlayTrack={onPlayTrack}
        onToggleFavorite={onToggleFavorite}
        onTogglePlaylistFavorite={() => onTogglePlaylistFavorite(selectedPlaylist.id)}
      />
    );
  }

  // 歌名/歌曲ID搜索 - 返回歌曲列表
  if (searchType === 'keyword' || searchType === 'song') {
    if (isSearching) {
      return (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NeuCard variant="flat" className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#A0AEC0] border-t-[#4A5568] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#718096]">搜索中...</p>
          </NeuCard>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* 歌曲结果 */}
        {results.songs && results.songs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#2D3748]">
                歌曲 ({results.songs.length})
              </h3>
              <NeuButton
                variant="raised"
                size="sm"
                onClick={() => setShowBatchDownload(true)}
              >
                <Download className="w-4 h-4 mr-1" />
                批量下载
              </NeuButton>
            </div>
            
            <NeuCard variant="raised" className="p-0 overflow-hidden">
              <div className="divide-y divide-[#CBD5E0]/30">
                {results.songs.map((track, index) => (
                  <motion.div
                    key={track.id}
                    className="flex items-center gap-3 p-3 sm:p-4 rounded-xl transition-all duration-200 hover:bg-[#F0F2F5] hover:shadow-[inset_2px_2px_4px_#A0AEC0,inset_-2px_-2px_4px_#FFFFFF] cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => onPlayTrack(track, results.songs)}
                  >
                    {/* 序号 */}
                    <span className="w-6 text-center text-sm text-[#A0AEC0] flex-shrink-0">
                      {index + 1}
                    </span>
                    
                    {/* 封面 */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 歌曲信息 */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-medium text-[#2D3748] truncate">
                        {track.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-[#718096]">
                        <span className="truncate">{track.artist}</span>
                        <span className="text-[#A0AEC0]">·</span>
                        <span className="truncate">{track.album}</span>
                      </div>
                    </div>
                    
                    
                  
                    {/* 操作按钮 */}
                    <div className="flex items-center gap-1 sm:gap-2">
                      <NeuButton
                        variant="raised"
                        size="sm"
                        shape="circle"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayTrack(track, results.songs);
                        }}
                        className="w-9 h-9 sm:w-10 sm:h-10"
                      >
                        <Play className="w-4 h-4 ml-0.5" />
                      </NeuButton>
                      <NeuButton
                        variant={favorites.includes(track.id) ? 'pressed' : 'raised'}
                        size="sm"
                        shape="circle"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(track.id);
                        }}
                        className={cn(
                          'w-9 h-9 sm:w-10 sm:h-10',
                          favorites.includes(track.id) && 'text-red-500'
                        )}
                      >
                        <Heart className={cn('w-4 h-4', favorites.includes(track.id) && 'fill-current')} />
                      </NeuButton>
                    </div>
                  </motion.div>
                ))}
              </div>
            </NeuCard>
          </section>
        )}

        {/* 批量下载弹窗 */}
        {showBatchDownload && (
          <BatchDownload
            tracks={results.songs || []}
            selectedIds={selectedTracks}
            quality={quality}
            onToggleSelection={toggleTrackSelection}
            onSelectAll={selectAllTracks}
            onClearSelection={clearSelection}
            onDownload={handleBatchDownload}
            onClose={() => setShowBatchDownload(false)}
          />
        )}

        {/* 无结果 */}
        {(!results.songs || results.songs.length === 0) && (
          <NeuCard variant="flat" className="text-center py-12">
            <ListMusic className="w-12 h-12 text-[#A0AEC0] mx-auto mb-3" />
            <p className="text-[#718096]">未找到相关歌曲</p>
            <p className="text-sm text-[#A0AEC0] mt-1">请尝试其他关键词</p>
          </NeuCard>
        )}
      </motion.div>
    );
  }

  // 歌单ID搜索 - 返回歌单卡片
  if (searchType === 'playlist') {
    if (isSearching) {
      return (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NeuCard variant="flat" className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#A0AEC0] border-t-[#4A5568] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#718096]">搜索中...</p>
          </NeuCard>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-[#2D3748]">
          歌单 ({results.playlists?.length || 0})
        </h3>
        
        {results.playlists && results.playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.playlists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NeuCard 
                  variant="raised" 
                  className="cursor-pointer h-full"
                  onClick={() => setSelectedPlaylist(playlist)}
                >
                  <div className="flex items-start gap-4">
                    {/* 封面 */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0">
                      {playlist.coverUrl ? (
                        <img
                          src={playlist.coverUrl}
                          alt={playlist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center bg-[#F0F2F5]"
                          style={{
                            boxShadow: 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF',
                          }}
                        >
                          <ListMusic className="w-8 h-8 text-[#A0AEC0]" />
                        </div>
                      )}
                    </div>
                    
                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] truncate">
                        {playlist.name}
                      </h4>
                      <p className="text-sm text-[#718096] line-clamp-2 mt-1">
                        {playlist.description}
                      </p>
                      <p className="text-xs text-[#A0AEC0] mt-2">
                        {playlist.tracks?.length || 0} 首歌曲
                      </p>
                    </div>

                    {/* 收藏按钮 */}
                    <NeuButton
                      variant={favoritePlaylists.includes(playlist.id) ? 'pressed' : 'raised'}
                      size="sm"
                      shape="circle"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePlaylistFavorite(playlist.id);
                      }}
                      className={cn(
                        'w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0',
                        favoritePlaylists.includes(playlist.id) && 'text-red-500'
                      )}
                    >
                      <Heart className={cn('w-4 h-4', favoritePlaylists.includes(playlist.id) && 'fill-current')} />
                    </NeuButton>

                    {/* 箭头 */}
                    <ChevronRight className="w-5 h-5 text-[#A0AEC0] flex-shrink-0" />
                  </div>
                </NeuCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <NeuCard variant="flat" className="text-center py-12">
            <ListMusic className="w-12 h-12 text-[#A0AEC0] mx-auto mb-3" />
            <p className="text-[#718096]">未找到相关歌单</p>
            <p className="text-sm text-[#A0AEC0] mt-1">请检查歌单ID是否正确</p>
          </NeuCard>
        )}
      </motion.div>
    );
  }

  // 专辑ID搜索 - 返回专辑卡片
  if (searchType === 'album') {
    if (isSearching) {
      return (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <NeuCard variant="flat" className="text-center py-12">
            <div className="w-12 h-12 border-4 border-[#A0AEC0] border-t-[#4A5568] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[#718096]">搜索中...</p>
          </NeuCard>
        </motion.div>
      );
    }

    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold text-[#2D3748]">
          专辑 ({results.playlists?.length || 0})
        </h3>
        
        {results.playlists && results.playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.playlists.map((album, index) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NeuCard 
                  variant="raised" 
                  className="cursor-pointer h-full"
                  onClick={() => setSelectedPlaylist(album)}
                >
                  <div className="flex items-start gap-4">
                    {/* 封面 */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0">
                      {album.coverUrl ? (
                        <img
                          src={album.coverUrl}
                          alt={album.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div 
                          className="w-full h-full flex items-center justify-center bg-[#F0F2F5]"
                          style={{
                            boxShadow: 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF',
                          }}
                        >
                          <Disc className="w-8 h-8 text-[#A0AEC0]" />
                        </div>
                      )}
                    </div>
                    
                    {/* 信息 */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-lg font-semibold text-[#2D3748] truncate">
                        {album.name}
                      </h4>
                      <p className="text-sm text-[#718096] line-clamp-2 mt-1">
                        {album.description}
                      </p>
                      <p className="text-xs text-[#A0AEC0] mt-2">
                        {album.tracks?.length || 0} 首歌曲
                      </p>
                    </div>

                    {/* 收藏按钮 */}
                    <NeuButton
                      variant={favoritePlaylists.includes(album.id) ? 'pressed' : 'raised'}
                      size="sm"
                      shape="circle"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePlaylistFavorite(album.id);
                      }}
                      className={cn(
                        'w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0',
                        favoritePlaylists.includes(album.id) && 'text-red-500'
                      )}
                    >
                      <Heart className={cn('w-4 h-4', favoritePlaylists.includes(album.id) && 'fill-current')} />
                    </NeuButton>

                    {/* 箭头 */}
                    <ChevronRight className="w-5 h-5 text-[#A0AEC0] flex-shrink-0" />
                  </div>
                </NeuCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <NeuCard variant="flat" className="text-center py-12">
            <Disc className="w-12 h-12 text-[#A0AEC0] mx-auto mb-3" />
            <p className="text-[#718096]">未找到相关专辑</p>
            <p className="text-sm text-[#A0AEC0] mt-1">请检查专辑ID是否正确</p>
          </NeuCard>
        )}
      </motion.div>
    );
  }

  return null;
};

export default SearchResults;
