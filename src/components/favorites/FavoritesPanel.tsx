import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  ListMusic,
  Clock,
  Trash2,
  Play,
  MoreVertical
} from 'lucide-react';
import { NeuButton } from '@/components/neu/NeuButton';
import { NeuCard } from '@/components/neu/NeuCard';
import { usePlayerStore } from '@/stores/playerStore';
import { searchAPI } from '@/lib/api';
import { audioPlayer } from '@/lib/audioPlayer';
import type { Track } from '@/types';
import { cn } from '@/lib/utils';

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FavoritesPanel: React.FC<FavoritesPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'songs' | 'playlists'>('songs');
  
  const {
    favorites,
    favoritePlaylists,
    isFavorite,
    toggleFavorite,
    currentTrack,
    setCurrentTrack,
    quality,
  } = usePlayerStore();

  const [favoriteTracks, setFavoriteTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadFavoriteTracks = async () => {
    if (favorites.length === 0) {
      setFavoriteTracks([]);
      return;
    }

    setIsLoading(true);
    try {
      const tracks: Track[] = [];
      for (const songId of favorites) {
        const songDetail = await searchAPI.getSongDetail(songId, quality);
        if (songDetail) {
          tracks.push(songDetail);
        }
      }
      setFavoriteTracks(tracks);
    } catch (error) {
      console.error('Failed to load favorite tracks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useState(() => {
    if (isOpen && activeTab === 'songs') {
      loadFavoriteTracks();
    }
  });

  const handlePlayTrack = async (track: Track) => {
    if (currentTrack?.id === track.id && track.audioUrl) {
      if (audioPlayer.isPlaying()) {
        audioPlayer.pause();
      } else {
        audioPlayer.play();
      }
    } else {
      let trackToPlay = track;
      
      if (!track.audioUrl) {
        const songDetail = await searchAPI.getSongDetail(track.id, quality);
        if (songDetail) {
          trackToPlay = songDetail;
        }
      }
      
      setCurrentTrack(trackToPlay);
      
      if (trackToPlay.audioUrl) {
        audioPlayer.load(trackToPlay.audioUrl);
        audioPlayer.play();
      }
    }
  };

  const handleRemoveFavorite = (trackId: string) => {
    toggleFavorite(trackId);
    setFavoriteTracks(prev => prev.filter(t => t.id !== trackId));
  };

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-[#F0F2F5] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-full flex flex-col p-4 sm:p-6">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2D3748]">
                我的收藏
              </h1>
              <NeuButton
                variant="raised"
                size="sm"
                shape="circle"
                onClick={onClose}
                className="w-11 h-11"
              >
                <MoreVertical className="w-5 h-5" />
              </NeuButton>
            </div>

            {/* 标签切换 */}
            <div className="flex gap-2 mb-6">
              <NeuButton
                variant={activeTab === 'songs' ? 'pressed' : 'raised'}
                size="sm"
                shape="rounded"
                onClick={() => setActiveTab('songs')}
                className="flex-1 py-3"
              >
                <Heart className="w-4 h-4 mr-2" />
                <span className="font-medium">喜欢的歌曲</span>
                <span className="ml-2 text-sm text-[#718096]">
                  ({favorites.length})
                </span>
              </NeuButton>
              <NeuButton
                variant={activeTab === 'playlists' ? 'pressed' : 'raised'}
                size="sm"
                shape="rounded"
                onClick={() => setActiveTab('playlists')}
                className="flex-1 py-3"
              >
                <ListMusic className="w-4 h-4 mr-2" />
                <span className="font-medium">收藏的歌单</span>
                <span className="ml-2 text-sm text-[#718096]">
                  ({favoritePlaylists.length})
                </span>
              </NeuButton>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'songs' ? (
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-12 text-[#718096]">
                      <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>加载中...</p>
                    </div>
                  ) : favoriteTracks.length === 0 ? (
                    <div className="text-center py-12 text-[#718096]">
                      <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>还没有收藏的歌曲</p>
                      <p className="text-sm mt-1">点击歌曲上的心形图标添加收藏</p>
                    </div>
                  ) : (
                    favoriteTracks.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <NeuCard className="p-3">
                          <div className="flex items-center gap-3">
                            <span className="w-6 text-center text-sm text-[#A0AEC0]">
                              {index + 1}
                            </span>
                            
                            <img
                              src={track.coverUrl}
                              alt={track.title}
                              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            />
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#2D3748] truncate">
                                {track.title}
                              </p>
                              <p className="text-xs text-[#718096] truncate">
                                {track.artist}
                              </p>
                            </div>
                            
                            <span className="text-xs text-[#A0AEC0] hidden sm:block">
                              {formatTime(track.duration)}
                            </span>
                            
                            <NeuButton
                              variant="raised"
                              size="sm"
                              shape="circle"
                              onClick={() => handlePlayTrack(track)}
                              className="w-9 h-9"
                            >
                              <Play className="w-4 h-4" />
                            </NeuButton>
                            
                            <NeuButton
                              variant="raised"
                              size="sm"
                              shape="circle"
                              onClick={() => handleRemoveFavorite(track.id)}
                              className="w-9 h-9 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </NeuButton>
                          </div>
                        </NeuCard>
                      </motion.div>
                    ))
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {favoritePlaylists.length === 0 ? (
                    <div className="text-center py-12 text-[#718096]">
                      <ListMusic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>还没有收藏的歌单</p>
                      <p className="text-sm mt-1">点击歌单上的心形图标添加收藏</p>
                    </div>
                  ) : (
                    favoritePlaylists.map((playlistId, index) => (
                      <motion.div
                        key={playlistId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <NeuCard className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#4A5568] to-[#718096] flex items-center justify-center flex-shrink-0">
                              <ListMusic className="w-6 h-6 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#2D3748] truncate">
                                歌单 ID: {playlistId}
                              </p>
                              <p className="text-xs text-[#718096]">
                                收藏的歌单
                              </p>
                            </div>
                            
                            <NeuButton
                              variant="raised"
                              size="sm"
                              shape="circle"
                              onClick={() => {
                                toggleFavorite(playlistId);
                              }}
                              className="w-9 h-9 text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </NeuButton>
                          </div>
                        </NeuCard>
                      </motion.div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
