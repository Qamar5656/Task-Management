import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical, Calendar, Clock, AlertCircle, Edit2, Trash2, User } from 'lucide-react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { type Task, TaskStatus, Priority } from '../../../services/task.service';
import { ActionMenu } from '../../../components/ui/ActionMenu';

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
  onClick?: (task: Task) => void;
  isOverlay?: boolean;
}

const priorityColors = {
  [Priority.LOW]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  [Priority.MEDIUM]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [Priority.HIGH]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  [Priority.URGENT]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onClick, isOverlay = false }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task
  });

  const style = isOverlay ? undefined : {
    transform: CSS.Translate.toString(transform),
    zIndex: isDragging ? 999 : undefined,
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay ? {} : attributes)}
      {...(isOverlay ? {} : listeners)}
      layout={!isOverlay}
      initial={isOverlay ? undefined : { opacity: 0, y: 10 }}
      animate={isOverlay ? undefined : { opacity: 1, y: 0 }}
      exit={isOverlay ? undefined : { opacity: 0, scale: 0.9 }}
      onClick={() => onClick?.(task)}
      className={`group bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 relative focus-within:z-50 cursor-pointer active:cursor-grabbing ${isDragging && !isOverlay ? 'opacity-50 ring-2 ring-indigo-500 shadow-xl' : 'z-10 hover:z-50'} ${isOverlay ? 'shadow-2xl ring-2 ring-indigo-500 rotate-2' : ''}`}
    >
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {task.labels.map(label => (
            <span 
              key={label.id} 
              className="px-2 py-0.5 rounded text-[10px] font-medium"
              style={{ backgroundColor: `${label.color}20`, color: label.color }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-start mb-2">
        <div className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md ${priorityColors[task.priority]}`}>
          {task.priority}
        </div>
        {onEdit && onDelete && (
          <ActionMenu
            actions={[
              { label: 'Edit', icon: Edit2, onClick: () => onEdit(task) },
              { label: 'Delete', icon: Trash2, variant: 'danger', onClick: () => onDelete(task) }
            ]}
          />
        )}
      </div>

      <h4 className="font-semibold text-slate-900 dark:text-white mb-2 leading-tight">
        {task.name}
      </h4>

      {task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
          {task.estimate && (
            <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{task.estimate}h</span>
            </div>
          )}
        </div>
        
        {task.user && (
          <div 
            className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-[10px] border border-white dark:border-slate-800"
            title={`Assigned to ${task.user.name || task.user.email}`}
          >
            {(task.user.name || task.user.email).charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </motion.div>
  );
};
