'use client';

import { useState, useCallback, useEffect  } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FileItem } from '@/types/file';
import {getFiles, getTrashedFiles, deletePermanently, restoreFile} from '@/services/filesFetchService';
import { deleteSingleFile } from '@/services/deleteSingleFIle';
import Toolbar from './Toolbar';
import FileCard from '../file/FileCard';
import FileListItem from '../file/FileListItem';
import FilePreview from '../file/FilePreview';
import Sidebar, { ActiveView } from './Sidebar';
import Topbar from './Topbar';
import ContextMenu from '../common/ContextMenu';
import UploadModal from '../file/UploadModal';
import TrashView from './TrashView';

interface FileExplorerProps {
  initialFiles: FileItem[];
}

const FileExplorer = ({ initialFiles }: FileExplorerProps) => {
  const [driveFiles, setDriveFiles] = useState<FileItem[]>(initialFiles);
  const [trashedFiles, setTrashedFiles] = useState<FileItem[]>([]);
  const [activeView, setActiveView] = useState<ActiveView>('drive');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);

  const fetchDriveFiles = useCallback(async () => {
    const files = await getFiles();
    setDriveFiles(files);
  }, []);

  const fetchTrashedFiles = useCallback(async () => {
    const files = await getTrashedFiles();
    setTrashedFiles(files);
  }, []);

  

   useEffect(() => {
    if (activeView === 'trash') {
      fetchTrashedFiles();
    } else {
      fetchDriveFiles();
    }
  }, [activeView, fetchDriveFiles, fetchTrashedFiles]); // Remove driveFiles and initialFiles

  // const refetchFiles = useCallback(async () => {
  //   console.log('Refreshing file list...');
  //   const updatedFiles = await getFiles();
  //   setFiles(updatedFiles);
  // }, []);

  const handleSelectFile = (file: FileItem) => {
    // This function handles both selecting a file and deselecting it if clicked again.
    setSelectedFile(prev => (prev?.id === file.id ? null : file));
  };
  
  const handleUploadComplete = () => {
    fetchDriveFiles();
  };

  const handleDeleteComplete = () => {
    fetchDriveFiles();
  };

  const handleRestoreFile = async (fileId: string) => {
    try {
      await restoreFile(fileId);
      fetchTrashedFiles(); // Refresh trash list
    } catch (error) {
      alert('Failed to restore file.');
    }
  };

  const handleDeletePermanently = async (fileId: string) => {
    if (window.confirm('This file will be deleted permanently. Are you sure?')) {
      try {
        await deletePermanently(fileId);
        fetchTrashedFiles(); // Refresh trash list
      } catch (error) {
        alert('Failed to permanently delete file.');
      }
    }
  };



  

  // const handleUploadComplete = (message: string) => {
  //   console.log('Upload completed:', message);
  //   // Here you can:
  //   // 1. Refresh the file list
  //   // 2. Show a success notification
  //   // 3. Update the UI state
    
  //   // For now, just log the message
  //   // You might want to refetch files or add them to the current list
  //   // setFiles(prevFiles => [...prevFiles, ...newFiles]);
  // };
  
  // const handleUploadComplete = (message: string) => {
  //   console.log('Upload completed:', message);
  //   alert(message); // Or use a more elegant toast notification
  //   refetchFiles(); // Refresh the file list
  // };

  return (
    <div className="flex h-screen bg-white dark:bg-[#1e1e1e]">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <div className="flex-1 flex flex-col pl-60">
        <Topbar />
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 flex flex-col p-4 overflow-y-auto">
            {activeView === 'drive' && (
              <Toolbar
                currentPath="My Drive"
                view={view}
                onViewChange={setView}
                onUpload={() => setUploadModalOpen(true)}
                onUploadComplete={handleUploadComplete}
              />
            )}
            {/* File Display Area */}
            <div className="flex-1 mt-4">
               {activeView === 'drive' ? (
                // --- DRIVE VIEW ---
                view === 'grid' ? (
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {driveFiles.map((file) => ( 
                       <ContextMenu key={file.id} file={file} 
                       onDelete={async (fileId) => {
                          try {
                            await deleteSingleFile(fileId); // Import deleteSingleFile from your api lib
                            handleDeleteComplete();
                          } catch (error) {
                            alert('Failed to move file to trash.');
                          }
                        }}>
                      <FileCard
                        file={file}
                        isSelected={selectedFile?.id === file.id}
                        onSelect={() => handleSelectFile(file)}
                      />
                    </ContextMenu>
                     ))}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="grid grid-cols-[3fr_1fr_1fr_2fr] gap-4 px-4 py-2 text-xs font-medium text-gray-500 border-b dark:border-gray-700">
                      <span>Name</span>
                      <span>Size</span>
                      <span>Type</span>
                      <span>Last Modified</span>
                    </div>
                    {/* ... FileListItem header and mapping ... */}
                    {driveFiles.map(file => (
                     <ContextMenu key={file.id} file={file}>
                      <FileListItem
                        file={file}
                        isSelected={selectedFile?.id === file.id}
                        onSelect={() => handleSelectFile(file)}
                      />
                    </ContextMenu>
                  ))}
                  </div>
                )
              ) : (
                // --- TRASH VIEW ---
                <TrashView
                  files={trashedFiles}
                  onRestore={handleRestoreFile}
                  onDeletePermanently={handleDeletePermanently}
                />
              )}
              {/* {view === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {files.map(file => (
                    <ContextMenu key={file.id} file={file}>
                      <FileCard
                        file={file}
                        isSelected={selectedFile?.id === file.id}
                        onSelect={() => handleSelectFile(file)}
                      />
                    </ContextMenu>
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                   <div className="grid grid-cols-[3fr_1fr_1fr_2fr] gap-4 px-4 py-2 text-xs font-medium text-gray-500 border-b dark:border-gray-700">
                      <span>Name</span>
                      <span>Size</span>
                      <span>Type</span>
                      <span>Last Modified</span>
                   </div>
                  {files.map(file => (
                     <ContextMenu key={file.id} file={file}>
                      <FileListItem
                        file={file}
                        isSelected={selectedFile?.id === file.id}
                        onSelect={() => handleSelectFile(file)}
                      />
                    </ContextMenu>
                  ))}
                </div>
              )} */}
            </div>
          </main>
          
          {/* Preview Pane */}
          <AnimatePresence>
            {selectedFile && <FilePreview file={selectedFile} onClose={() => setSelectedFile(null)} onDeleteComplete={handleDeleteComplete}/>}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Upload Modal with upload complete handler */}
      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setUploadModalOpen(false)}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
};

export default FileExplorer;