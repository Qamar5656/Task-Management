import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const DashboardLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white flex overflow-hidden relative transition-colors duration-300">
      
      {/* Animated Mesh Gradient Backgrounds */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[128px] opacity-30 dark:opacity-20 animate-blob pointer-events-none" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[128px] opacity-30 dark:opacity-20 animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-[128px] opacity-30 dark:opacity-20 animate-blob pointer-events-none" style={{ animationDelay: '4s' }} />
      
      <div className="relative z-10 flex w-full">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
        
        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/50 dark:bg-[#0B0F19]/80 backdrop-blur-md z-40 md:hidden cursor-pointer transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <Header 
            isSidebarCollapsed={isSidebarCollapsed}
            setIsSidebarCollapsed={setIsSidebarCollapsed}
            setIsMobileMenuOpen={setIsMobileMenuOpen} 
          />
          <main 
            className={`flex-1 p-4 lg:p-8 mt-[1px] relative overflow-y-auto h-[calc(100vh-64px)] transition-all duration-300 ${
              isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
            }`}
          >
            <div className="relative z-10 max-w-7xl mx-auto h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
