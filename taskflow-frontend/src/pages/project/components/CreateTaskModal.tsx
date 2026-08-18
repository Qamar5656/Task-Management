import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { TaskStatus, Priority, taskService, type Task } from '../../../services/task.service';
import { workspaceService, type WorkspaceMember } from '../../../services/workspace.service';
import { projectService } from '../../../services/project.service';
import toast from 'react-hot-toast';
import { Calendar, Clock, User as UserIcon } from 'lucide-react';

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
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [estimate, setEstimate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

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
        setName(taskToEdit.name);
        setDescription(taskToEdit.description || '');
        setPriority(taskToEdit.priority);
        setStatus(taskToEdit.status);
        setAssigneeId(taskToEdit.user?.id || '');
        setStartDate(taskToEdit.startDate ? new Date(taskToEdit.startDate).toISOString().split('T')[0] : '');
        setDueDate(taskToEdit.dueDate ? new Date(taskToEdit.dueDate).toISOString().split('T')[0] : '');
        setEstimate(taskToEdit.estimate ? taskToEdit.estimate.toString() : '');
      } else {
        setName('');
        setDescription('');
        setPriority(Priority.MEDIUM);
        setStatus(initialStatus);
        setAssigneeId('');
        setStartDate('');
        setDueDate('');
        setEstimate('');
      }
    }
  }, [isOpen, taskToEdit, initialStatus, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    try {
      const payload = {
        name,
        description,
        priority,
        status,
        userId: assigneeId || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        estimate: estimate ? parseInt(estimate) : undefined,
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
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <Input
          label="Task Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Design landing page..."
          required
        />
        
        <div className="space-y-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[100px] resize-none"
            placeholder="Add some details about this task..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white"
            >
              {Object.values(TaskStatus).map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white"
            >
              {Object.values(Priority).map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1 sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4" /> Assignee
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white"
            >
              <option value="">Unassigned (defaults to you)</option>
              {members.map(m => (
                <option key={m.user.id} value={m.user.id}>{m.user.name || m.user.email}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Estimate (Hours)
            </label>
            <input
              type="number"
              min="0"
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
              placeholder="e.g., 4"
              className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 outline-none text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading} disabled={!name.trim()}>
            {taskToEdit ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
