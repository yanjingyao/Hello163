import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Play, Download, Heart, Clock, ListMusic } from 'lucide-react';
import { NeuCard } from '@/components/neu/NeuCard';
import { NeuButton } from '@/components/neu/NeuButton';
import { toast } from 'sonner';
import { downloadManager } from '@/lib/download';
import { BatchDownload } from '@/components/download/BatchDownload';
import type { Track, Playlist, AudioQuality } from '@/types';
import { cn } from '@/lib/utils';

interface PlaylistDetailProps {
  playlist: Playlist;
  isFavorite: boolean;
  favorites: string[];
  quality: AudioQuality;
  onBack: () => void;
  onPlayTrack: (track: Track, playlist?: Track[]) => void;
  onToggleFavorite: (trackId: string) => void;
  onTogglePlaylistFavorite: () => void;
  showBackButton?: boolean;
  className?: string;
}

import { usePlayerStore } from '@/stores/playerStore';

export const PlaylistDetail: React.FC<PlaylistDetailProps> = ({
  playlist,
  isFavorite,
  favorites,
  quality,
  onBack,
  onPlayTrack,
  onToggleFavorite,
  onTogglePlaylistFavorite,
  showBackButton = true,
  className,
}) => {
  const { downloadFormat } = usePlayerStore();
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
    setSelectedTracks(playlist.tracks.map(t => t.id));
  };

  const clearSelection = () => {
    setSelectedTracks([]);
  };

  const handleBatchDownload = async () => {
    const tracksToDownload = playlist.tracks.filter(t => selectedTracks.includes(t.id));
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

  const totalDuration = playlist.tracks.reduce((sum, track) => sum + track.duration, 0);
  const hours = Math.floor(totalDuration / 3600);
  const mins = Math.floor((totalDuration % 3600) / 60);

  return (
    <motion.div
      className={cn('space-y-6', className)}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {/* 返回按钮 */}
      {showBackButton && (
        <NeuButton
          variant="raised"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          返回
        </NeuButton>
      )}

      {/* 歌单信息卡片 */}
      <NeuCard variant="raised">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {/* 封面 */}
          <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
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
                  boxShadow: 'inset 3px 3px 6px #A0AEC0, inset -3px -3px 6px #FFFFFF',
                }}
              >
                <ListMusic className="w-12 h-12 text-[#A0AEC0]" />
              </div>
            )}
          </div>

          {/* 信息 */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2D3748]">{playlist.name}</h2>
            <p className="text-sm text-[#718096] mt-2">{playlist.description}</p>
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-[#A0AEC0]">
              <span>{playlist.tracks.length} 首歌曲</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {hours > 0 ? `${hours}小时${mins}分` : `${mins}分钟`}
              </span>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-4">
              <NeuButton
                variant="raised"
                size="md"
                onClick={() => playlist.tracks.length > 0 && onPlayTrack(playlist.tracks[0], playlist.tracks)}
              >
                <Play className="w-4 h-4 mr-1" />
                播放全部
              </NeuButton>
              <NeuButton
                variant="raised"
                size="md"
                onClick={() => setShowBatchDownload(true)}
              >
                <Download className="w-4 h-4 mr-1" />
                批量下载
              </NeuButton>
              <NeuButton
                variant={isFavorite ? 'pressed' : 'raised'}
                size="md"
                onClick={onTogglePlaylistFavorite}
                className={cn(isFavorite && 'text-red-500')}
              >
                <Heart className={cn('w-4 h-4 mr-1', isFavorite && 'fill-current')} />
                {isFavorite ? '已收藏' : '收藏'}
              </NeuButton>
            </div>
          </div>
        </div>
      </NeuCard>

      {/* 歌曲列表 */}
      <NeuCard variant="raised" className="p-0 overflow-hidden">
        <div className="divide-y divide-[#CBD5E0]/30">
          {playlist.tracks.map((track, index) => (
            <motion.div
              key={track.id}
              className="flex items-center gap-3 p-3 sm:p-4 hover:bg-[#F0F2F5]/50 transition-colors cursor-pointer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onPlayTrack(track, playlist.tracks)}
            >
              {/* 序号 */}
              <span className="w-6 text-center text-sm text-[#A0AEC0] flex-shrink-0">
                {index + 1}
              </span>

              {/* 封面 */}
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
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
                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-[#718096]">
                  <span className="truncate">{track.artist}</span>
                  <span className="text-[#A0AEC0] hidden sm:inline">·</span>
                  <span className="truncate hidden sm:inline">{track.album}</span>
                </div>
              </div>

              {/* 时长 */}
              <div className="hidden sm:flex items-center gap-1 text-sm text-[#A0AEC0] flex-shrink-0">
                <Clock className="w-3.5 h-3.5" />
                {formatDuration(track.duration)}
              </div>

              {/* 收藏按钮 */}
              <NeuButton
                variant={favorites.includes(track.id) ? 'pressed' : 'raised'}
                size="sm"
                shape="circle"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(track.id);
                }}
                className={cn(
                  'w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0',
                  favorites.includes(track.id) && 'text-red-500'
                )}
              >
                <Heart className={cn('w-4 h-4', favorites.includes(track.id) && 'fill-current')} />
              </NeuButton>
            </motion.div>
          ))}
        </div>

        {playlist.tracks.length === 0 && (
          <div className="text-center py-12">
            <ListMusic className="w-12 h-12 text-[#A0AEC0] mx-auto mb-3" />
            <p className="text-[#718096]">暂无歌曲</p>
          </div>
        )}
      </NeuCard>

      {/* 批量下载弹窗 */}
      {showBatchDownload && (
        <BatchDownload
          tracks={playlist.tracks}
          selectedIds={selectedTracks}
          quality={quality}
          onToggleSelection={toggleTrackSelection}
          onSelectAll={selectAllTracks}
          onClearSelection={clearSelection}
          onDownload={handleBatchDownload}
          onClose={() => setShowBatchDownload(false)}
        />
      )}
    </motion.div>
  );
};

export default PlaylistDetail;
