'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as Dialog from '@radix-ui/react-dialog';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { uploadFiles } from '@/services/uploadService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
  currentFolderId?: number;
  token: string;
}

const UploadModal = ({ isOpen, onClose, onUploadComplete, currentFolderId, token }: UploadModalProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    try {
      await uploadFiles(acceptedFiles, currentFolderId, token);
      onUploadComplete?.(); // Refresh FileExplorer list
      onClose(); // Close modal
    } catch (error) {
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  }, [currentFolderId, onClose, onUploadComplete, token]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    disabled: isUploading 
  });

  return (
    <Dialog.Root open={isOpen} onOpenChange={isUploading ? undefined : onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white dark:bg-zinc-900 p-8 shadow-2xl z-50 animate-dialog-in border border-gray-200 dark:border-zinc-800">
          
          <div className="text-center mb-6">
            <Dialog.Title className="text-xl font-bold dark:text-white text-center mb-1">
              Upload Files
            </Dialog.Title>
            <p className="text-sm text-gray-500 mt-1">Select files to add to your drive</p>
          </div>

          <div
            {...getRootProps()}
            className={`relative p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all
            ${isDragActive ? 'border-mac-selection bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-zinc-700 hover:border-gray-300 dark:hover:border-zinc-600'}
            ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input {...getInputProps()} />
            
            {isUploading ? (
              <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-mac-selection animate-spin" />
                <p className="mt-4 text-sm font-medium text-mac-selection">Processing files...</p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UploadCloud className={`w-8 h-8 ${isDragActive ? 'text-mac-selection' : 'text-gray-400'}`} />
                </div>
                <p className="text-sm font-medium dark:text-white">
                  {isDragActive ? 'Drop them now!' : 'Drag &amp; drop files here'}
                </p>
                <p className="text-xs text-gray-500 mt-2">or click to browse from computer</p>
              </>
            )}
          </div>
          
          {!isUploading && (
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UploadModal;