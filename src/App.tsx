import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Music2, 
  Play,
  Pause,
  ListMusic,
  SkipBack,
  SkipForward,
  Clock
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { NeuCard } from '@/components/neu/NeuCard';
import { NeuButton } from '@/components/neu/NeuButton';
import { FullScreenPlayer } from '@/components/player/FullScreenPlayer';
import { SearchPanel } from '@/components/search/SearchPanel';
import { SearchResults } from '@/components/search/SearchResults';
import { PlaylistDetail } from '@/components/playlist/PlaylistDetail';
import { QualitySelector } from '@/components/settings/QualitySelector';
import { usePlayerStore } from '@/stores/playerStore';
import { searchAPI } from '@/lib/api';
import { audioPlayer } from '@/lib/audioPlayer';
import { extractId } from '@/lib/utils';
import type { Track, Playlist, SearchResult } from '@/types';
import { Toaster } from '@/components/ui/sonner';
import './styles/neumorphism.css';

type Tab = 'home' | 'library' | 'playlists' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [searchType, setSearchType] = useState<'keyword' | 'song' | 'playlist' | 'album'>('keyword');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showFullScreenPlayer, setShowFullScreenPlayer] = useState(false);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [favoritePlaylistsData, setFavoritePlaylistsData] = useState<Playlist[]>([]);
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false);
  const [favoriteTracksData, setFavoriteTracksData] = useState<Track[]>([]);
  const [isLoadingFavoriteTracks, setIsLoadingFavoriteTracks] = useState(false);

  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    playMode,
    quality,
    playlist,
    favorites,
    favoritePlaylists,
    recentlyPlayed,
    play,
    togglePlay,
    setCurrentTrack,
    setCurrentTime,
    setDuration,
    setVolume,
    setPlaylist,
    next,
    prev,
    toggleMode,
    setQuality,
    toggleFavorite,
    isFavorite,
    toggleFavoritePlaylist,
    addToRecentlyPlayed,
    clearRecentlyPlayed,
  } = usePlayerStore();

  // 初始化音频播放器
  useEffect(() => {
    audioPlayer.on('timeupdate', (time: number) => {
      setCurrentTime(time);
    });

    audioPlayer.on('loadedmetadata', (duration: number) => {
      setDuration(duration);
    });

    audioPlayer.on('play', () => {
      const { play } = usePlayerStore.getState();
      play();
    });

    audioPlayer.on('pause', () => {
      const { pause } = usePlayerStore.getState();
      pause();
    });

    audioPlayer.on('ended', () => {
      next();
    });

    audioPlayer.on('error', (error: any) => {
      console.error('Audio player error:', error);
    });

    return () => {
      audioPlayer.off('timeupdate');
      audioPlayer.off('loadedmetadata');
      audioPlayer.off('play');
      audioPlayer.off('pause');
      audioPlayer.off('ended');
      audioPlayer.off('error');
    };
  }, [setCurrentTime, setDuration, next]);

  // 加载收藏的歌单数据
  useEffect(() => {
    loadFavoritePlaylistsData();
  }, [favoritePlaylists, playlist, currentTrack]);

  // 加载收藏的歌曲数据
  useEffect(() => {
    loadFavoriteTracksData();
  }, [favorites, quality]);

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setHasSearched(true);
      setIsSearching(true);
      
      try {
        // 尝试从搜索查询中提取 ID
        const extractedId = extractId(searchQuery);
        const queryToUse = extractedId || searchQuery;

        if (searchType === 'keyword') {
          // 如果提取到了 ID 且选择了关键字搜索，可能用户想搜 ID
          // 但关键字搜索通常是搜名字，所以这里我们还是用原始查询
          // 除非我们想自动检测是否是 ID 然后跳转到对应类型搜索
          // 这里保持原样，只搜关键字
          const results = await searchAPI.searchSongs(searchQuery, 99999);
          setSearchResults(results);
        } else if (searchType === 'song') {
          const songDetail = await searchAPI.getSongDetail(queryToUse, quality);
          if (songDetail) {
            setSearchResults({ songs: [songDetail] });
          } else {
            setSearchResults({ songs: [] });
          }
        } else if (searchType === 'playlist') {
          const playlist = await searchAPI.searchPlaylist(queryToUse);
          if (playlist) {
            setSearchResults({ playlists: [playlist] });
            setPlaylist(playlist.tracks || []);
          } else {
            setSearchResults({ playlists: [] });
          }
        } else if (searchType === 'album') {
          const album = await searchAPI.searchAlbum(queryToUse);
          if (album) {
            setSearchResults({ playlists: [album] });
            setPlaylist(album.tracks || []);
          } else {
            setSearchResults({ playlists: [] });
          }
        }
      } catch (error) {
        console.error('Search failed:', error);
        setSearchResults({ songs: [] });
      } finally {
        setIsSearching(false);
      }
    }
  };

  // 加载收藏的歌单数据
  const loadFavoritePlaylistsData = async () => {
    if (favoritePlaylists.length === 0) {
      setFavoritePlaylistsData([]);
      return;
    }

    setIsLoadingPlaylists(true);
    try {
      const playlists: Playlist[] = [];
      for (const playlistId of favoritePlaylists) {
        if (playlistId === 'current') {
          const currentPlaylist: Playlist = {
            id: 'current',
            name: '当前播放列表',
            description: '正在播放的歌曲列表',
            tracks: playlist,
            createdAt: new Date(),
            coverUrl: currentTrack?.coverUrl,
          };
          playlists.push(currentPlaylist);
        } else {
          const playlist = await searchAPI.searchPlaylist(playlistId);
          if (playlist) {
            playlists.push(playlist);
          }
        }
      }
      setFavoritePlaylistsData(playlists);
    } catch (error) {
      console.error('Failed to load favorite playlists:', error);
    } finally {
      setIsLoadingPlaylists(false);
    }
  };

  // 加载收藏的歌曲数据
  const loadFavoriteTracksData = async () => {
    if (favorites.length === 0) {
      setFavoriteTracksData([]);
      return;
    }

    setIsLoadingFavoriteTracks(true);
    try {
      const tracks: Track[] = [];
      for (const songId of favorites) {
        const songDetail = await searchAPI.getSongDetail(songId, quality);
        if (songDetail) {
          tracks.push(songDetail);
        }
      }
      setFavoriteTracksData(tracks);
    } catch (error) {
      console.error('Failed to load favorite tracks:', error);
    } finally {
      setIsLoadingFavoriteTracks(false);
    }
  };

  // 播放指定歌曲
  const handlePlayTrack = async (track: Track, newPlaylist?: Track[]) => {
    // 如果提供了新的播放列表，则更新播放列表
    if (newPlaylist && newPlaylist.length > 0) {
      setPlaylist(newPlaylist);
    }

    if (currentTrack?.id === track.id && track.audioUrl) {
      if (isPlaying) {
        audioPlayer.pause();
        pause();
      } else {
        audioPlayer.play();
        play();
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
      addToRecentlyPlayed(trackToPlay);
      
      if (trackToPlay.audioUrl) {
        audioPlayer.load(trackToPlay.audioUrl);
        audioPlayer.play();
        play();
      }
    }
  };

  // 选择播放列表中的歌曲
  const handleSelectTrackFromPlaylist = async (index: number) => {
    const track = playlist[index];
    if (track) {
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
        play();
      }
    }
  };

  // 播放/暂停
  const handlePlayPause = () => {
    if (isPlaying) {
      audioPlayer.pause();
    } else {
      audioPlayer.play();
    }
  };

  // 上一首
  const handlePrevious = async () => {
    prev();
    const { currentTrack: newTrack } = usePlayerStore.getState();
    if (newTrack) {
      let trackToPlay = newTrack;
      
      if (!newTrack.audioUrl) {
        const songDetail = await searchAPI.getSongDetail(newTrack.id, quality);
        if (songDetail) {
          trackToPlay = songDetail;
          setCurrentTrack(trackToPlay);
        }
      }
      
      if (trackToPlay.audioUrl) {
        audioPlayer.load(trackToPlay.audioUrl);
        audioPlayer.play();
        play();
      }
    }
  };

  // 下一首
  const handleNext = async () => {
    next();
    const { currentTrack: newTrack } = usePlayerStore.getState();
    if (newTrack) {
      let trackToPlay = newTrack;
      
      if (!newTrack.audioUrl) {
        const songDetail = await searchAPI.getSongDetail(newTrack.id, quality);
        if (songDetail) {
          trackToPlay = songDetail;
          setCurrentTrack(trackToPlay);
        }
      }
      
      if (trackToPlay.audioUrl) {
        audioPlayer.load(trackToPlay.audioUrl);
        audioPlayer.play();
        play();
      }
    }
  };

  // 跳转进度
  const handleSeek = (time: number) => {
    audioPlayer.seek(time);
    setCurrentTime(time);
  };

  // 音量变化
  const handleVolumeChange = (volume: number) => {
    setVolume(volume);
    audioPlayer.setVolume(volume);
  };

  // 渲染首页 - 搜索和搜索结果
  const renderHome = () => (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* 搜索区域 */}
      <section>
        <h2 className="text-2xl font-bold text-[#2D3748] mb-4">搜索音乐</h2>
        <SearchPanel
          searchType={searchType}
          onSearchTypeChange={setSearchType}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
        />
      </section>

      {/* 搜索结果 */}
      {hasSearched && searchResults && (
        <SearchResults
          results={searchResults}
          searchType={searchType}
          favorites={favorites}
          favoritePlaylists={favoritePlaylists}
          quality={quality}
          isSearching={isSearching}
          onPlayTrack={handlePlayTrack}
          onToggleFavorite={toggleFavorite}
          onTogglePlaylistFavorite={toggleFavoritePlaylist}
        />
      )}

      {/* 推荐歌曲 - 未搜索时显示 */}
      {!hasSearched && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#2D3748]">最近播放</h3>
            {recentlyPlayed.length > 0 && (
              <NeuButton
                variant="raised"
                size="sm"
                onClick={() => {
                  if (confirm('确定要清除所有最近播放记录吗？')) {
                    clearRecentlyPlayed();
                  }
                }}
                className="text-xs"
              >
                清除
              </NeuButton>
            )}
          </div>
          {recentlyPlayed.length === 0 ? (
            <NeuCard variant="flat" className="text-center py-8">
              <p className="text-[#718096]">暂无播放记录</p>
              <p className="text-sm text-[#A0AEC0] mt-1">播放歌曲后会显示在这里</p>
            </NeuCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {recentlyPlayed.slice(0, 5).map((track) => (
                <motion.div
                  key={track.id}
                  className="cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlayTrack(track)}
                >
                  <div
                    className="rounded-2xl overflow-hidden aspect-square mb-2"
                    style={{
                      boxShadow: '8px 8px 16px #A0AEC0, -8px -8px 16px #FFFFFF',
                    }}
                  >
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium text-[#2D3748] truncate">{track.title}</p>
                  <p className="text-xs text-[#718096] truncate">{track.artist}</p>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}
    </motion.div>
  );

  // 渲染音乐库 - 我的歌单列表
  const renderLibrary = () => {
    // 如果选择了歌单，显示详情
    if (selectedPlaylist) {
      return (
        <PlaylistDetail
          playlist={selectedPlaylist}
          isFavorite={favoritePlaylists.includes(selectedPlaylist.id)}
          favorites={favorites}
          quality={quality}
          onBack={() => setSelectedPlaylist(null)}
          onPlayTrack={handlePlayTrack}
          onToggleFavorite={toggleFavorite}
          onTogglePlaylistFavorite={() => toggleFavoritePlaylist(selectedPlaylist.id)}
        />
      );
    }

    // 动态创建我的歌单数据
    const dynamicPlaylists: Playlist[] = [
      {
        id: 'favorites',
        name: '我喜欢的音乐',
        description: '收藏的歌曲',
        tracks: favoriteTracksData,
        createdAt: new Date(),
        coverUrl: favoriteTracksData.length > 0 ? favoriteTracksData[0].coverUrl : '',
      },
      {
        id: 'recently',
        name: '最近播放',
        description: '最近听过的歌曲',
        tracks: recentlyPlayed,
        createdAt: new Date(),
        coverUrl: recentlyPlayed.length > 0 ? recentlyPlayed[0].coverUrl : '',
      },
    ];

    return (
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <h2 className="text-2xl font-bold text-[#2D3748]">我的歌单</h2>

        {/* 歌单网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dynamicPlaylists.map((pl, index) => (
            <motion.div
              key={pl.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <NeuCard
                variant="raised"
                className="cursor-pointer h-full"
                onClick={() => setSelectedPlaylist(pl)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0">
                    {pl.coverUrl ? (
                      <img
                        src={pl.coverUrl}
                        alt={pl.name}
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
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] truncate">{pl.name}</h3>
                    <p className="text-sm text-[#718096] line-clamp-1">{pl.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-[#A0AEC0]">
                      <span>{pl.tracks.length} 首</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {Math.floor(pl.tracks.reduce((sum, t) => sum + t.duration, 0) / 60)}分钟
                      </span>
                    </div>
                  </div>
                </div>
              </NeuCard>
              {pl.id === 'recently' && recentlyPlayed.length > 0 && (
                <NeuButton
                  variant="raised"
                  size="sm"
                  onClick={() => {
                    if (confirm('确定要清除所有最近播放记录吗？')) {
                      clearRecentlyPlayed();
                    }
                  }}
                  className="absolute top-2 right-2 text-xs"
                >
                  清除
                </NeuButton>
              )}
            </motion.div>
          ))}
        </div>

        {/* 收藏的歌单 */}
        <div>
          <h3 className="text-lg font-semibold text-[#2D3748] mb-4">收藏的歌单</h3>
          {isLoadingPlaylists ? (
            <NeuCard variant="flat" className="text-center py-8">
              <div className="w-8 h-8 border-4 border-[#A0AEC0] border-t-[#4A5568] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-[#718096]">加载中...</p>
            </NeuCard>
          ) : favoritePlaylistsData.length === 0 ? (
            <NeuCard variant="flat" className="text-center py-8">
              <ListMusic className="w-12 h-12 text-[#A0AEC0] mx-auto mb-3" />
              <p className="text-[#718096]">暂无收藏的歌单</p>
              <p className="text-sm text-[#A0AEC0] mt-1">搜索歌单ID即可收藏</p>
            </NeuCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoritePlaylistsData.map((pl, index) => (
                <motion.div
                  key={pl.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NeuCard
                    variant="raised"
                    className="cursor-pointer h-full"
                    onClick={() => setSelectedPlaylist(pl)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0">
                        {pl.coverUrl ? (
                          <img
                            src={pl.coverUrl}
                            alt={pl.name}
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
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-[#2D3748] truncate">{pl.name}</h3>
                        <p className="text-sm text-[#718096] line-clamp-1">{pl.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-[#A0AEC0]">
                          <span>{pl.tracks.length} 首</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(pl.tracks.reduce((sum, t) => sum + t.duration, 0) / 60)}分钟
                          </span>
                        </div>
                      </div>
                    </div>
                  </NeuCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // 渲染歌单 - 当前播放的歌单
  const renderPlaylists = () => {
    const currentPlaylist: Playlist = {
      id: 'current',
      name: '当前播放列表',
      description: '正在播放的歌曲列表',
      tracks: playlist,
      createdAt: new Date(),
      coverUrl: currentTrack?.coverUrl,
    };

    return (
      <PlaylistDetail
        playlist={currentPlaylist}
        isFavorite={favoritePlaylists.includes('current')}
        favorites={favorites}
        quality={quality}
        onBack={() => {}}
        onPlayTrack={handlePlayTrack}
        onToggleFavorite={toggleFavorite}
        onTogglePlaylistFavorite={() => toggleFavoritePlaylist('current')}
        showBackButton={false}
      />
    );
  };

  // 渲染设置
  const renderSettings = () => (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <h2 className="text-2xl font-bold text-[#2D3748]">设置</h2>
      
      {/* 音质选择 */}
      <section>
        <QualitySelector
          selectedQuality={quality}
          onQualityChange={setQuality}
          selectedDownloadFormat={usePlayerStore.getState().downloadFormat}
          onDownloadFormatChange={usePlayerStore.getState().setDownloadFormat}
        />
      </section>

      {/* 播放设置 */}
      <section>
        <h3 className="text-lg font-semibold text-[#2D3748] mb-4">播放设置(待开发中......)</h3>
        <NeuCard variant="raised">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-[#2D3748]">自动播放</h4>
                <p className="text-sm text-[#718096]">打开应用时自动开始播放</p>
              </div>
              <NeuButton
                variant="raised"
                size="sm"
                shape="circle"
              >
                <div className="w-3 h-3 rounded-full bg-[#4A5568]" />
              </NeuButton>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-[#2D3748]">淡入淡出</h4>
                <p className="text-sm text-[#718096]">歌曲切换时平滑过渡</p>
              </div>
              <NeuButton
                variant="pressed"
                size="sm"
                shape="circle"
              >
                <div className="w-3 h-3 rounded-full bg-[#A0AEC0]" />
              </NeuButton>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-[#2D3748]">歌词显示</h4>
                <p className="text-sm text-[#718096]">显示桌面歌词</p>
              </div>
              <NeuButton
                variant="raised"
                size="sm"
                shape="circle"
              >
                <div className="w-3 h-3 rounded-full bg-[#4A5568]" />
              </NeuButton>
            </div>
          </div>
        </NeuCard>
      </section>

      {/* 关于 */}
      <section>
        <h3 className="text-lg font-semibold text-[#2D3748] mb-4">关于</h3>
        <NeuCard variant="flat" className="text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            style={{
              background: '#F0F2F5',
              boxShadow: '6px 6px 12px #A0AEC0, -6px -6px 12px #FFFFFF',
            }}
          >
            <Music2 className="w-8 h-8 text-[#4A5568]" />
          </div>
          <h4 className="text-lg font-bold text-[#2D3748]">MUSIC PLAYER</h4>
          <p className="text-xs text-[#A0AEC0] mt-2">🎶</p>
          <p className="text-sm text-[#718096]">一个专门解析网易云音乐的播放器</p>
          <p className="text-xs text-[#A0AEC0] mt-2">✈️</p>
          <p className="text-sm text-[#718096]">版本 1.0.0</p>
          <p className="text-xs text-[#A0AEC0] mt-2">👻</p>
          <p className="text-sm text-[#718096]">作者：Aye·阿耶</p>
          <p className="text-xs text-[#A0AEC0] mt-2">🚩</p>
          <p className="text-xs text-[#A0AEC0] mt-2">
            新拟态风格音乐播放器
          </p>
        </NeuCard>
      </section>
    </motion.div>
  );

  return (
    <div className="neu-bg min-h-screen">
      <Toaster />
      <Navbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <main className="pt-24 pb-28 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && renderHome()}
            {activeTab === 'library' && renderLibrary()}
            {activeTab === 'playlists' && renderPlaylists()}
            {activeTab === 'settings' && renderSettings()}
          </AnimatePresence>
        </div>
      </main>

      {/* 全屏播放器 */}
      <AnimatePresence>
        {showFullScreenPlayer && (
          <FullScreenPlayer
            isOpen={showFullScreenPlayer}
            onClose={() => setShowFullScreenPlayer(false)}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            playMode={playMode}
            isFavorite={currentTrack ? isFavorite(currentTrack.id) : false}
            playlist={playlist}
            currentIndex={playlist.findIndex(t => t.id === currentTrack?.id)}
            onPlayPause={handlePlayPause}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onToggleMode={toggleMode}
            onToggleFavorite={() => currentTrack && toggleFavorite(currentTrack.id)}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onSelectTrack={handleSelectTrackFromPlaylist}
          />
        )}
      </AnimatePresence>

      {/* 底部迷你播放器 */}
      {!showFullScreenPlayer && currentTrack && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 z-40 safe-area-bottom"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="max-w-4xl mx-auto rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3 cursor-pointer"
            style={{
              background: 'rgba(240, 242, 245, 0.98)',
              backdropFilter: 'blur(10px)',
              boxShadow: '8px 8px 16px #A0AEC0, -8px -8px 16px #FFFFFF',
            }}
            onClick={() => setShowFullScreenPlayer(true)}
          >
            <motion.div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0"
              animate={{ rotate: isPlaying ? 360 : 0 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-medium text-[#2D3748] truncate">
                {currentTrack.title}
              </h4>
              <p className="text-[10px] sm:text-xs text-[#718096] truncate">{currentTrack.artist}</p>
            </div>
            
            {/* 播放控制 */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <NeuButton
                variant="raised"
                size="sm"
                shape="circle"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevious();
                }}
                className="w-9 h-9 sm:w-10 sm:h-10"
              >
                <SkipBack className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </NeuButton>
              <NeuButton
                variant="raised"
                size="md"
                shape="circle"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause();
                }}
                className="w-11 h-11 sm:w-12 sm:h-12"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5" />
                )}
              </NeuButton>
              <NeuButton
                variant="raised"
                size="sm"
                shape="circle"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="w-9 h-9 sm:w-10 sm:h-10"
              >
                <SkipForward className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </NeuButton>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default App;
