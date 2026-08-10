import React from 'react';
import { LogOut, Bell, Search, User as UserIcon, Menu, PanelLeftClose, PanelLeftOpen, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

interface HeaderProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (v: boolean) => void;
  setIsMobileMenuOpen: (v: boolean) => void;
}

export const Header = ({ isSidebarCollapsed, setIsSidebarCollapsed, setIsMobileMenuOpen }: HeaderProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`h-16 bg-white/80 dark:bg-[#0B0F19]/60 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 w-full transition-all duration-300 ${
      isSidebarCollapsed ? 'md:ml-20 md:w-[calc(100%-5rem)]' : 'md:ml-64 md:w-[calc(100%-16rem)]'
    }`}>
      
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex-shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:flex p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex-shrink-0 transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        {/* Global Search */}
        <div className="max-w-md hidden md:flex w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks or workspaces..." 
              className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4 ml-4">
        {/* Search for Mobile */}
        <button className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
          <Search className="w-5 h-5" />
        </button>
        
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-amber-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-500 rounded-full border-2 border-white dark:border-slate-900" />
        </button>

        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

        {/* User Profile / Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{user?.name}</span>
            <span className="text-xs text-slate-500">{user?.email}</span>
          </div>
          
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-indigo-100 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold shadow-sm dark:shadow-lg dark:shadow-indigo-500/10">
            {user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
          </div>

          <button 
            onClick={logout}
            title="Sign Out"
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer sm:ml-2"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
