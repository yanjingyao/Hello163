import { motion } from 'framer-motion';
import { Music, Library, ListMusic, Settings, User, Heart } from 'lucide-react';
import { NeuButton } from '@/components/neu/NeuButton';
import { cn } from '@/lib/utils';

type Tab = 'home' | 'library' | 'playlists' | 'settings';

interface NavbarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  className?: string;
}

const tabs: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: 'home', label: '首页', icon: <Music className="w-5 h-5" /> },
  { value: 'library', label: '音乐库', icon: <Library className="w-5 h-5" /> },
  { value: 'playlists', label: '当前列表', icon: <ListMusic className="w-5 h-5" /> },
  { value: 'settings', label: '设置', icon: <Settings className="w-5 h-5" /> },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <motion.nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-4 py-3',
        className
      )}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
    >
      <div
        className="max-w-6xl mx-auto rounded-2xl px-4 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(240, 242, 245, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: '8px 8px 16px #A0AEC0, -8px -8px 16px #FFFFFF',
        }}
      >
        {/* Logo - 点击返回首页 */}
        <motion.div 
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onTabChange('home')}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: '#F0F2F5',
              boxShadow: activeTab === 'home' 
                ? '4px 4px 8px #A0AEC0, -4px -4px 8px #FFFFFF'
                : '4px 4px 8px #A0AEC0, -4px -4px 8px #FFFFFF',
            }}
          >
            <Music className="w-5 h-5 text-[#4A5568]" />
          </div>
          <span className="text-lg font-bold text-[#2D3748] hidden sm:block">
            HELLO 163MUSIC
          </span>
        </motion.div>

        {/* Navigation tabs */}
        <div className="flex items-center gap-1 sm:gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.value}
              className={cn(
                'flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                activeTab === tab.value
                  ? 'text-[#4A5568]'
                  : 'text-[#718096] hover:text-[#2D3748]'
              )}
              style={{
                background: '#F0F2F5',
                boxShadow: activeTab === tab.value
                  ? 'inset 3px 3px 6px #A0AEC0, inset -3px -3px 6px #FFFFFF'
                  : 'none',
              }}
              whileHover={activeTab !== tab.value ? {
                boxShadow: '4px 4px 8px #A0AEC0, -4px -4px 8px #FFFFFF',
              } : {}}
              whileTap={{
                boxShadow: 'inset 3px 3px 6px #A0AEC0, inset -3px -3px 6px #FFFFFF',
              }}
              onClick={() => onTabChange(tab.value)}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
