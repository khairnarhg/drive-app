'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { FolderPlus, X } from 'lucide-react';
import Button from '../common/Button';

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  loading: boolean;
}

const NewFolderModal = ({ isOpen, onClose, onCreate, loading }: NewFolderModalProps) => {
  const [folderName, setFolderName] = useState('Untitled Folder');

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm rounded-xl bg-white dark:bg-zinc-900 p-6 shadow-2xl border border-gray-200 dark:border-zinc-800 z-50 animate-dialog-in">
          <Dialog.Title className="text-lg font-bold text-center dark:text-white">New Folder</Dialog.Title>
          
          <div className="mt-6 space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                <FolderPlus className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <input
              autoFocus
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 focus:ring-2 focus:ring-mac-selection outline-none transition-all"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onCreate(folderName)}
            />
          </div>

          <div className="mt-8 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button className="flex-1" onClick={() => onCreate(folderName)} disabled={loading || !folderName.trim()}>
              {loading ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default NewFolderModal;