// 音乐播放器类型定义

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  coverUrl: string;
  audioUrl?: string;
  lyric?: string;
  level?: AudioQuality;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  tracks: Track[];
  createdAt: Date;
}

export type AudioQuality = 
  | 'standard' 
  | 'exhigh' 
  | 'lossless' 
  | 'hires' 
  | 'sky' 
  | 'jyeffect' 
  | 'jymaster';

export interface QualityOption {
  value: AudioQuality;
  label: string;
  description: string;
  bitrate?: string;
}

export type PlayMode = 'sequence' | 'random' | 'loop' | 'single-loop';

export type SearchType = 'keyword' | 'song' | 'playlist' | 'album';

export interface SearchResult {
  songs?: Track[];
  playlists?: Playlist[];
  albums?: any[];
}

export interface DownloadTask {
  id: string;
  trackId: string;
  trackName: string;
  progress: number;
  status: 'pending' | 'downloading' | 'completed' | 'error';
  quality: AudioQuality;
}

// 新拟态样式变体
export type NeuVariant = 'raised' | 'pressed' | 'flat';

// 组件大小
export type Size = 'sm' | 'md' | 'lg';
