import {FileItem} from '../types/file';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getFiles = async (): Promise<FileItem[]> =>{
    try{
        const response = await fetch(`${API_BASE_URL}/getFiles`, {cache: 'no-store'});
        if(!response.ok){
            throw new Error(`Failed to fetch files: ${response.statusText}`);
        }

        const files: FileItem[]= await response.json();
        return files;
    }catch(error){
        console.log('Error in getFiles:', error);
        return [];
    }
}

export const getTrashedFiles = async (): Promise<FileItem[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/trash`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch trashed files');
    return response.json();
  } catch (error) {
    console.error('getTrashedFiles error:', error);
    return [];
  }
};

export const restoreFile = async (fileId: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/restore/${fileId}`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to restore file');
  return response.json();
};

export const deletePermanently = async (fileId: string): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/permanentlyDelete/${fileId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to permanently delete file');
  return response.json();
};