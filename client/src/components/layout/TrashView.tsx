'use client';

import { FileItem } from '@/types/file';
import { formatBytes } from '@/lib/utils';
import { RotateCcw, Trash2 } from 'lucide-react';

interface TrashViewProps {
  files: FileItem[];
  onRestore: (fileId: string) => void;
  onDeletePermanently: (fileId: string) => void;
}

const TrashView = ({ files, onRestore, onDeletePermanently }: TrashViewProps) => {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-gray-400">
        <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-semibold dark:text-white">Trash is empty</h2>
        <p className="text-sm">Items moved to trash will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold dark:text-white px-4">Trash</h2>
      </div>

      <div className="space-y-1">
        <div className="grid grid-cols-[3fr_1fr_1fr_1.5fr_0.5fr] gap-4 px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b dark:border-gray-700">
          <span>Name</span>
          <span>Size</span>
          <span>Type</span>
          <span>Date Trashed</span>
          <span className="text-right">Actions</span>
        </div>

        {files.map((file) => (
          <div key={file.id} className="grid grid-cols-[3fr_1fr_1fr_1.5fr_0.5fr] gap-4 px-4 py-3 items-center rounded-lg hover:bg-gray-100/80 dark:hover:bg-zinc-800/50 transition-colors group">
            <span className="font-medium truncate">{file.name}</span>
            <span className="text-gray-500 text-sm">{file.size ? formatBytes(file.size) : '--'}</span>
            <span className="text-gray-500 text-sm">File</span>
            <span className="text-gray-500 text-sm">
              {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'N/A'}
            </span>
            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onRestore(file.id)}
                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500 rounded-md"
                title="Restore"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onDeletePermanently(file.id)}
                className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 rounded-md"
                title="Delete Permanently"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrashView;