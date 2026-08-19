import React, { useState } from 'react';
import { FolderKanban } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { projectService } from '../../../services/project.service';
import toast from 'react-hot-toast';
import { createProjectSchema, type CreateProjectInput } from '../../../validation/workspace.validation';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, workspaceId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: '', description: '' }
  });

  const onSubmit = async (data: CreateProjectInput) => {
    setIsLoading(true);
    try {
      const newProject = await projectService.create({
        name: data.name,
        workspaceId
      });
      toast.success('Project created successfully');
      onSuccess();
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Project" maxWidth="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Project Name"
          placeholder="e.g. Website Redesign"
          icon={FolderKanban}
          error={errors.name?.message}
          {...register('name')}
          autoFocus
        />
        
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Description (Optional)
          </label>
          <textarea
            className="w-full px-4 py-2.5 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
            placeholder="What is this project about?"
            rows={3}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1.5 text-sm text-red-500 ml-1">{errors.description.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={onClose}
            className="w-auto cursor-pointer"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            isLoading={isLoading}
            className="w-auto cursor-pointer"
          >
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
