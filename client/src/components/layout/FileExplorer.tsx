'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { FileItem, FolderContents } from '@/types/file';
import { getFolderContents } from '@/services/filesFetchService';
import Toolbar from './Toolbar';
import FileCard from '../file/FileCard';
import FileListItem from '../file/FileListItem';
import FilePreview from '../file/FilePreview';
import Sidebar, { ActiveView } from './Sidebar';
import Topbar from './Topbar';
import ContextMenu from '../common/ContextMenu';
import UploadModal from '../file/UploadModal';
import { createFolder } from '@/services/filesFetchService';
import NewFolderModal from '../file/NewFolderModel';
import { getTrashedFiles } from '@/services/trashService';
import TrashView from './TrashView';


interface FileExplorerProps {
  userData?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  initialFolderId: number; // The "My Drive" root folder ID
  token: string;
}

const FileExplorer = ({ userData, initialFolderId, token }: FileExplorerProps) => {
  // --- State ---
  const [currentFolder, setCurrentFolder] = useState<FolderContents | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('drive');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [pathStack, setPathStack] = useState<{id: number, name: string}[]>([]);
  const [isNewFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [trashedFiles, setTrashedFiles] = useState<FileItem[]>([]);

  // --- Logic: Combine Folders and Files for the UI ---
  const allItems = currentFolder 
    ? [...currentFolder.folders, ...currentFolder.files] 
    : [];

  // --- API Call: Fetch Folder Contents ---
  const fetchContents = useCallback(async (folderId: number) => {
    setLoading(true);
    try {
      const data = await getFolderContents(folderId, token);
      setCurrentFolder(data);
    } catch (err) {
      console.error("Failed to fetch folder contents:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial Load: Fetch "My Drive"
  useEffect(() => {
    if (initialFolderId) {
      fetchContents(initialFolderId);
    }
  }, [initialFolderId, fetchContents]);

  // --- Handlers ---
  const handleSelectFile = (file: FileItem) => {
    setSelectedFile(prev => (prev?.id === file.id ? null : file));
  };



  const handleUploadComplete = () => {
    if (currentFolder) {
      fetchContents(currentFolder.id);
    }
  };

useEffect(() => {
  // Only initialize the stack if it's empty
  if (currentFolder && pathStack.length === 0) {
    setPathStack([{ id: currentFolder.id, name: currentFolder.name }]);
  }
}, [currentFolder, pathStack.length]);

const handleFolderDoubleClick = (folder: FileItem) => {
  const folderId = Number(folder.id);
  
  // PREVENT BUG: Don't add to stack if we are already in this folder
  if (pathStack.some(item => item.id === folderId)) return;

  fetchContents(folderId);
  setPathStack(prev => [...prev, { id: folderId, name: folder.name }]);
};

const navigateToPath = (index: number) => {
  const target = pathStack[index];
  fetchContents(target.id);
  // Cut the stack to that point
  setPathStack(prev => prev.slice(0, index + 1));
};

const handleCreateFolder = async (name: string) => {
  setLoading(true);
  try {
    await createFolder(name, currentFolder?.id || initialFolderId, token);
    setNewFolderModalOpen(false);
    fetchContents(currentFolder?.id || initialFolderId); // Refresh
  } catch (err: any) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};


const fetchTrash = useCallback(async () => {
    setLoading(true);
    try {
      const files = await getTrashedFiles(token);
      setTrashedFiles(files);
    } catch (err) {
      console.error("Failed to fetch trash:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);


  useEffect(() => {
    if (activeView === 'trash') {
      fetchTrash();
    } else {
      // Re-fetch current folder contents when returning to drive
      if (currentFolder) fetchContents(currentFolder.id);
      else fetchContents(initialFolderId);
    }
  }, [activeView, fetchTrash]);

  // Handle Restore and Permanent Delete (Placeholder handlers)
  const handleRestore = async (fileId: string) => {
    // Implement restore logic similar to trash logic but with status='ACTIVE'
    console.log("Restoring:", fileId);
    fetchTrash(); // Refresh after action
  };

  const handleDeletePermanently = async (fileId: string) => {
    const isConfirmed = window.confirm("Delete permanently? This cannot be undone.");
    if (isConfirmed) {
      console.log("Deleting permanently:", fileId);
      // Call permanent delete API
      fetchTrash();
    }
  };
  

  return (
  <div className="flex h-screen bg-white dark:bg-[#1e1e1e]">
    {/* Sidebar handles view switching between 'drive' and 'trash' */}
    <Sidebar activeView={activeView} onViewChange={setActiveView} />
    
    <div className="flex-1 flex flex-col pl-60">
      <Topbar userData={userData} />
      
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 flex flex-col p-4 overflow-y-auto">
          {/* --- VIEW CONDITION: DRIVE --- */}
          {activeView === 'drive' ? (
            <>
              <Toolbar
                pathStack={pathStack}
                onNavigate={navigateToPath}
                view={view}
                onViewChange={setView}
                onUpload={() => setUploadModalOpen(true)}
                onNewFolder={() => setNewFolderModalOpen(true)}
              />

              <div className="flex-1 mt-4">
                {loading ? (
                  <div className="flex items-center justify-center h-64 text-gray-400">
                    <span className="animate-pulse">Loading contents...</span>
                  </div>
                ) : allItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                    <p className="text-lg font-medium text-center">This folder is empty</p>
                    <p className="text-sm">Double click a folder to open or upload files.</p>
                  </div>
                ) : (
                  view === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                      {allItems.map((item) => (
                        <div key={`${item.type}-${item.id}`} onDoubleClick={() => handleFolderDoubleClick(item)}>
                          <ContextMenu file={item}>
                            <FileCard
                              file={item}
                              isSelected={selectedFile?.id === item.id}
                              onSelect={() => handleSelectFile(item)}
                            />
                          </ContextMenu>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className="grid grid-cols-[3fr_1fr_1fr_2fr] gap-4 px-4 py-2 text-xs font-medium text-gray-500 border-b dark:border-gray-700">
                        <span>Name</span>
                        <span>Type</span>
                        <span>Last Modified</span>
                      </div>
                      {allItems.map((item) => (
                        <div key={`${item.type}-${item.id}`} onDoubleClick={() => handleFolderDoubleClick(item)}>
                          <ContextMenu file={item}>
                            <FileListItem
                              file={item}
                              isSelected={selectedFile?.id === item.id}
                              onSelect={() => handleSelectFile(item)}
                            />
                          </ContextMenu>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            /* --- VIEW CONDITION: TRASH --- */
            <TrashView 
              files={trashedFiles} 
              onRestore={handleRestore} 
              onDeletePermanently={handleDeletePermanently} 
            />
          )}
        </main>
        
        {/* Preview Pane stays global or you can hide it for Trash if preferred */}
        <AnimatePresence>
          {selectedFile && activeView === 'drive' && (
            <FilePreview 
              file={selectedFile} 
              onClose={() => setSelectedFile(null)} 
              onDeleteComplete={handleUploadComplete} 
              token={token}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
    
    {/* Global Modals */}
    <UploadModal 
      isOpen={isUploadModalOpen} 
      onClose={() => setUploadModalOpen(false)}
      onUploadComplete={handleUploadComplete}
      currentFolderId={currentFolder?.id}
      token={token}
    />

    <NewFolderModal
      isOpen={isNewFolderModalOpen}
      onClose={() => setNewFolderModalOpen(false)}
      onCreate={handleCreateFolder}
      loading={loading}
    />
  </div>
);
};

export default FileExplorer;