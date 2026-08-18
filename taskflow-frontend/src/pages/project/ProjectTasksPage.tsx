import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { ArrowLeft, Loader2, FolderKanban, Columns } from 'lucide-react';
import { projectService, type Project } from '../../services/project.service';
import { taskService, type Task, TaskStatus } from '../../services/task.service';
import { TaskColumn } from './components/TaskColumn';
import { CreateTaskModal } from './components/CreateTaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskCard } from './components/TaskCard';
import toast from 'react-hot-toast';

const COLUMNS = [
  { id: TaskStatus.TODO, title: 'To Do' },
  { id: TaskStatus.IN_PROGRESS, title: 'In Progress' },
  { id: TaskStatus.IN_REVIEW, title: 'In Review' },
  { id: TaskStatus.DONE, title: 'Done' },
];

export const ProjectTasksPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [taskToView, setTaskToView] = useState<Task | null>(null);
  const [modalInitialStatus, setModalInitialStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const fetchProjectAndTasks = async () => {
    if (!id) return;
    try {
      const [projectData, tasksData] = await Promise.all([
        projectService.getById(id),
        taskService.getByProject(id)
      ]);
      setProject(projectData);
      setTasks(tasksData);
    } catch (error: any) {
      toast.error('Failed to load project details');
      navigate('/workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [id]);

  const handleOpenCreateModal = (status: TaskStatus) => {
    setTaskToEdit(null);
    setModalInitialStatus(status);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task: Task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (task: Task) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await taskService.delete(task.id);
      setTasks(tasks.filter(t => t.id !== task.id));
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const handleMoveTask = async (task: Task, newStatus: TaskStatus) => {
    if (task.status === newStatus) return;
    
    try {
      // Optimistic update
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      
      // Backend update
      await taskService.update(task.id, { status: newStatus });
    } catch (error) {
      toast.error("Failed to move task");
      fetchProjectAndTasks(); // Revert on failure
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const taskId = active.id as string;
      const newStatus = over.id as TaskStatus;
      
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        handleMoveTask(task, newStatus);
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

  if (!project) return null;

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Header Area */}
      <div className="mb-6 flex-shrink-0">
        <Link 
          to={`/workspaces/${project.workspaceId}`} 
          className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workspace
        </Link>
        
        <div className="flex items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-inner">
              <FolderKanban className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1 font-heading">{project.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
                <Columns className="w-4 h-4" /> Board View
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Kanban Board Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 overflow-x-auto custom-scrollbar pb-4"
      >
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map((column) => (
              <TaskColumn 
                key={column.id}
                title={column.title}
                status={column.id}
                tasks={tasks.filter(t => t.status === column.id)}
                onAddTask={handleOpenCreateModal}
                onEditTask={handleOpenEditModal}
                onDeleteTask={handleDeleteTask}
                onTaskClick={setTaskToView}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </motion.div>

      <CreateTaskModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={project.id}
        initialStatus={modalInitialStatus}
        taskToEdit={taskToEdit}
        onSuccess={fetchProjectAndTasks}
      />

      <TaskDetailModal
        isOpen={!!taskToView}
        onClose={() => setTaskToView(null)}
        task={taskToView}
        onEdit={handleOpenEditModal}
        onDelete={handleDeleteTask}
      />
    </div>
  );
};
