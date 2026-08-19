import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TaskStatus, Priority, taskService, type Task } from '../../../services/task.service';
import { workspaceService, type WorkspaceMember } from '../../../services/workspace.service';
import { projectService } from '../../../services/project.service';
import toast from 'react-hot-toast';
import { Calendar, Clock, User as UserIcon } from 'lucide-react';
import { createTaskSchema, type CreateTaskInput } from '../../../validation/task.validation';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialStatus: TaskStatus;
  taskToEdit?: Task | null;
  onSuccess: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  projectId,
  initialStatus,
  taskToEdit,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<CreateTaskInput>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      name: '',
      description: '',
      priority: Priority.MEDIUM,
      status: initialStatus,
      userId: '',
      startDate: '',
      dueDate: '',
      estimate: '' as any
    }
  });

  useEffect(() => {
    if (isOpen && projectId) {
      // Fetch workspace members for assignment
      const fetchMembers = async () => {
        try {
          const project = await projectService.getById(projectId);
          const workspaceMembers = await workspaceService.getMembers(project.workspaceId);
          setMembers(workspaceMembers);
        } catch (e) {
          console.error("Failed to load workspace members");
        }
      };
      fetchMembers();

      if (taskToEdit) {
        reset({
          name: taskToEdit.name,
          description: taskToEdit.description || '',
          priority: taskToEdit.priority,
          status: taskToEdit.status,
          userId: taskToEdit.user?.id || '',
          startDate: taskToEdit.startDate ? new Date(taskToEdit.startDate).toISOString().split('T')[0] : '',
          dueDate: taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '',
          estimate: (taskToEdit.estimate ? taskToEdit.estimate.toString() : '') as any
        });
      } else {
        reset({
          name: '',
          description: '',
          priority: Priority.MEDIUM,
          status: initialStatus,
          userId: '',
          startDate: '',
          dueDate: '',
          estimate: '' as any
        });
      }
    }
  }, [isOpen, taskToEdit, initialStatus, projectId, reset]);

  const onSubmit = async (data: CreateTaskInput) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        priority: data.priority,
        status: data.status,
        userId: data.userId || undefined,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
        estimate: data.estimate ? Number(data.estimate) : undefined,
      };

      if (taskToEdit) {
        await taskService.update(taskToEdit.id, payload);
        toast.success("Task updated successfully");
      } else {
        await taskService.create({
          projectId,
          ...payload
        });
        toast.success("Task created successfully");
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? "Edit Task" : "Create New Task"}
    >
      <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 mt-4">
        <Input
          label="Task Name"
          error={errors.name?.message}
          {...register('name')}
          placeholder="e.g., Design landing page..."
          autoFocus
        />
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            {...register('description')}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[100px] resize-none"
            placeholder="Add some details about this task..."
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-red-500 ml-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select
              {...register('status')}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white"
            >
              {Object.values(TaskStatus).map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
            {errors.status && (
              <p className="mt-1.5 text-sm text-red-500 ml-1">{errors.status.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Priority
            </label>
            <select
              {...register('priority')}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white"
            >
              {Object.values(Priority).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {errors.priority && (
              <p className="mt-1.5 text-sm text-red-500 ml-1">{errors.priority.message}</p>
            )}
          </div>
          
          <div className="space-y-1 sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4" /> Assignee
            </label>
            <select
              {...register('userId')}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white"
            >
              <option value="">Unassigned (defaults to you)</option>
              {members.map(m => (
                <option key={m.user?.id} value={m.user?.id}>{m.user?.name || m.user?.email}</option>
              ))}
            </select>
            {errors.userId && (
              <p className="mt-1.5 text-sm text-red-500 ml-1">{errors.userId.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Start Date
            </label>
            <input
              type="date"
              {...register('startDate')}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white"
            />
            {errors.startDate && (
              <p className="mt-1.5 text-sm text-red-500 ml-1">{errors.startDate.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Due Date
            </label>
            <input
              type="date"
              {...register('dueDate')}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white"
            />
            {errors.dueDate && (
              <p className="mt-1.5 text-sm text-red-500 ml-1">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Estimate (Hours)
            </label>
            <input
              type="number"
              min="0"
              {...register('estimate')}
              placeholder="e.g., 4"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white"
            />
            {errors.estimate && (
              <p className="mt-1.5 text-sm text-red-500 ml-1">{errors.estimate.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {taskToEdit ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
