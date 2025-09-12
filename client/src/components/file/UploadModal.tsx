'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import * as Dialog from '@radix-ui/react-dialog';
import { UploadCloud, X, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadFiles } from '../../services/uploadService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: (message: string) => void;
}

const UploadModal = ({ isOpen, onClose, onUploadComplete }: UploadModalProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatus('idle');
    
    try {
      // Convert File[] to FileList-like object
      const fileList = {
        ...acceptedFiles,
        length: acceptedFiles.length,
        item: (index: number) => acceptedFiles[index] || null,
        [Symbol.iterator]: function* () {
          for (let i = 0; i < acceptedFiles.length; i++) {
            yield acceptedFiles[i];
          }
        }
      } as FileList;

      // Call upload service
      const response = await uploadFiles(fileList);
      
      setUploadStatus('success');
      setStatusMessage(response.message);
      
      // Notify parent component
      onUploadComplete?.(response.message);
      
      // Auto-close modal after 2 seconds on success
      setTimeout(() => {
        onClose();
        setUploadStatus('idle');
        setStatusMessage('');
      }, 2000);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadStatus('error');
      setStatusMessage(errorMessage);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  }, [onClose, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    disabled: isUploading 
  });

  const handleClose = () => {
    if (!isUploading) {
      onClose();
      setUploadStatus('idle');
      setStatusMessage('');
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white dark:bg-zinc-800 p-6 shadow-lg animate-dialog-in">
          <Dialog.Title className="text-lg font-semibold">Upload Files</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Drag and drop files here, or click to select files.
          </Dialog.Description>

          <div
            {...getRootProps()}
            className={`mt-4 p-12 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/50' : 
              isUploading ? 'border-gray-200 bg-gray-50 dark:bg-gray-700 cursor-not-allowed' :
              'border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}
          >
            <input {...getInputProps()} disabled={isUploading} />
            
            {isUploading ? (
              <>
                <div className="w-12 h-12 mx-auto border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="mt-2 text-sm text-gray-500">Uploading...</p>
              </>
            ) : uploadStatus === 'success' ? (
              <>
                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                <p className="mt-2 text-sm text-green-600">{statusMessage}</p>
              </>
            ) : uploadStatus === 'error' ? (
              <>
                <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
                <p className="mt-2 text-sm text-red-600">{statusMessage}</p>
              </>
            ) : (
              <>
                <UploadCloud className="w-12 h-12 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  {isDragActive ? 'Drop the files here...' : 'Drag files here or click to upload'}
                </p>
              </>
            )}
          </div>
          
          {!isUploading && (
            <Dialog.Close asChild>
              <button className="absolute top-4 right-4 p-1 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">
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