import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 从输入字符串中提取 ID
 * 支持直接输入 ID 或包含 ID 的 URL
 * 例如:
 * - 1320336229
 * - https://music.163.com/#/song?id=1320336229
 * - https://music.163.com/song?id=1320336229
 */
export function extractId(input: string): string | null {
  if (!input) return null;
  
  // 如果纯数字，直接返回
  if (/^\d+$/.test(input.trim())) {
    return input.trim();
  }

  try {
    // 尝试解析 URL
    const url = new URL(input);
    const id = url.searchParams.get('id');
    if (id && /^\d+$/.test(id)) {
      return id;
    }
    
    // 处理带 hash 的 URL (如 /#/song?id=...)
    if (url.hash.includes('?')) {
      const searchParams = new URLSearchParams(url.hash.split('?')[1]);
      const hashId = searchParams.get('id');
      if (hashId && /^\d+$/.test(hashId)) {
        return hashId;
      }
    }
  } catch (e) {
    // 不是有效 URL，尝试正则匹配
    const match = input.match(/[?&]id=(\d+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
