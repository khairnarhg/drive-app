'use client';

import { motion } from 'framer-motion';
import { X, Folder, FileText, Download, Trash2 } from 'lucide-react';
import { FileItem } from '@/types/file';
import { formatBytes } from '@/lib/utils';
import { downloadSingleFile } from '@/services/downloadSingleFile';
import { getTrashedFiles } from '@/services/trashService'; // Import the new service
import { useState } from 'react';

interface FilePreviewProps {
  file: FileItem;
  onClose: () => void;
  onDeleteComplete: () => void;
  token?: string;
}

const FilePreview = ({ file, onClose, onDeleteComplete, token }: FilePreviewProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTrashing, setIsTrashing] = useState(false);

  // Updated Handle Trash Logic
  const handleTrash = async () => {
    if (!token) {
      alert("Authentication error: Token missing.");
      return;
    }

    const isConfirmed = window.confirm(`Move "${file.name}" to trash?`);
    if (!isConfirmed) return;

    setIsTrashing(true);
    try {
      const response = await getTrashedFiles(token);
      console.log('Trash success:', response.message);
      
      onDeleteComplete(); // Refresh the file list in FileExplorer
      onClose(); // Close the sidebar
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsTrashing(false);
    }
  };

  const handleDownload = async () => {
    if (file.type === 'folder') {
      alert("Folder download is not supported yet.");
      return;
    }

    setIsDownloading(true);
    try {
      if (!token) {
        alert("Authentication error: Token missing.");
        return;
      }
      await downloadSingleFile(file.id, file.name, token);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      alert(`Download failed: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.aside
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="w-80 border-l border-gray-200 dark:border-gray-700/60 bg-white dark:bg-[#2a2a2a] flex flex-col flex-shrink-0 z-40"
    >
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700/60">
        <h3 className="font-semibold">Details</h3>
        <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        <div className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-lg">
          {file.type === 'folder' ? (
            <Folder className="w-24 h-24 text-blue-500" />
          ) : (
            <FileText className="w-24 h-24 text-gray-500" />
          )}
          <p className="mt-4 text-center font-medium truncate w-full">{file.name}</p>
        </div>

        <div className="text-center text-xs text-gray-500 italic">
          Download the file to view content*
        </div>

        <div className="flex justify-center gap-2">
          <button 
            onClick={handleDownload}
            disabled={isDownloading || isTrashing}
            className="p-2 flex-1 flex flex-col items-center text-xs rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4 mb-1"/>
            {isDownloading ? 'Downloading...' : 'Download'}
          </button>

          <button 
            onClick={handleTrash} 
            disabled={isTrashing || isDownloading}
            className="p-2 flex-1 flex flex-col items-center text-xs rounded-lg text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 mb-1"/>
            {isTrashing ? 'Trashing...' : 'Trash'}
          </button>
        </div>

        <div>
            <h4 className="font-semibold mb-2 text-sm text-gray-400 uppercase tracking-wider">Properties</h4>
            <div className="text-sm space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Type</span> 
                  <span className="font-medium">{file.type === 'folder' ? 'Folder' : 'File'}</span>
                </div>
                {file.size && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Size</span> 
                    <span className="font-medium">{formatBytes(file.size)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Modified</span> 
                  <span className="font-medium text-right">
                    {/* Check if modifiedAt exists, fallback to created_at if needed */}
                    {new Date(file.created_at).toLocaleDateString()}
                  </span>
                </div>
            </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default FilePreview;