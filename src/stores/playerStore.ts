import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track, AudioQuality, PlayMode } from '@/types';

interface PlayerState {
  // 播放状态
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  
  // 播放模式
  playMode: PlayMode;
  
  // 音质
  quality: AudioQuality;
  
  // 播放列表
  playlist: Track[];
  currentIndex: number;
  
  // 收藏
  favorites: string[];
  favoritePlaylists: string[];
  
  // 最近播放
  recentlyPlayed: Track[];
  
  // 搜索
  searchHistory: string[];
  
  // 下载
  downloadQueue: string[];
  
  // 音频播放器
  audioPlayerReady: boolean;
  
  // Actions
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setCurrentTrack: (track: Track) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  
  next: () => void;
  prev: () => void;
  toggleMode: () => void;
  setRandom: () => void;
  
  setQuality: (quality: AudioQuality) => void;
  
  setPlaylist: (tracks: Track[]) => void;
  addToPlaylist: (track: Track) => void;
  removeFromPlaylist: (trackId: string) => void;
  
  toggleFavorite: (trackId: string) => void;
  isFavorite: (trackId: string) => boolean;
  
  toggleFavoritePlaylist: (playlistId: string) => void;
  isFavoritePlaylist: (playlistId: string) => boolean;
  
  addToRecentlyPlayed: (track: Track) => void;
  clearRecentlyPlayed: () => void;
  
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  addToDownloadQueue: (trackId: string) => void;
  removeFromDownloadQueue: (trackId: string) => void;
  clearDownloadQueue: () => void;
  
  setAudioPlayerReady: (ready: boolean) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isPlaying: false,
      currentTrack: null,
      currentTime: 0,
      duration: 0,
      volume: 50,
      playMode: 'sequence',
      quality: 'exhigh',
      downloadFormat: 'flac',
      playlist: [],
      currentIndex: 0,
      favorites: [],
      favoritePlaylists: [],
      recentlyPlayed: [],
      searchHistory: [],
      downloadQueue: [],
      audioPlayerReady: false,
      
      // 播放控制
      play: () => set({ isPlaying: true }),
      pause: () => set({ isPlaying: false }),
      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      setCurrentTrack: (track) => set({ 
        currentTrack: track, 
        currentIndex: get().playlist.findIndex(t => t.id === track.id) 
      }),
      
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),
      setVolume: (volume) => set({ volume }),
      
      // 切换歌曲
      next: () => {
        const { playlist, currentIndex, playMode } = get();
        if (playlist.length === 0) return;
        
        let nextIndex: number;
        if (playMode === 'random') {
          nextIndex = Math.floor(Math.random() * playlist.length);
        } else if (playMode === 'single-loop') {
          nextIndex = currentIndex;
        } else {
          nextIndex = (currentIndex + 1) % playlist.length;
        }
        
        set({ 
          currentIndex: nextIndex, 
          currentTrack: playlist[nextIndex],
          isPlaying: true 
        });
      },
      
      prev: () => {
        const { playlist, currentIndex } = get();
        if (playlist.length === 0) return;
        
        const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
        set({ 
          currentIndex: prevIndex, 
          currentTrack: playlist[prevIndex],
          isPlaying: true 
        });
      },
      
      // 播放模式
      toggleMode: () => {
        const modes: PlayMode[] = ['sequence', 'random', 'loop', 'single-loop'];
        const currentIndex = modes.indexOf(get().playMode);
        const nextMode = modes[(currentIndex + 1) % modes.length];
        set({ playMode: nextMode });
      },
      
      setRandom: () => {
        const { playlist } = get();
        if (playlist.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * playlist.length);
        set({ 
          currentIndex: randomIndex, 
          currentTrack: playlist[randomIndex],
          isPlaying: true,
          playMode: 'random'
        });
      },
      
      // 音质
      setQuality: (quality) => set({ quality }),
      
      // 下载格式
      setDownloadFormat: (format) => set({ downloadFormat: format }),

      // 播放列表
      setPlaylist: (tracks) => set({ playlist: tracks }),
      
      addToPlaylist: (track) => set((state) => ({
        playlist: [...state.playlist, track]
      })),
      
      removeFromPlaylist: (trackId) => set((state) => ({
        playlist: state.playlist.filter(t => t.id !== trackId)
      })),
      
      // 收藏
      toggleFavorite: (trackId) => set((state) => ({
        favorites: state.favorites.includes(trackId)
          ? state.favorites.filter(id => id !== trackId)
          : [...state.favorites, trackId]
      })),
      
      isFavorite: (trackId) => get().favorites.includes(trackId),
      
      toggleFavoritePlaylist: (playlistId) => set((state) => ({
        favoritePlaylists: state.favoritePlaylists.includes(playlistId)
          ? state.favoritePlaylists.filter(id => id !== playlistId)
          : [...state.favoritePlaylists, playlistId]
      })),
      
      isFavoritePlaylist: (playlistId) => get().favoritePlaylists.includes(playlistId),
      
      // 最近播放
      addToRecentlyPlayed: (track) => set((state) => ({
        recentlyPlayed: [track, ...state.recentlyPlayed.filter(t => t.id !== track.id)].slice(0, 20)
      })),
      
      clearRecentlyPlayed: () => set({ recentlyPlayed: [] }),
      
      // 搜索历史
      addSearchHistory: (query) => set((state) => ({
        searchHistory: [query, ...state.searchHistory.filter(q => q !== query)].slice(0, 10)
      })),
      
      clearSearchHistory: () => set({ searchHistory: [] }),
      
      // 下载队列
      addToDownloadQueue: (trackId) => set((state) => ({
        downloadQueue: [...state.downloadQueue, trackId]
      })),
      
      removeFromDownloadQueue: (trackId) => set((state) => ({
        downloadQueue: state.downloadQueue.filter(id => id !== trackId)
      })),
      
      clearDownloadQueue: () => set({ downloadQueue: [] }),
      
      setAudioPlayerReady: (ready: boolean) => set({ audioPlayerReady: ready }),
    }),
    {
      name: 'music-player-storage',
      partialize: (state) => ({
        favorites: state.favorites,
        favoritePlaylists: state.favoritePlaylists,
        recentlyPlayed: state.recentlyPlayed,
        searchHistory: state.searchHistory,
        volume: state.volume,
        quality: state.quality,
      }),
    }
  )
);

export default usePlayerStore;
