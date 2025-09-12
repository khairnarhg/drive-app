'use client';

import { cn } from '@/lib/utils';
import { HardDrive, Users, Clock, Trash2, Star, Tag } from 'lucide-react';
import React from 'react';
import StorageMeter from './StorageMeter';

export type ActiveView = 'drive' | 'trash';

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
   const mainLinks = [
    { name: 'My Drive', icon: HardDrive, view: 'drive' as ActiveView },
    { name: 'Trash', icon: Trash2, view: 'trash' as ActiveView },
  ];

  // const tags = [
  //   { name: 'Work', color: 'bg-blue-500' },
  //   { name: 'Personal', color: 'bg-green-500' },
  //   { name: 'Travel', color: 'bg-yellow-500' },
  // ];

  return (
    <aside className="w-60 h-screen fixed top-0 left-0 bg-mac-sidebar dark:bg-mac-sidebar-dark text-sm text-gray-700 dark:text-gray-300 p-2 border-r border-gray-200 dark:border-gray-700/60">
      {/* macOS-style window controls */}
      {/* <div className="flex items-center space-x-2 p-2 mb-4">
        <div className="w-3 h-3 rounded-full bg-red-500"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
        <div className="w-3 h-3 rounded-full bg-green-500"></div>
      </div> */}
      
      <div className="space-y-4">
        {/* Main Links */}
        <div className="space-y-1">
          {mainLinks.map((link, index) => (
            <button
              key={link.name}
              onClick={() => onViewChange(link.view)}
              className={cn(
                'flex items-center gap-2.5 px-3 py-1.5 rounded-md transition-colors w-full text-left',
                // FIX: Logic to highlight the currently active view
                activeView === link.view
                  ? 'bg-mac-selection/20 text-mac-selection dark:text-white'
                  : 'hover:bg-gray-200/70 dark:hover:bg-gray-700/50'
              )}
            >
              <link.icon className="w-4 h-4" />
              <span>{link.name}</span>
            </button>
          ))}
        </div>

        {/* Tags */}
        {/* <div className="space-y-1 pt-4">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400">Tags</h3>
          {tags.map((tag) => (
            <a
              key={tag.name}
              href="#"
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-md hover:bg-gray-200/70 dark:hover:bg-gray-700/50"
            >
              <Tag className={`w-4 h-4 ${tag.color.replace('bg-', 'text-')}`} />
              <span>{tag.name}</span>
            </a>
          ))}
        </div> */}
      </div>
    </aside>
  );
};

export default Sidebar;