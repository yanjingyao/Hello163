import { motion } from 'framer-motion';
import { Check, Music2, Headphones, Sparkles, Waves, Radio, Crown, Download } from 'lucide-react';
import type { AudioQuality } from '@/types';
import { cn } from '@/lib/utils';

interface QualityOption {
  value: AudioQuality;
  label: string;
  description: string;
  bitrate?: string;
}

const qualityOptions: QualityOption[] = [
  { 
    value: 'standard', 
    label: '标准音质', 
    description: '流畅播放',
    bitrate: '128kbps'
  },
  { 
    value: 'exhigh', 
    label: '极高音质', 
    description: '高品质体验',
    bitrate: '320kbps'
  },
  { 
    value: 'lossless', 
    label: '无损音质', 
    description: 'CD级音质',
    bitrate: 'FLAC'
  },
  { 
    value: 'hires', 
    label: 'Hi-Res', 
    description: 'studio级音质',
    bitrate: '96kHz/24bit'
  },
  { 
    value: 'sky', 
    label: '沉浸环绕声', 
    description: '空间音频',
    bitrate: 'Dolby Atmos'
  },
  { 
    value: 'jyeffect', 
    label: '高清环绕声', 
    description: '增强环绕效果',
    bitrate: 'DTS:X'
  },
  { 
    value: 'jymaster', 
    label: '超清母带', 
    description: '录音室母带',
    bitrate: '192kHz/24bit'
  },
];

const getQualityIcon = (value: AudioQuality) => {
  switch (value) {
    case 'standard':
      return <Music2 className="w-4 h-4" />;
    case 'exhigh':
      return <Headphones className="w-4 h-4" />;
    case 'lossless':
      return <Sparkles className="w-4 h-4" />;
    case 'hires':
      return <Waves className="w-4 h-4" />;
    case 'sky':
      return <Radio className="w-4 h-4" />;
    case 'jyeffect':
      return <Waves className="w-4 h-4" />;
    case 'jymaster':
      return <Crown className="w-4 h-4" />;
    default:
      return <Music2 className="w-4 h-4" />;
  }
};

interface QualitySelectorProps {
  selectedQuality: AudioQuality;
  onQualityChange: (quality: AudioQuality) => void;
  selectedDownloadFormat?: 'flac' | 'mp3';
  onDownloadFormatChange?: (format: 'flac' | 'mp3') => void;
  className?: string;
}

export const QualitySelector: React.FC<QualitySelectorProps> = ({
  selectedQuality,
  onQualityChange,
  selectedDownloadFormat,
  onDownloadFormatChange,
  className,
}) => {
  return (
    <div className={cn('space-y-8', className)}>
      {/* 播放音质选择 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#2D3748] mb-4">播放音质</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {qualityOptions.map((option, index) => (
            <motion.button
              key={option.value}
              className={cn(
                'relative flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200',
                selectedQuality === option.value
                  ? 'text-[#4A5568]'
                  : 'text-[#718096] hover:text-[#2D3748]'
              )}
              style={{
                background: '#F0F2F5',
                boxShadow: selectedQuality === option.value
                  ? 'inset 4px 4px 8px #A0AEC0, inset -4px -4px 8px #FFFFFF'
                  : '6px 6px 12px #A0AEC0, -6px -6px 12px #FFFFFF',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={selectedQuality !== option.value ? {
                boxShadow: '8px 8px 16px #A0AEC0, -8px -8px 16px #FFFFFF',
                y: -2,
              } : {}}
              whileTap={{
                boxShadow: 'inset 4px 4px 8px #A0AEC0, inset -4px -4px 8px #FFFFFF',
              }}
              onClick={() => onQualityChange(option.value)}
            >
              {/* Icon */}
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                selectedQuality === option.value
                  ? 'text-[#4A5568]'
                  : 'text-[#718096]'
              )}
              style={{
                background: '#F0F2F5',
                boxShadow: selectedQuality === option.value
                  ? 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF'
                  : '3px 3px 6px #A0AEC0, -3px -3px 6px #FFFFFF',
              }}
              >
                {getQualityIcon(option.value)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{option.label}</span>
                  {selectedQuality === option.value && (
                    <Check className="w-4 h-4 text-[#4A5568]" />
                  )}
                </div>
                <p className="text-xs opacity-70">{option.description}</p>
                {option.bitrate && (
                  <span className="text-xs opacity-50">{option.bitrate}</span>
                )}
              </div>

              {/* Ripple effect on select */}
              {selectedQuality === option.value && (
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    boxShadow: '0 0 20px rgba(74, 85, 104, 0.3)',
                  }}
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* 下载格式选择 */}
      {selectedDownloadFormat && onDownloadFormatChange && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-[#2D3748] mb-4">下载格式</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: 'flac', label: 'FLAC 无损格式', desc: '最佳音质，文件较大' },
              { value: 'mp3', label: 'MP3 通用格式', desc: '兼容性好，文件较小' }
            ].map((option, index) => (
              <motion.button
                key={option.value}
                className={cn(
                  'relative flex items-center gap-3 p-4 rounded-2xl text-left transition-all duration-200',
                  selectedDownloadFormat === option.value
                    ? 'text-[#4A5568]'
                    : 'text-[#718096] hover:text-[#2D3748]'
                )}
                style={{
                  background: '#F0F2F5',
                  boxShadow: selectedDownloadFormat === option.value
                    ? 'inset 4px 4px 8px #A0AEC0, inset -4px -4px 8px #FFFFFF'
                    : '6px 6px 12px #A0AEC0, -6px -6px 12px #FFFFFF',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                whileHover={selectedDownloadFormat !== option.value ? {
                  boxShadow: '8px 8px 16px #A0AEC0, -8px -8px 16px #FFFFFF',
                  y: -2,
                } : {}}
                whileTap={{
                  boxShadow: 'inset 4px 4px 8px #A0AEC0, inset -4px -4px 8px #FFFFFF',
                }}
                onClick={() => onDownloadFormatChange(option.value as 'flac' | 'mp3')}
              >
                {/* Icon */}
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  selectedDownloadFormat === option.value
                    ? 'text-[#4A5568]'
                    : 'text-[#718096]'
                )}
                style={{
                  background: '#F0F2F5',
                  boxShadow: selectedDownloadFormat === option.value
                    ? 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF'
                    : '3px 3px 6px #A0AEC0, -3px -3px 6px #FFFFFF',
                }}
                >
                  <Download className="w-4 h-4" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{option.label}</span>
                    {selectedDownloadFormat === option.value && (
                      <Check className="w-4 h-4 text-[#4A5568]" />
                    )}
                  </div>
                  <p className="text-xs opacity-70">{option.desc}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QualitySelector;
