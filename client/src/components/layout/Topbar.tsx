'use client'

import { Search, Bell, Settings, LogOut } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

const Topbar = () => {
    const { theme, setTheme } = useTheme();

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
            <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <Bell className="w-5 h-5" />
                </button>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Profile Dropdown */}
                <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                        <button className="w-8 h-8 rounded-full overflow-hidden">
                            <img src="https://avatar.vercel.sh/nextjs" alt="User Avatar" />
                        </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                        <DropdownMenu.Content
                            className="w-48 bg-white dark:bg-zinc-800 shadow-lg rounded-lg p-2 mt-2 border border-gray-200 dark:border-zinc-700 animate-context-menu-in"
                            sideOffset={5}
                        >
                            <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none hover:bg-gray-100 dark:hover:bg-zinc-700">
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-[1px] bg-gray-200 dark:bg-zinc-700 my-1" />
                            <DropdownMenu.Item className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer outline-none text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
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