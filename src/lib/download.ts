
import { searchAPI } from './api';
import type { AudioQuality, Track } from '@/types';

export const downloadManager = {
  downloadTrack: async (track: Track, quality: AudioQuality, format: 'flac' | 'mp3' = 'flac') => {
    try {
      let downloadUrl = track.audioUrl;
      
      // If no audio URL or we want to ensure quality, fetch details
      if (!downloadUrl || quality === 'lossless' || quality === 'hires') {
        const detail = await searchAPI.getSongDetail(track.id, quality);
        if (detail && detail.audioUrl) {
          downloadUrl = detail.audioUrl;
        }
      }

      if (!downloadUrl) {
        throw new Error('无法获取下载链接');
      }

      // Fetch the file as a blob
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('下载失败');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${track.artist} - ${track.title}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return true;
    } catch (error) {
      console.error(`Download failed for ${track.title}:`, error);
      return false;
    }
  },

  downloadBatch: async (tracks: Track[], quality: AudioQuality, format: 'flac' | 'mp3' = 'flac', onProgress?: (current: number, total: number) => void) => {
    let successCount = 0;
    const total = tracks.length;

    for (let i = 0; i < total; i++) {
      if (onProgress) {
        onProgress(i + 1, total);
      }
      
      const success = await downloadManager.downloadTrack(tracks[i], quality, format);
      if (success) {
        successCount++;
      }
      
      // Add a small delay to prevent browser blocking multiple downloads or overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return successCount;
  }
};
