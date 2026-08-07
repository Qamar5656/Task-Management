import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FolderKanban, Settings, Sparkles, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: Home },
  { name: 'Workspaces', path: '/workspaces', icon: FolderKanban },
  { name: 'Settings', path: '/settings', icon: Settings },
];

interface SidebarProps {
  isCollapsed: boolean;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
}

export const Sidebar = ({ isCollapsed, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) => {
  return (
    <div 
      className={`fixed md:fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0F172A]/60 backdrop-blur-xl border-r border-slate-800/60 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      } ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Logo Area */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/60 relative">
        <div className={`flex items-center gap-3 ${isCollapsed ? 'mx-auto' : ''}`}>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <Link to="/">
          {!isCollapsed && (
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 whitespace-nowrap">
              TaskFlow
            </span>
          )}
          </Link>
        </div>
        
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden p-2 -mr-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 py-6 space-y-2 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => setIsMobileMenuOpen(false)}
            title={isCollapsed ? item.name : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 rounded-xl transition-all duration-300 font-medium ${isCollapsed ? 'justify-center px-0' : 'px-4'} ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
          </NavLink> 
        ))}
      </nav>

      {/* Footer Area */}
      {!isCollapsed ? (
        <div className="p-4 border-t border-white/10 whitespace-nowrap overflow-hidden">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
            <p className="text-xs text-slate-400 font-medium mb-2">Pro Plan</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '45%' }}
                transition={{ duration: 1, delay: 0.2 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1.5 rounded-full"
              />
            </div>
            <p className="text-xs text-slate-500">45% limits used</p>
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-white/10 flex justify-center">
          <div className="w-8 h-8 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-400" title="Pro Plan">
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
        </div>
      )}
    </div>
  );
};
