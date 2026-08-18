import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Loader2, Clock, FolderKanban, Briefcase } from 'lucide-react';
import { taskService, type Task, TaskStatus, Priority } from '../../services/task.service';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TaskDetailModal } from '../project/components/TaskDetailModal';
import { CreateTaskModal } from '../project/components/CreateTaskModal';

const statusConfig = {
  [TaskStatus.TODO]: { label: 'To Do', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  [TaskStatus.IN_PROGRESS]: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  [TaskStatus.IN_REVIEW]: { label: 'In Review', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  [TaskStatus.DONE]: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  [TaskStatus.BLOCKED]: { label: 'Blocked', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
};

const priorityColors = {
  [Priority.LOW]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  [Priority.MEDIUM]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [Priority.HIGH]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  [Priority.URGENT]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const GlobalTasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getMyTasks();
      setTasks(data);
    } catch (error) {
      toast.error("Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleDeleteTask = async (task: Task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.delete(task.id);
        toast.success('Task deleted successfully');
        fetchTasks();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Group tasks by status
  const groupedTasks = Object.values(TaskStatus).map(status => ({
    status,
    tasks: tasks.filter(t => t.status === status)
  }));

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="mb-8 flex-shrink-0">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 font-heading">Workspace Tasks</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              All tasks across your workspaces
            </p>
          </div>
        </motion.div>
      </div>

      {/* Task List */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 overflow-y-auto custom-scrollbar pb-12 pr-4 space-y-8"
      >
        {groupedTasks.map(group => group.tasks.length > 0 && (
          <div key={group.status} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{statusConfig[group.status].label}</h2>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusConfig[group.status].color}`}>
                {group.tasks.length}
              </span>
            </div>
            
            <div className="space-y-3">
              {group.tasks.map(task => (
                <div key={task.id} onClick={() => setTaskToView(task)} className="block group cursor-pointer">
                  <div className="bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-500/50">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      {/* Left: Task Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {task.name}
                          </h3>
                          <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-md flex-shrink-0 ${priorityColors[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                          {task.project && (
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300">
                              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                              {task.project.workspace?.name} <span className="opacity-50">/</span> <FolderKanban className="w-3.5 h-3.5 text-blue-500 ml-1" /> {task.project.name}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Right: Actions / Status */}
                      <div className="flex sm:flex-col items-center justify-between sm:items-end gap-3 flex-shrink-0 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 dark:border-slate-800">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${statusConfig[task.status].color}`}>
                          {statusConfig[task.status].label}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20">
            <CheckSquare className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No tasks found</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">You're all caught up!</p>
          </div>
        )}
      </motion.div>

      <TaskDetailModal
        isOpen={!!taskToView}
        onClose={() => setTaskToView(null)}
        task={taskToView}
        showProjectLink={true}
        onEdit={(task) => {
          setTaskToEdit(task);
          setIsEditModalOpen(true);
        }}
        onDelete={handleDeleteTask}
      />

      {taskToEdit && (
        <CreateTaskModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setTaskToEdit(null);
          }}
          projectId={taskToEdit.projectId}
          initialStatus={taskToEdit.status}
          taskToEdit={taskToEdit}
          onSuccess={fetchTasks}
        />
      )}
    </div>
  );
};
