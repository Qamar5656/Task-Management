import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, type LucideIcon } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

interface ActionMenuProps {
  actions: ActionMenuItem[];
}

export const ActionMenu = ({ actions }: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleActionClick = (e: React.MouseEvent, action: ActionMenuItem) => {
    e.preventDefault(); // Prevent linking if nested in a Link
    e.stopPropagation(); // Stop event bubbling
    action.onClick();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        aria-label="Open action menu"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-2 rounded-lg transition-colors cursor-pointer ${
          isOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50"
          >
            <div className="py-1">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => handleActionClick(e, action)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                    action.variant === 'danger'
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-700 dark:hover:text-red-300'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
