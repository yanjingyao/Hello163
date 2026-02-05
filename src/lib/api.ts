import type { Track, SearchResult, Playlist, AudioQuality } from '@/types';

interface SearchAPIResponse {
  data: Array<{
    album: string;
    artist_string: string;
    artists: string;
    id: number;
    name: string;
    picUrl: string;
    dt?: number; // 歌曲时长（毫秒）
  }>;
  message: string;
  status: number;
  success: boolean;
}

interface SongDetailAPIResponse {
  data: {
    al_name: string;
    ar_name: string;
    id: string;
    level: AudioQuality;
    lyric: string;
    name: string;
    pic: string;
    size: string;
    tlyric: string;
    url: string;
  };
  message: string;
  status: number;
  success: boolean;
}

interface PlaylistAPIResponse {
  data: {
    playlist: {
      coverImgUrl: string;
      creator: string;
      description: string | null;
      id: number;
      name: string;
      trackCount: number;
      tracks: Array<{
        album: string;
        artists: string;
        id: number;
        name: string;
        picUrl: string;
        dt?: number;
      }>;
    };
  };
}

interface AlbumAPIResponse {
  data: {
    album: {
      artist: string;
      coverImgUrl: string;
      description: string;
      id: number;
      name: string;
      publishTime: number;
      songs: Array<{
        album: string;
        artists: string;
        id: number;
        name: string;
        picUrl: string;
        dt?: number;
      }>;
    };
  };
  message: string;
  status: number;
  success: boolean;
}

export const searchAPI = {
  searchSongs: async (keyword: string, limit: number = 999): Promise<SearchResult> => {
    try {
      const response = await fetch('/api/Search', {
        method: 'POST',
        headers: {
          'accept': 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'priority': 'u=1, i',
          'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Microsoft Edge";v="144"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Android"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-requested-with': 'XMLHttpRequest',
          'Referer': 'https://musicapi.lxchen.cn/',
        },
        body: `keyword=${encodeURIComponent(keyword)}&limit=${limit}`,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SearchAPIResponse = await response.json();

      if (!data.success || !data.data) {
        return { songs: [] };
      }

      const tracks: Track[] = data.data.map((item) => ({
        id: String(item.id),
        title: item.name,
        artist: item.artists || item.artist_string,
        album: item.album,
        duration: item.dt ? Math.floor(item.dt / 1000) : 0,
        coverUrl: item.picUrl || '',
      }));

      return { songs: tracks };
    } catch (error) {
      console.error('Search error:', error);
      return { songs: [] };
    }
  },

  searchPlaylist: async (playlistId: string): Promise<Playlist | null> => {
    try {
      const response = await fetch(`/api/Playlist?id=${playlistId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'priority': 'u=1, i',
          'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Microsoft Edge";v="144"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Android"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-requested-with': 'XMLHttpRequest',
          'Referer': 'https://musicapi.lxchen.cn/',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PlaylistAPIResponse = await response.json();

      if (!data.data || !data.data.playlist) {
        return null;
      }

      const playlistData = data.data.playlist;
      const tracks: Track[] = playlistData.tracks.map((item) => ({
        id: String(item.id),
        title: item.name,
        artist: item.artists,
        album: item.album,
        duration: item.dt ? Math.floor(item.dt / 1000) : 0,
        coverUrl: item.picUrl || '',
      }));

      const playlist: Playlist = {
        id: String(playlistData.id),
        name: playlistData.name,
        description: playlistData.description || `创建者: ${playlistData.creator}`,
        coverUrl: playlistData.coverImgUrl || '',
        tracks: tracks,
        createdAt: new Date(),
      };

      return playlist;
    } catch (error) {
      console.error('Playlist search error:', error);
      return null;
    }
  },

  searchAlbum: async (albumId: string): Promise<Playlist | null> => {
    try {
      const response = await fetch(`/api/Album?id=${albumId}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'priority': 'u=1, i',
          'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Microsoft Edge";v="144"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Android"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-requested-with': 'XMLHttpRequest',
          'Referer': 'https://musicapi.lxchen.cn/',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AlbumAPIResponse = await response.json();

      if (!data.data || !data.data.album) {
        return null;
      }

      const albumData = data.data.album;
      const tracks: Track[] = albumData.songs.map((item) => ({
        id: String(item.id),
        title: item.name,
        artist: item.artists,
        album: item.album,
        duration: item.dt ? Math.floor(item.dt / 1000) : 0,
        coverUrl: item.picUrl || '',
      }));

      const playlist: Playlist = {
        id: String(albumData.id),
        name: albumData.name,
        description: albumData.description || `艺术家: ${albumData.artist}`,
        coverUrl: albumData.coverImgUrl || '',
        tracks: tracks,
        createdAt: new Date(albumData.publishTime),
      };

      return playlist;
    } catch (error) {
      console.error('Album search error:', error);
      return null;
    }
  },

  getSongDetail: async (songId: string, quality: AudioQuality = 'exhigh'): Promise<Track | null> => {
    try {
      const response = await fetch('/api/Song_V1', {
        method: 'POST',
        headers: {
          'accept': 'application/json, text/javascript, */*; q=0.01',
          'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
          'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'priority': 'u=1, i',
          'sec-ch-ua': '"Not(A:Brand";v="8", "Chromium";v="144", "Microsoft Edge";v="144"',
          'sec-ch-ua-mobile': '?1',
          'sec-ch-ua-platform': '"Android"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-origin',
          'x-requested-with': 'XMLHttpRequest',
          'Referer': 'https://musicapi.lxchen.cn/',
        },
        body: `url=${songId}&level=${quality}&type=json`,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: SongDetailAPIResponse = await response.json();

      if (!data.success || !data.data) {
        return null;
      }

      const songData = data.data;
      const track: Track = {
        id: songData.id,
        title: songData.name,
        artist: songData.ar_name,
        album: songData.al_name,
        duration: 0,
        coverUrl: songData.pic || '',
        audioUrl: songData.url,
        lyric: songData.lyric || songData.tlyric,
        level: songData.level,
      };

      return track;
    } catch (error) {
      console.error('Song detail error:', error);
      return null;
    }
  },
};

export default searchAPI;
