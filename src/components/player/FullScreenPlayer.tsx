import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat,
  Repeat1,
  Heart,
  ListMusic,
  ChevronDown,
  Maximize2,
  Minimize2,
  Volume2,
  Volume1,
  VolumeX
} from 'lucide-react';
import { NeuButton } from '@/components/neu/NeuButton';
import type { Track, PlayMode } from '@/types';
import { cn } from '@/lib/utils';

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playMode: PlayMode;
  isFavorite: boolean;
  playlist: Track[];
  currentIndex: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleMode: () => void;
  onToggleFavorite: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onSelectTrack: (index: number) => void;
}

// 解析歌词
const parseLyrics = (lyric: string | undefined): Array<{ time: number; text: string }> => {
  if (!lyric) return [];
  
  const lines: Array<{ time: number; text: string }> = [];
  const timeRegex = /\[(\d+):(\d+\.\d+)\](.*)/g;
  
  let match;
  while ((match = timeRegex.exec(lyric)) !== null) {
    const minutes = parseInt(match[1]);
    const seconds = parseFloat(match[2]);
    const time = minutes * 60 + seconds;
    const text = match[3].trim();
    
    if (text) {
      lines.push({ time, text });
    }
  }
  
  return lines;
};

// 空歌词数据（当没有歌词时返回空数组）
const emptyLyrics: Array<{ time: number; text: string }> = [];

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  volume,
  playMode,
  isFavorite,
  playlist,
  currentIndex,
  onPlayPause,
  onPrevious,
  onNext,
  onToggleMode,
  onToggleFavorite,
  onSeek,
  onVolumeChange,
  onSelectTrack,
}) => {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const lyricsRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // 获取当前播放模式图标和标题
  const getModeInfo = () => {
    switch (playMode) {
      case 'random':
        return { icon: <Shuffle className="w-5 h-5 sm:w-6 sm:h-6" />, title: '随机播放' };
      case 'loop':
        return { icon: <Repeat className="w-5 h-5 sm:w-6 sm:h-6" />, title: '列表循环' };
      case 'single-loop':
        return { icon: <Repeat1 className="w-5 h-5 sm:w-6 sm:h-6" />, title: '单曲循环' };
      default:
        return { icon: <Repeat className="w-5 h-5 sm:w-6 sm:h-6 text-[#A0AEC0]" />, title: '顺序播放' };
    }
  };

  // 全屏切换
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await playerRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.log('Fullscreen not supported');
      }
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // 监听全屏变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // 歌词滚动到当前行 - 精准居中
  useEffect(() => {
    if (!lyricsRef.current || !showLyrics) return;
    
    const lyrics = currentTrack?.lyric ? parseLyrics(currentTrack.lyric) : emptyLyrics;
    const currentLineIndex = lyrics.findIndex((line, index) => {
      const nextLine = lyrics[index + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });
    
    if (currentLineIndex >= 0) {
      const lyricsContainer = lyricsRef.current.children[1] as HTMLElement;
      if (lyricsContainer) {
        const lineElement = lyricsContainer.children[currentLineIndex] as HTMLElement;
        if (lineElement) {
          const containerRect = lyricsRef.current.getBoundingClientRect();
          const lineRect = lineElement.getBoundingClientRect();
          const scrollTop = lyricsRef.current.scrollTop;
          const lineCenter = lineRect.top + lineRect.height / 2 - containerRect.top + scrollTop;
          const containerCenter = containerRect.height / 2;
          const targetScroll = lineCenter - containerCenter;
          
          lyricsRef.current.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
        }
      }
    }
  }, [currentTime, showLyrics, currentTrack?.lyric]);

  // 格式化时间
  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 进度条点击
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    const newTime = (percentage / 100) * (duration || 100);
    onSeek(newTime);
  };

  // 迷你播放器视图
  if (isMinimized) {
    return (
      <motion.div
        ref={playerRef}
        className="fixed bottom-4 right-4 z-50"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div
          className="rounded-2xl p-2 sm:p-3 flex items-center gap-2 sm:gap-3 cursor-pointer"
          style={{
            background: 'rgba(240, 242, 245, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '8px 8px 16px #A0AEC0, -8px -8px 16px #FFFFFF',
          }}
          onClick={() => setIsMinimized(false)}
        >
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex-shrink-0"
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          >
            <img
              src={currentTrack?.coverUrl}
              alt={currentTrack?.title}
              className="w-full h-full object-cover"
            />
          </motion.div>
          <div className="hidden sm:block max-w-[120px]">
            <p className="text-sm font-medium text-[#2D3748] truncate">{currentTrack?.title}</p>
            <p className="text-xs text-[#718096] truncate">{currentTrack?.artist}</p>
          </div>
          <NeuButton
            variant="pressed"
            size="sm"
            shape="circle"
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause();
            }}
            className="w-10 h-10"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </NeuButton>
        </div>
      </motion.div>
    );
  }

  // 判断是否显示控制栏
  const showControls = !showLyrics && !showPlaylist;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={playerRef}
          className={cn(
            'fixed inset-0 z-50 bg-[#F0F2F5] overflow-hidden',
            isFullscreen && 'flex items-center justify-center'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* 背景模糊效果 */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `url(${currentTrack?.coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(100px)',
            }}
          />

          {/* 主内容区 */}
          <div className={cn(
            'relative h-full flex flex-col',
            isFullscreen ? 'max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8' : 'p-4'
          )}>
            {/* 顶部工具栏 */}
            <div className="flex items-center justify-between mb-4">
              <NeuButton
                variant="raised"
                size="sm"
                shape="circle"
                onClick={onClose}
                className="w-11 h-11 sm:w-12 sm:h-12"
              >
                <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
              </NeuButton>

              {/* 中间：歌词/列表切换按钮 */}
              <div className="flex items-center gap-2">
                <NeuButton
                  variant={showLyrics ? 'pressed' : 'raised'}
                  size="sm"
                  shape="rounded"
                  onClick={() => {
                    setShowLyrics(!showLyrics);
                    setShowPlaylist(false);
                  }}
                  className="px-4 py-2"
                >
                  <span className="text-sm font-medium">歌词</span>
                </NeuButton>
                <NeuButton
                  variant={showPlaylist ? 'pressed' : 'raised'}
                  size="sm"
                  shape="rounded"
                  onClick={() => {
                    setShowPlaylist(!showPlaylist);
                    setShowLyrics(false);
                  }}
                  className="px-4 py-2"
                >
                  <ListMusic className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">列表</span>
                </NeuButton>
              </div>

              <div className="flex items-center gap-2">
                {/* 全屏切换 */}
                <NeuButton
                  variant="raised"
                  size="sm"
                  shape="circle"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? '退出全屏' : '全屏'}
                  className="w-11 h-11 sm:w-12 sm:h-12"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                </NeuButton>
              </div>
            </div>

            {/* 中间内容区 */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* 唱片封面区 - 始终显示 */}
              <div className={cn(
                'flex flex-col items-center justify-center transition-all duration-300',
                (showLyrics || showPlaylist) ? 'hidden' : 'flex flex-1'
              )}>
                {/* 老式唱片机样式封面 */}
                <div className="relative">
                  {/* 外圈装饰 */}
                  <div 
                    className="absolute -inset-3 sm:-inset-4 rounded-full"
                    style={{
                      background: 'linear-gradient(145deg, #e6e8eb, #ffffff)',
                      boxShadow: '8px 8px 16px #A0AEC0, -8px -8px 16px #FFFFFF',
                    }}
                  />
                  
                  {/* 唱片封面 */}
                  <motion.div
                    className="relative w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden"
                    style={{
                      boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.1), inset -4px -4px 8px rgba(255,255,255,0.5)',
                    }}
                    animate={{ rotate: isPlaying ? 360 : 0 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <img
                      src={currentTrack?.coverUrl}
                      alt={currentTrack?.title}
                      className="w-full h-full object-cover"
                    />
                    
                    中心收藏按钮
                    <motion.div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                    </motion.div>
                  </motion.div>
                </div>

                {/* 歌曲信息 */}
                <div className="mt-6 sm:mt-8 text-center px-4">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#2D3748] truncate max-w-xs sm:max-w-md">
                    {currentTrack?.title}
                  </h2>
                  <p className="text-base sm:text-lg text-[#718096] mt-2">
                    {currentTrack?.artist}
                  </p>
                  <p className="text-sm text-[#A0AEC0] mt-1">
                    {currentTrack?.album}
                  </p>
                </div>

                {/* 小歌词 - 当前播放歌词 */}
                <div className="mt-4 sm:mt-6 px-4 min-h-[3rem] flex items-center justify-center">
                  {(() => {
                    const lyrics = currentTrack?.lyric ? parseLyrics(currentTrack.lyric) : emptyLyrics;
                    const currentLine = lyrics.find((line, index) => {
                      const nextLine = lyrics[index + 1];
                      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
                    });
                    
                    return currentLine ? (
                      <motion.p
                        key={currentLine.text}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center text-base sm:text-lg font-medium text-[#4A5568] px-4 py-2 rounded-xl"
                        style={{
                          background: 'rgba(240, 242, 245, 0.5)',
                          boxShadow: 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF',
                        }}
                      >
                        {currentLine.text}
                      </motion.p>
                    ) : (
                      <p className="text-sm text-[#A0AEC0]">音乐播放中...</p>
                    );
                  })()}
                </div>
              </div>

              {/* 歌词区 */}
              {showLyrics && (
                <div className="flex-1 flex flex-col overflow-hidden relative">
                  <div 
                    ref={lyricsRef}
                    className="flex-1 overflow-y-auto px-4 scrollbar-hide"
                    style={{
                      maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                      scrollBehavior: 'smooth',
                    }}
                  >
                    {/* 顶部占位 */}
                    <div className="h-[50%]" />
                    
                    {/* 歌词内容 */}
                    <div className="space-y-6 sm:space-y-8 py-4">
                      {(currentTrack?.lyric ? parseLyrics(currentTrack.lyric) : mockLyrics).map((line, index) => {
                        const lyrics = currentTrack?.lyric ? parseLyrics(currentTrack.lyric) : emptyLyrics;
                        const isActive = currentTime >= line.time && 
                          (!lyrics[index + 1] || currentTime < lyrics[index + 1].time);
                        const isPast = currentTime > line.time && !isActive;
                        
                        return (
                          <motion.div
                            key={index}
                            className="text-center transition-all duration-500 py-3 cursor-pointer"
                            animate={{
                              opacity: isActive ? 1 : isPast ? 0.3 : 0.5,
                            }}
                            onClick={() => onSeek(line.time)}
                            whileHover={{ scale: isActive ? 1.05 : 1.02 }}
                          >
                            <p className={cn(
                              'transition-all duration-300 leading-relaxed',
                              isActive 
                                ? 'text-xl sm:text-2xl md:text-3xl font-bold text-[#2D3748]' 
                                : 'text-base sm:text-lg text-[#A0AEC0]'
                            )}>
                              {line.text}
                            </p>
                          </motion.div>
                        );
                      })}
                    </div>
                    
                    {/* 底部占位 */}
                    <div className="h-[50%]" />
                  </div>
                  
                  {/* 中心线提示 */}
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-[#4A5568]/10 to-transparent" />
                  </div>
                </div>
              )}

              {/* 播放列表区 */}
              {showPlaylist && (
                <div className="flex-1 flex flex-col overflow-hidden">
                  <p className="text-sm text-[#718096] mb-3 px-1">共 {playlist.length} 首</p>
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                    {playlist.map((track, index) => (
                      <motion.div
                        key={track.id}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200',
                          currentIndex === index 
                            ? 'bg-[#F0F2F5]' 
                            : 'hover:bg-[#F0F2F5]/50'
                        )}
                        style={{
                          boxShadow: currentIndex === index
                            ? 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF'
                            : 'none',
                        }}
                        onClick={() => onSelectTrack(index)}
                        whileHover={currentIndex !== index ? {
                          boxShadow: '3px 3px 6px #A0AEC0, -3px -3px 6px #FFFFFF',
                        } : {}}
                      >
                        <span className={cn(
                          'w-6 text-center text-sm',
                          currentIndex === index ? 'text-[#4A5568] font-bold' : 'text-[#A0AEC0]'
                        )}>
                          {currentIndex === index && isPlaying ? (
                            <span className="flex gap-0.5 justify-center">
                              <span className="w-0.5 h-3 bg-[#4A5568] animate-pulse" />
                              <span className="w-0.5 h-3 bg-[#4A5568] animate-pulse delay-75" />
                              <span className="w-0.5 h-3 bg-[#4A5568] animate-pulse delay-150" />
                            </span>
                          ) : (
                            index + 1
                          )}
                        </span>
                        <img
                          src={track.coverUrl}
                          alt={track.title}
                          className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            'text-sm font-medium truncate',
                            currentIndex === index ? 'text-[#4A5568]' : 'text-[#2D3748]'
                          )}>
                            {track.title}
                          </p>
                          <p className="text-xs text-[#718096] truncate">{track.artist}</p>
                        </div>
                        <span className="text-xs text-[#A0AEC0]">
                          {formatTime(track.duration)}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 底部控制栏 - 仅在显示封面时显示 */}
            {showControls && (
              <div className="mt-4 pt-4 border-t border-[#CBD5E0]/30">
                {/* 进度条 - 无圆点样式 */}
                <div className="mb-4 px-1">
                  <div 
                    ref={progressRef}
                    className="relative h-2 rounded-full cursor-pointer"
                    style={{
                      background: '#F0F2F5',
                      boxShadow: 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF',
                    }}
                    onClick={handleProgressClick}
                  >
                    <div
                      className="absolute h-full rounded-full transition-all duration-100"
                      style={{
                        width: `${((currentTime / (duration || 100)) * 100)}%`,
                        background: 'linear-gradient(90deg, #4A5568, #718096)',
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs sm:text-sm text-[#718096]">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* 控制按钮 */}
                <div className="flex items-center justify-center gap-3 sm:gap-6">
                  {/* 播放模式 */}
                  <NeuButton
                    variant="raised"
                    size="sm"
                    shape="circle"
                    onClick={onToggleMode}
                    title={getModeInfo().title}
                    className={cn(
                      'w-11 h-11 sm:w-12 sm:h-12',
                      playMode !== 'sequence' && 'text-[#4A5568]'
                    )}
                  >
                    {getModeInfo().icon}
                  </NeuButton>

                  {/* 上一首 */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <NeuButton
                      variant="raised"
                      size="md"
                      shape="circle"
                      onClick={onPrevious}
                      className="w-12 h-12 sm:w-14 sm:h-14"
                    >
                      <SkipBack className="w-5 h-5 sm:w-6 sm:h-6" />
                    </NeuButton>
                  </motion.div>

                  {/* 播放/暂停 */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <NeuButton
                      variant="raised"
                      size="lg"
                      shape="circle"
                      onClick={onPlayPause}
                      className="w-16 h-16 sm:w-20 sm:h-20"
                    >
                      {isPlaying ? (
                        <Pause className="w-7 h-7 sm:w-10 sm:h-10" />
                      ) : (
                        <Play className="w-7 h-7 sm:w-10 sm:h-10 ml-1" />
                      )}
                    </NeuButton>
                  </motion.div>

                  {/* 下一首 */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <NeuButton
                      variant="raised"
                      size="md"
                      shape="circle"
                      onClick={onNext}
                      className="w-12 h-12 sm:w-14 sm:h-14"
                    >
                      <SkipForward className="w-5 h-5 sm:w-6 sm:h-6" />
                    </NeuButton>
                  </motion.div>

                  {/* 收藏 */}
                  <NeuButton
                    variant={isFavorite ? 'pressed' : 'raised'}
                    size="sm"
                    shape="circle"
                    onClick={onToggleFavorite}
                    className={cn(
                      'w-11 h-11 sm:w-12 sm:h-12',
                      isFavorite && 'text-red-500'
                    )}
                  >
                    <Heart className={cn('w-5 h-5 sm:w-6 sm:h-6', isFavorite && 'fill-current')} />
                  </NeuButton>

                  {/* 音量控制 - 桌面端显示 */}
                  <div className="hidden lg:flex items-center gap-2 ml-2">
                    <NeuButton
                      variant="raised"
                      size="sm"
                      shape="circle"
                      onClick={() => onVolumeChange(volume === 0 ? 50 : 0)}
                      className="w-10 h-10"
                    >
                      {volume === 0 ? <VolumeX className="w-4 h-4" /> : 
                       volume < 50 ? <Volume1 className="w-4 h-4" /> : 
                       <Volume2 className="w-4 h-4" />}
                    </NeuButton>
                    <div className="w-20">
                      <div 
                        className="relative h-2 rounded-full cursor-pointer"
                        style={{
                          background: '#F0F2F5',
                          boxShadow: 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF',
                        }}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          const percentage = ((e.clientX - rect.left) / rect.width) * 100;
                          onVolumeChange(Math.round(percentage));
                        }}
                      >
                        <div
                          className="absolute h-full rounded-full"
                          style={{
                            width: `${volume}%`,
                            background: 'linear-gradient(90deg, #4A5568, #718096)',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FullScreenPlayer;
