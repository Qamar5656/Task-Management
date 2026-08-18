import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { type Task, TaskStatus } from '../../../services/task.service';
import { TaskCard } from './TaskCard';
import { Plus } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onTaskClick?: (task: Task) => void;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  status,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onTaskClick,
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex-shrink-0 w-[320px] flex flex-col bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-white/5 h-full overflow-hidden transition-colors ${isOver ? 'bg-indigo-500/10 border-indigo-500/50 dark:bg-indigo-500/10' : ''}`}
    >
      <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-800 dark:text-slate-200">{title}</h3>
          <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button 
          onClick={() => onAddTask(status)}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {tasks.map(task => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onEdit={onEditTask} 
            onDelete={onDeleteTask}
            onClick={onTaskClick}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-24 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">No tasks yet</p>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-slate-200 dark:border-white/5 bg-white/50 dark:bg-slate-900/20">
        <Button 
          variant="secondary" 
          onClick={() => onAddTask(status)}
          className="w-full justify-center !py-2 text-sm bg-transparent hover:bg-slate-200 dark:hover:bg-slate-800 border-none shadow-none"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>
    </div>
  );
};
