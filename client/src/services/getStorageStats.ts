export interface StorageStats {
  total: number;
  used: number;
  remaining: number;
}

// 2. Create the function to fetch the stats
export const getStorageStats = async (): Promise<StorageStats | null> => {
  try {
    // This path assumes you have a proxy/rewrite rule in next.config.js
    // that forwards /api/storage/* to your Flask server's /storage/*
    const response = await fetch('/api/storage/stats');

    if (!response.ok) {
      console.error("Failed to fetch storage stats:", response.statusText);
      return null;
    }

    const data: StorageStats = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getStorageStats:', error);
    return null; // Return null on network error to prevent crashes
  }
};