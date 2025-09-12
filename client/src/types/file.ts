export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modifiedAt: string;
  path: string;
}