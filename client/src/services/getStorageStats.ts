const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface StorageStats {
  total: number;
  used: number;
  remaining: number;
  percentage_used?: number;
}

export const getStorageStats = async (token: string): Promise<StorageStats | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/storage`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch storage stats:', response.statusText);
      return null;
    }

    const data: StorageStats = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getStorageStats:', error);
    return null;
  }
};
