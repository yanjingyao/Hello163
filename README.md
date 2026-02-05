# AGENTS.md - Neumorphism Music Player

> This file contains essential information for AI coding agents working on this project.
> Last updated: 2026-02-05

## Project Overview

这是一个**新拟态风格 (Neumorphism)** 的网页音乐播放器应用，基于 React + TypeScript + Vite 构建。应用集成了第三方音乐 API，支持歌曲搜索、播放、歌单管理、收藏等功能。

### Key Features

- 🔍 歌曲/歌单/专辑搜索（支持关键词、ID 搜索）
- 🎵 音乐播放控制（播放/暂停/上一首/下一首/进度拖动）
- 📋 播放列表管理（当前播放、收藏歌单）
- ❤️ 收藏功能（歌曲收藏、歌单收藏）
- 🕐 最近播放记录
- 🎚️ 音质选择（标准、极高、无损、Hi-Res 等）
- 📱 响应式设计，适配移动端

---

## Technology Stack

| Category         | Technology                             |
| ---------------- | -------------------------------------- |
| Framework        | React 19.2 + TypeScript 5.9            |
| Build Tool       | Vite 7.2                               |
| UI Components    | shadcn/ui + Radix UI                   |
| Styling          | Tailwind CSS 3.4 + 自定义 Neumorphism CSS |
| State Management | Zustand 5.0 (with persist middleware)  |
| Animation        | Framer Motion                          |
| Icons            | Lucide React                           |
| Form Handling    | React Hook Form + Zod                  |
| API Client       | Native Fetch                           |

---

## Project Structure

```
my-app/
├── src/
│   ├── components/           # React 组件
│   │   ├── ui/              # shadcn/ui 基础组件 (50+ 组件)
│   │   ├── neu/             # 新拟态风格自定义组件
│   │   │   ├── NeuButton.tsx
│   │   │   ├── NeuCard.tsx
│   │   │   ├── NeuInput.tsx
│   │   │   └── NeuSlider.tsx
│   │   ├── player/          # 播放器相关组件
│   │   │   ├── FullScreenPlayer.tsx
│   │   │   ├── PlayControls.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── VolumeControl.tsx
│   │   │   └── AlbumCover.tsx
│   │   ├── search/          # 搜索相关组件
│   │   ├── playlist/        # 歌单相关组件
│   │   ├── favorites/       # 收藏相关组件
│   │   ├── settings/        # 设置相关组件
│   │   ├── download/        # 下载相关组件
│   │   └── Navbar.tsx       # 顶部导航栏
│   ├── stores/              # Zustand 状态管理
│   │   └── playerStore.ts   # 播放器状态存储
│   ├── lib/                 # 工具库
│   │   ├── api.ts           # 音乐 API 接口
│   │   ├── audioPlayer.ts   # 音频播放器服务
│   │   └── utils.ts         # 工具函数 (cn)
│   ├── hooks/               # 自定义 Hooks
│   │   └── use-mobile.ts    # 移动端检测
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts
│   ├── styles/              # 样式文件
│   │   └── neumorphism.css  # 新拟态样式系统
│   ├── index.css            # 全局样式 + Tailwind
│   ├── main.tsx             # 应用入口
│   └── App.tsx              # 根组件
├── dist/                    # 构建输出目录
├── components.json          # shadcn/ui 配置
├── vite.config.ts           # Vite 配置
├── tailwind.config.js       # Tailwind 配置
├── tsconfig.json            # TypeScript 配置
└── package.json
```

---

## Build Commands

```bash
# 开发服务器
npm run dev

# 生产构建
npm run build

# 代码检查
npm run lint

# 预览生产构建
npm run preview
```

---

## Code Style Guidelines

### TypeScript

- 严格模式启用 (`strict: true`)
- 使用 `@/*` 路径别名引用 src 目录下的模块
- 类型定义放在 `src/types/index.ts`
- 接口命名使用 PascalCase (e.g., `Track`, `Playlist`)

### React

- 使用函数组件 + Hooks
- Props 接口命名：`{ComponentName}Props`
- 事件处理函数命名：`handle{Event}` (e.g., `handlePlay`, `handleSearch`)
- 使用 `React.FC<Props>` 定义组件类型

### CSS/Styling

- 优先使用 Tailwind CSS 工具类
- 新拟态样式使用自定义 CSS 变量和类名 (位于 `src/styles/neumorphism.css`)
- 颜色方案：
  - 背景色: `#F0F2F5`
  - 主文字: `#2D3748`
  - 次要文字: `#718096`
  - 阴影暗色: `#A0AEC0`
  - 阴影亮色: `#FFFFFF`

### Neumorphism Design System

核心样式类（定义在 `neumorphism.css`）：

- `.neu-raised` - 凸起效果
- `.neu-pressed` - 凹陷效果
- `.neu-flat` - 扁平效果
- `.neu-hover` - 悬停抬起效果
- `.neu-input` - 输入框样式
- `.neu-slider-track/thumb/fill` - 滑块样式

---

## API Integration

