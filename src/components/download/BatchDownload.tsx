import { motion } from 'framer-motion';
import { Download, X, Check, Trash2 } from 'lucide-react';
import { NeuCard } from '@/components/neu/NeuCard';
import { NeuButton } from '@/components/neu/NeuButton';
import type { Track, AudioQuality } from '@/types';
import { cn } from '@/lib/utils';

interface BatchDownloadProps {
  tracks: Track[];
  selectedIds: string[];
  quality: AudioQuality;
  onToggleSelection: (trackId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onDownload: () => void;
  onClose: () => void;
  className?: string;
}

const qualityLabels: Record<AudioQuality, string> = {
  standard: '标准音质',
  exhigh: '极高音质',
  lossless: '无损音质',
  hires: 'Hi-Res',
  sky: '沉浸环绕声',
  jyeffect: '高清环绕声',
  jymaster: '超清母带',
};

export const BatchDownload: React.FC<BatchDownloadProps> = ({
  tracks,
  selectedIds,
  quality,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onDownload,
  onClose,
  className,
}) => {
  const isAllSelected = selectedIds.length === tracks.length && tracks.length > 0;

  return (
    <motion.div
      className={cn('fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full sm:w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] flex flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        <NeuCard variant="raised" className="flex-1 flex flex-col rounded-t-2xl sm:rounded-2xl !p-0 overflow-hidden">
          {/* Header - 固定在顶部 */}
          <div className="flex items-center justify-between p-4 border-b border-[#CBD5E0]/30 flex-shrink-0">
            <div>
              <h3 className="text-lg font-semibold text-[#2D3748]">
                批量下载
              </h3>
              <p className="text-sm text-[#718096]">
                已选择 {selectedIds.length} 首
              </p>
            </div>
            <NeuButton
              variant="raised"
              size="sm"
              shape="circle"
              onClick={onClose}
              className="w-10 h-10"
            >
              <X className="w-5 h-5" />
            </NeuButton>
          </div>

          {/* Actions - 操作按钮 */}
          <div className="flex gap-2 p-4 pb-2 flex-shrink-0">
            <NeuButton
              variant={isAllSelected ? 'pressed' : 'raised'}
              size="sm"
              onClick={isAllSelected ? onClearSelection : onSelectAll}
              className="flex-1 sm:flex-none"
            >
              {isAllSelected ? '取消全选' : '全选'}
            </NeuButton>
            {selectedIds.length > 0 && (
              <NeuButton
                variant="raised"
                size="sm"
                onClick={onClearSelection}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                清空
              </NeuButton>
            )}
          </div>

          {/* Track list - 可滚动区域 */}
          <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2 min-h-0">
            {tracks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#718096]">暂无歌曲</p>
              </div>
            ) : (
              tracks.map((track, index) => (
                <motion.div
                  key={track.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200',
                    selectedIds.includes(track.id)
                      ? 'bg-[#F0F2F5]'
                      : 'hover:bg-[#F0F2F5]/50'
                  )}
                  style={{
                    boxShadow: selectedIds.includes(track.id)
                      ? 'inset 2px 2px 4px #A0AEC0, inset -2px -2px 4px #FFFFFF'
                      : 'none',
                  }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => onToggleSelection(track.id)}
                >
                  {/* Checkbox */}
                  <div
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all',
                      selectedIds.includes(track.id)
                        ? 'bg-[#4A5568] text-white'
                        : 'bg-[#F0F2F5]'
                    )}
                    style={{
                      boxShadow: selectedIds.includes(track.id)
                        ? 'inset 2px 2px 4px rgba(0,0,0,0.2)'
                        : '2px 2px 4px #A0AEC0, -2px -2px 4px #FFFFFF',
                    }}
                  >
                    {selectedIds.includes(track.id) && <Check className="w-3.5 h-3.5" />}
                  </div>

                  {/* Cover */}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-[#2D3748] truncate">
                      {track.title}
                    </h4>
                    <p className="text-xs text-[#718096] truncate">{track.artist}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer - 固定在底部 */}
          <div className="p-4 border-t border-[#CBD5E0]/30 flex-shrink-0 bg-[#F0F2F5]">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm text-[#718096]">
                音质: <span className="text-[#4A5568] font-medium">{qualityLabels[quality]}</span>
              </div>
              <NeuButton
                variant="raised"
                size="md"
                onClick={onDownload}
                disabled={selectedIds.length === 0}
                className={cn(
                  'px-6',
                  selectedIds.length === 0 && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Download className="w-4 h-4 mr-2" />
                下载 ({selectedIds.length})
              </NeuButton>
            </div>
          </div>
        </NeuCard>
      </motion.div>
    </motion.div>
  );
};

export default BatchDownload;
