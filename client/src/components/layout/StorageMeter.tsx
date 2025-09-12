'use client';

import { HardDrive } from 'lucide-react';

// Helper function to format bytes into a human-readable string
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

interface StorageStats {
  total: number;
  used: number;
  remaining: number;
}

interface StorageMeterProps {
  stats: StorageStats | null;
}

const StorageMeter = ({ stats }: StorageMeterProps) => {
  if (!stats || stats.total === 0) {
    return (
      <div className="p-2 text-center text-xs text-gray-500">
        Loading storage info...
      </div>
    );
  }

  const usedPercentage = (stats.used / stats.total) * 100;

  return (
    <div className="px-3 pt-4 mt-auto border-t border-gray-200 dark:border-gray-700/60">
      <div className="flex items-center gap-2 mb-2">
        <HardDrive className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        <span className="font-semibold text-sm">Storage</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
          style={{ width: `${usedPercentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{formatBytes(stats.used)} used</span>
        <span>{formatBytes(stats.remaining)} free</span>
      </div>
    </div>
  );
};

export default StorageMeter;
