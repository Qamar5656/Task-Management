import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { projectService } from '../../../services/project.service';
import toast from 'react-hot-toast';
import { renameProjectSchema, type RenameProjectInput } from '../../../validation/workspace.validation';

interface RenameProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: { id: string; name: string } | null;
  onSuccess: () => void;
}

export const RenameProjectModal: React.FC<RenameProjectModalProps> = ({ isOpen, onClose, project, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RenameProjectInput>({
    resolver: zodResolver(renameProjectSchema),
    defaultValues: { name: '' }
  });

  useEffect(() => {
    if (project) {
      reset({ name: project.name });
    }
  }, [project, reset]);

  const onSubmit = async (data: RenameProjectInput) => {
    if (!project) return;
    setIsLoading(true);
    try {
      await projectService.update(project.id, { name: data.name });
      toast.success('Project renamed successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to rename project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Project" maxWidth="max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Project Name"
          icon={Edit2}
          error={errors.name?.message}
          {...register('name')}
          autoFocus
        />
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
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
