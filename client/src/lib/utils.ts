import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/** Human-readable file type from mime_type or filename (e.g. "PDF", "Image", "Document"). */
export function getDisplayFileType(mimeType?: string | null, fileName?: string): string {
  if (mimeType) {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType.startsWith('image/')) return 'Image';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Audio';
    if (mimeType.includes('word') || mimeType === 'application/msword') return 'Word';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Spreadsheet';
    if (mimeType.includes('text') || mimeType === 'application/json') return 'Text';
  }
  if (fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'PDF';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext ?? '')) return 'Image';
  }
  return 'File';
}