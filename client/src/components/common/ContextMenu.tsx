'use client';

import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
import { ReactNode, FC } from 'react';
import { Share2, Download, Edit, Trash2, Info, RotateCcw, LucideProps  } from 'lucide-react';
import { FileItem } from '@/types/file';
import React from 'react';

// Define a type for the menu item objects
type MenuItem = {
  label: string;
  icon: FC<LucideProps>;
  action: () => void;
  separator?: boolean; // Mark separator as optional
  color?: string;      // Mark color as optional
};

// Define the component's props
interface ContextMenuProps {
  children: ReactNode;
  file: FileItem;
  context?: 'drive' | 'trash';
  onDelete?: (fileId: string) => void;
  onRestore?: (fileId: string) => void;
  onDeletePermanently?: (fileId: string) => void;
}

const ContextMenu = ({
  children,
  file,
  context = 'drive',
  onDelete,
  onRestore,
  onDeletePermanently
}: ContextMenuProps) => {

  // --- FIX: Explicitly apply the MenuItem[] type to the arrays ---
  const driveMenuItems: MenuItem[] = [
    { label: 'Get Info', icon: Info, action: () => alert('Get Info clicked') },
    { label: 'Rename', icon: Edit, action: () => alert('Rename clicked') },
    { label: 'Share', icon: Share2, separator: true, action: () => alert('Share clicked') },
    { label: 'Download', icon: Download, action: () => alert('Download clicked') },
    { label: 'Delete', icon: Trash2, color: 'text-red-500', action: () => onDelete?.(file.id) },
  ];

  const trashMenuItems: MenuItem[] = [
    { label: 'Restore', icon: RotateCcw, action: () => onRestore?.(file.id) },
    { label: 'Delete Permanently', icon: Trash2, color: 'text-red-500', action: () => onDeletePermanently?.(file.id) },
  ];

  // Choose the correct menu items based on the context
  const menuItems = context === 'trash' ? trashMenuItems : driveMenuItems;

  return (
    <ContextMenuPrimitive.Root>
      <ContextMenuPrimitive.Trigger asChild>{children}</ContextMenuPrimitive.Trigger>
      <ContextMenuPrimitive.Portal>
        <ContextMenuPrimitive.Content
          className="w-56 bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md shadow-lg rounded-lg p-2 border border-gray-200 dark:border-zinc-700 animate-context-menu-in"
        >
          {menuItems.map((item) => (
            <React.Fragment key={item.label}>
              <ContextMenuPrimitive.Item
                onSelect={item.action}
                className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none ${item.color || 'hover:bg-blue-500 hover:text-white'}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </ContextMenuPrimitive.Item>
              {item.separator && <ContextMenuPrimitive.Separator className="h-[1px] bg-gray-200 dark:bg-zinc-700 my-1" />}
            </React.Fragment>
          ))}
        </ContextMenuPrimitive.Content>
      </ContextMenuPrimitive.Portal>
    </ContextMenuPrimitive.Root>
  );
};

export default ContextMenu;
