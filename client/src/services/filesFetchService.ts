import { FolderContents } from '../types/file';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getFolderContents = async (folderId: number | string, token: string): Promise<FolderContents> => {
  const response = await fetch(`${API_BASE_URL}/folders/${folderId}/contents`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch folder contents');
  }

  const data = await response.json();
  
  // We add the 'type' property manually so our UI components know how to render icons
  data.folders = data.folders.map((f: { id: number; name: string; created_at?: string }) => ({
    ...f,
    id: String(f.id),
    type: 'folder' as const,
    created_at: f.created_at ?? '',
  }));
  data.files = data.files.map((f: { id: number; name: string; size?: number; mime_type?: string; created_at?: string }) => ({
    ...f,
    id: String(f.id),
    type: 'file' as const,
    created_at: f.created_at ?? '',
  }));
  
  return data;
};

export const createFolder = async (name: string, parentId: number | null, token: string) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/folders/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, parent_id: parentId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create folder');
  }

  return response.json();
};