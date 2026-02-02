export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder'; // We'll synthesize this on the frontend
  size?: number;
  mime_type?: string;
  created_at: string;
}

export interface FolderContents {
  id: number;
  name: string;
  folders: FileItem[];
  files: FileItem[];
}