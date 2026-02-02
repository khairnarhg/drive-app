'use client';

import { Search, Bell, Settings, LogOut, Moon, Sun } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTheme } from 'next-themes';
import { logoutAction } from '@/lib/actions/auth'; // Import logout
import { useState, useCallback, useEffect  } from 'react';

interface TopbarProps {
    userData?: {
        first_name: string;
        last_name: string;
        email: string;
    } | null;
}

const Topbar = ({ userData }: TopbarProps) => {
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        console.log("User Data in Topbar:", userData);
    }, []);

    return (
        <header className="flex items-center justify-between p-2 h-14 bg-mac-header dark:bg-mac-header-dark backdrop-blur-md border-b border-gray-200 dark:border-gray-700/60 shadow-header dark:shadow-header-dark">
            {/* Search Bar */}
            <div className="flex-1 max-w-md ml-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="search"
                        placeholder="Search My Drive"
                        className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-gray-200/70 dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4 pr-2">
                {/* Greeting Text */}
                {userData && (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Hi, <span className="text-black dark:text-white">{userData.first_name} {userData.last_name}</span>
                    </span>
                )}

                <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    <Bell className="w-5 h-5" />
                </button>
                
                <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Profile Dropdown */}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-mac-selection">
                            <img 
                                src={`https://avatar.vercel.sh/${userData?.email || 'guest'}`} 
                                alt="User Avatar" 
                            />
                        </button>
                    </DropdownMenu.Trigger>
                    
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            className="w-56 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl shadow-2xl rounded-xl p-1.5 mt-2 border border-gray-200 dark:border-zinc-700 animate-context-menu-in z-50"
                            sideOffset={5}
                            align="end"
                        >
                            <div className="px-2 py-2 mb-1">
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
                                <p className="text-sm font-medium truncate">{userData?.email}</p>
                            </div>

                            <DropdownMenu.Item className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer outline-none hover:bg-mac-selection hover:text-white transition-colors">
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </DropdownMenu.Item>

                            <DropdownMenu.Separator className="h-[1px] bg-gray-200 dark:bg-zinc-700 my-1" />

                            {/* Logout triggered here */}
                            <DropdownMenu.Item 
                                onClick={() => logoutAction()}
                                className="flex items-center gap-2 px-2 py-2 text-sm rounded-lg cursor-pointer outline-none text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                </DropdownMenu.Root>
            </div>
        </header>
    );
};

export default Topbar;