import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'glass';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', isLoading, className = '', disabled, ...props }, ref) => {
    
    const baseStyles = "relative w-full flex justify-center items-center py-2.5 px-4 rounded-lg font-medium transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0F172A] focus:ring-indigo-500";
    
    const variants = {
      primary: "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 border border-transparent dark:border-white/10",
      secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700",
      glass: "bg-white/50 dark:bg-white/5 backdrop-blur-md text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10"
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        className={`${baseStyles} ${variants[variant]} ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
        <span className={isLoading ? 'opacity-90' : ''}>{children as React.ReactNode}</span>
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
