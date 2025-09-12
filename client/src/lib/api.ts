import { FileItem } from '../types/file';

const mockFiles: FileItem[] = [
  { id: '1', name: 'Projects', type: 'folder', modifiedAt: '2025-08-18T10:00:00Z', path: '/My Drive' },
  { id: '2', name: 'Photos', type: 'folder', modifiedAt: '2025-08-17T14:30:00Z', path: '/My Drive' },
  { id: '3', name: 'resume_final_v2.pdf', type: 'file', size: 1024 * 256, modifiedAt: '2025-08-19T09:15:00Z', path: '/My Drive' },
  { id: '4', name: 'app-screenshot.png', type: 'file', size: 1024 * 800, modifiedAt: '2025-08-18T18:45:00Z', path: '/My Drive' },
  { id: '5', name: 'vacation-video.mp4', type: 'file', size: 1024 * 1024 * 50, modifiedAt: '2025-08-15T11:00:00Z', path: '/My Drive' },
  { id: '6', name: 'project-alpha', type: 'folder', modifiedAt: '2025-08-18T10:05:00Z', path: '/My Drive/Projects' },
  { id: '7', name: 'brand-assets', type: 'folder', modifiedAt: '2025-08-18T10:10:00Z', path: '/My Drive/Projects' },
  { id: '8', name: 'logo.svg', type: 'file', size: 1024 * 50, modifiedAt: '2025-08-18T10:12:00Z', path: '/My Drive/Projects/brand-assets' },
];

export const getFiles = async (path: string = '/My Drive'): Promise<FileItem[]> => {
  console.log(`Fetching files for path: ${path}`);
  // Simulate network delay
  await new Promise(res => setTimeout(res, 300));
  return mockFiles.filter(file => file.path === path);
};