应用使用代理访问音乐 API，开发环境下通过 Vite 代理：

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'https://musicapi.lxchen.cn',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    },
  },
}
```

### 主要 API 端点

| Endpoint                | Method | Description |
| ----------------------- | ------ | ----------- |
| `/api/Search`           | POST   | 搜索歌曲        |
| `/api/Playlist?id={id}` | GET    | 获取歌单详情      |
| `/api/Album?id={id}`    | GET    | 获取专辑详情      |
| `/api/Song_V1`          | POST   | 获取歌曲播放地址和详情 |

---

## State Management

使用 Zustand 管理全局状态，数据持久化到 localStorage：

```typescript
// src/stores/playerStore.ts
interface PlayerState {
  isPlaying: boolean;
  currentTrack: Track | null;
  currentTime: number;
  duration: number;
  volume: number;
  playMode: PlayMode;        // 'sequence' | 'random' | 'loop' | 'single-loop'
  quality: AudioQuality;     // 'standard' | 'exhigh' | 'lossless' | etc.
  playlist: Track[];
  currentIndex: number;
  favorites: string[];       // 收藏歌曲 ID 列表
  favoritePlaylists: string[]; // 收藏歌单 ID 列表
  recentlyPlayed: Track[];   // 最近播放（最多 20 条）
  searchHistory: string[];
}
```

**持久化字段**: `favorites`, `favoritePlaylists`, `recentlyPlayed`, `searchHistory`, `volume`, `quality`

---

## Audio Player Service

音频播放由自定义的 `AudioPlayerService` 类处理（单例模式）：

```typescript
// src/lib/audioPlayer.ts
class AudioPlayerService {
  load(url: string): void
  play(): void
  pause(): void
  seek(time: number): void
  setVolume(volume: number): void  // 0-100
  on(event: string, callback: Function): void
  off(event: string, callback: Function): void
}
```

支持的事件: `timeupdate`, `ended`, `loadedmetadata`, `error`, `play`, `pause`

---

## Component Conventions

### shadcn/ui Components

- 位于 `src/components/ui/`
- 使用 `cn()` 工具函数合并类名
- 支持 `className` prop 进行样式覆盖

### Custom Neu Components

- 位于 `src/components/neu/`
- 通用 props:
  - `variant`: `'raised' | 'pressed' | 'flat'`
  - `size`: `'sm' | 'md' | 'lg'`
  - `className`: 额外类名

### Type Definitions

```typescript
// src/types/index.ts
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
```

---

## Testing Instructions

> ⚠️ 当前项目没有配置测试框架。如需添加测试，建议：
> 
> - 单元测试: Vitest + React Testing Library
> - E2E 测试: Playwright

---

## Deployment Notes

### Build Output

- 构建目录: `dist/`
- 静态资源: `dist/assets/`
- 入口文件: `dist/index.html`

### Environment Considerations

- 应用依赖外部音乐 API，需要确保网络可访问 `musicapi.lxchen.cn`
- 生产部署时需配置相应的 API 代理
- 音频播放需要用户交互后才能自动播放（浏览器策略）

---

## Security Considerations

1. **API 代理**: 开发环境使用 Vite 代理，生产环境需要相应配置
2. **XSS**: 使用 React 的自动转义，避免直接插入 HTML
3. **CORS**: API 请求需要处理跨域问题
4. **本地存储**: 敏感数据不要存储在 localStorage（当前存储的是歌曲ID等非敏感信息）

---

## Common Tasks

### 添加新的 API 接口

在 `src/lib/api.ts` 中添加：

```typescript
export const searchAPI = {
  // ... existing methods
  newMethod: async (): Promise<ReturnType> => {
    const response = await fetch('/api/Endpoint');
    return response.json();
  }
};
```

### 添加新组件

1. 在对应目录创建 `.tsx` 文件
2. 定义 Props 接口
3. 使用 `React.FC<Props>` 导出组件
4. 使用 `@/lib/utils` 中的 `cn()` 合并类名

### 修改主题颜色

编辑 `src/styles/neumorphism.css` 中的 CSS 变量：

```css
:root {
  --bg-primary: #F0F2F5;
  --text-primary: #2D3748;
  --shadow-dark: #A0AEC0;
  --shadow-light: #FFFFFF;
}
```

---

## Troubleshooting

| Issue   | Solution                              |
| ------- | ------------------------------------- |
| 音频无法播放  | 检查音频 URL 是否有效，可能需要重新获取歌曲详情            |
| 搜索无结果   | 检查 API 代理配置，确认网络连接                    |
| 样式不生效   | 确认已导入 `neumorphism.css` 和 `index.css` |
| 状态未持久化  | 检查 localStorage 是否被禁用或清除              |
| 移动端触摸问题 | 检查 `touch-action` CSS 属性设置            |

---

## External Dependencies

### Music API

- Base URL: `https://musicapi.lxchen.cn`
- Referer 限制：需要在请求头中设置 `Referer: https://musicapi.lxchen.cn/`

### Important NPM Packages

- `zustand` - 状态管理
- `framer-motion` - 动画库
- `lucide-react` - 图标库
- `class-variance-authority` - 组件变体管理
- `tailwind-merge` + `clsx` - 类名合并工具
