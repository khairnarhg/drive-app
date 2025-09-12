import { motion } from 'framer-motion';
import { X, Folder, FileText, Download, Share2, Trash2, Edit } from 'lucide-react';
import { FileItem } from '@/types/file';
import { formatBytes } from '@/lib/utils';
import { deleteSingleFile } from '@/services/deleteSingleFIle';
import { downloadSingleFile } from '@/services/downloadSingleFile';
import { useState } from 'react';

interface FilePreviewProps {
  file: FileItem;
  onClose: () => void;
  onDeleteComplete: () => void;
}

const FilePreview = ({ file, onClose, onDeleteComplete }: FilePreviewProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const handleDelete = async () => {
    // Add a confirmation dialog for a better user experience
    const isConfirmed = window.confirm(`Are you sure you want to delete "${file.name}"?`);
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await deleteSingleFile(file.id);
      alert(response.message); // Show success message
      onDeleteComplete(); // Notify the parent to refresh the file list
      onClose(); // Close the preview pane
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Delete error:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadSingleFile(file.id, file.name);
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
      className="w-80 border-l border-gray-200 dark:border-gray-700/60 bg-white dark:bg-[#2a2a2a] flex flex-col flex-shrink-0"
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

        <div className="text-center font-small truncate ">Download the file to view*</div>

        <div className="flex justify-center gap-2">
            <button 
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 flex-1 flex flex-col items-center text-xs rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mb-1"/>
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
            {/* <button className="p-2 flex-1 flex flex-col items-center text-xs rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"><Share2 className="w-4 h-4 mb-1"/>Share</button>
            <button className="p-2 flex-1 flex flex-col items-center text-xs rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"><Edit className="w-4 h-4 mb-1"/>Rename</button> */}
            <button onClick={handleDelete} className="p-2 flex-1 flex flex-col items-center text-xs rounded-lg text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/50 dark:hover:bg-red-900"><Trash2 className="w-4 h-4 mb-1"/>Delete</button>
        </div>

        <div>
            <h4 className="font-semibold mb-2">Properties</h4>
            <div className="text-sm space-y-2">
                <div className="flex justify-between"><span>Type:</span> <span className="text-gray-500 dark:text-gray-400">{file.type}</span></div>
                {file.size && <div className="flex justify-between"><span>Size:</span> <span className="text-gray-500 dark:text-gray-400">{formatBytes(file.size)}</span></div>}
                <div className="flex justify-between"><span>Modified:</span> <span className="text-gray-500 dark:text-gray-400">{new Date(file.modifiedAt).toLocaleString()}</span></div>
            </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default FilePreview;