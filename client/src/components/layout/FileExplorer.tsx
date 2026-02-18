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
import { getTrashedFiles, moveFileToTrash, restoreFile, deleteFilePermanently } from '@/services/trashService';
import { downloadSingleFile } from '@/services/downloadSingleFile';
import { getStorageStats } from '@/services/getStorageStats';
import type { StorageStats } from '@/services/getStorageStats';
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
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Logic: Combine Folders and Files for the UI ---
  const allItems = currentFolder
    ? [...currentFolder.folders, ...currentFolder.files]
    : [];
  const pathLabel = pathStack.map((p) => p.name).join(' / ') || 'My Drive';
  const searchResults =
    searchQuery.trim() === ''
      ? allItems
      : allItems.filter((item) =>
          item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
        );
  const isSearchMode = searchQuery.trim().length > 0;

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

  const fetchStorageStats = useCallback(async () => {
    try {
      const stats = await getStorageStats(token);
      setStorageStats(stats);
    } catch {
      setStorageStats(null);
    }
  }, [token]);

  useEffect(() => {
    fetchStorageStats();
  }, [fetchStorageStats]);

  // --- Handlers ---
  const handleSelectFile = (file: FileItem) => {
    if (file.type === 'folder') return;
    setSelectedFile(prev =>
      prev?.type === file.type && prev?.id === file.id ? null : file
    );
  };

  const isItemSelected = (item: FileItem) =>
    selectedFile?.type === item.type && selectedFile?.id === item.id;



  const handleUploadComplete = () => {
    if (currentFolder) {
      fetchContents(currentFolder.id);
    }
    fetchStorageStats();
  };

useEffect(() => {
  // Only initialize the stack if it's empty
  if (currentFolder && pathStack.length === 0) {
    setPathStack([{ id: currentFolder.id, name: currentFolder.name }]);
  }
}, [currentFolder, pathStack.length]);

  const handleFolderDoubleClick = (item: FileItem) => {
    if (item.type !== 'folder') return;
    const folderId = Number(item.id);
    if (pathStack.some(p => p.id === folderId)) return;
    fetchContents(folderId);
    setPathStack(prev => [...prev, { id: folderId, name: item.name }]);
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
    fetchContents(currentFolder?.id || initialFolderId);
    fetchStorageStats();
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Failed to create folder');
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
    // Intentionally only depend on activeView and fetchTrash to avoid refetch loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, fetchTrash]);

  const handleRestore = async (fileId: string) => {
    try {
      await restoreFile(fileId, token);
      fetchTrash();
      fetchStorageStats();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to restore');
    }
  };

  const handleDeletePermanently = async (fileId: string) => {
    const isConfirmed = window.confirm('Delete permanently? This cannot be undone.');
    if (!isConfirmed) return;
    try {
      await deleteFilePermanently(fileId, token);
      fetchTrash();
      fetchStorageStats();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const handleMoveToTrash = async (file: FileItem) => {
    if (file.type === 'folder') {
      alert('Moving folders to trash is not supported yet.');
      return;
    }
    try {
      await moveFileToTrash(file.id, token);
      if (currentFolder) fetchContents(currentFolder.id);
      fetchStorageStats();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to move to trash');
    }
  };

  const handleDownload = async (file: FileItem) => {
    if (file.type === 'folder') {
      alert('Folder download is not supported.');
      return;
    }
    try {
      await downloadSingleFile(file.id, file.name, token);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Download failed');
    }
  };
  

  return (
  <div className="flex h-screen bg-white dark:bg-[#1e1e1e]">
    {/* Sidebar handles view switching between 'drive' and 'trash' */}
    <Sidebar activeView={activeView} onViewChange={setActiveView} storageStats={storageStats} />
    
    <div className="flex-1 flex flex-col pl-60">
      <Topbar
                userData={userData}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
      
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
                ) : (isSearchMode && searchResults.length === 0) ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                    <p className="text-lg font-medium text-center">No results for &quot;{searchQuery}&quot;</p>
                  </div>
                ) : (isSearchMode ? searchResults : allItems).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                    <p className="text-lg font-medium text-center">This folder is empty</p>
                    <p className="text-sm">Double click a folder to open or upload files.</p>
                  </div>
                ) : (
                  view === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                      {(isSearchMode ? searchResults : allItems).map((item) => (
                        <div key={`${item.type}-${item.id}`} onDoubleClick={() => handleFolderDoubleClick(item)}>
                          <ContextMenu
                              file={item}
                              onDelete={handleMoveToTrash}
                              onDownload={handleDownload}
                            >
                            <FileCard
                              file={item}
                              isSelected={isItemSelected(item)}
                              onSelect={() => handleSelectFile(item)}
                            />
                          </ContextMenu>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div className={`grid gap-4 px-4 py-2 text-xs font-medium text-gray-500 border-b dark:border-gray-700 ${isSearchMode ? 'grid-cols-[2fr_1fr_1fr_1.5fr_2fr]' : 'grid-cols-[3fr_1fr_1fr_2fr]'}`}>
                        <span>Name</span>
                        {isSearchMode && <span>Path</span>}
                        <span>Type</span>
                        <span>Last Modified</span>
                      </div>
                      {(isSearchMode ? searchResults : allItems).map((item) => (
                        <div key={`${item.type}-${item.id}`} onDoubleClick={() => handleFolderDoubleClick(item)}>
                          <ContextMenu
                              file={item}
                              onDelete={handleMoveToTrash}
                              onDownload={handleDownload}
                            >
                            <FileListItem
                              file={item}
                              isSelected={isItemSelected(item)}
                              onSelect={() => handleSelectFile(item)}
                              path={isSearchMode ? pathLabel : undefined}
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