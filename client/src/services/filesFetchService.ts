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
  data.folders = data.folders.map((f: any) => ({ ...f, type: 'folder' }));
  data.files = data.files.map((f: any) => ({ ...f, type: 'file' }));
  
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