'use client';

import { FileItem } from '@/types/file';
import { formatBytes } from '@/lib/utils';
import { RotateCcw, Trash2 } from 'lucide-react';
import ContextMenu from '../common/ContextMenu';

interface TrashViewProps {
  files: FileItem[];
  onRestore: (fileId: string) => void;
  onDeletePermanently: (fileId: string) => void;
}

const TrashView = ({ files, onRestore, onDeletePermanently }: TrashViewProps) => {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Trash2 className="w-16 h-16 mb-4" />
        <h2 className="text-xl font-semibold">Trash is empty</h2>
        <p>Items in trash will be deleted permanently after 30 days.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Trash</h2>
      <div className="space-y-1">
        {/* Table Header */}
        <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-2 text-xs font-medium text-gray-500 border-b dark:border-gray-700">
          <span>Name</span>
          <span>Size</span>
          <span>Type</span>
          <span>Date Trashed</span>
          <span></span>
        </div>
        {/* Table Body */}
        {files.map((file) => (
          <ContextMenu
            key={file.id}
            file={file}
            context="trash" // Provide context for specific menu items
            onRestore={onRestore}
            onDeletePermanently={onDeletePermanently}
          >
            <div className="grid grid-cols-[3fr_1fr_1fr_1fr_1fr] gap-4 px-4 py-2 items-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              <span>{file.name}</span>
              <span className="text-gray-500">{file.size ? formatBytes(file.size) : '--'}</span>
              <span className="text-gray-500">{file.type}</span>
              <span className="text-gray-500">{new Date(file.modifiedAt).toLocaleDateString()}</span>
              {/* <div className="text-right">
                <button
                  onClick={() => onRestore(file.id)}
                  className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Restore"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div> */}
            </div>
          </ContextMenu>
        ))}
      </div>
    </div>
  );
};

export default TrashView;