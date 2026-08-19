import React, { useState, useEffect } from 'react';
import { Edit2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { workspaceService } from '../../../services/workspace.service';
import toast from 'react-hot-toast';
import {renameWorkspaceSchema, type RenameWorkspaceInput } from '../../../validation/workspace.validation';

interface RenameWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: { id: string; name: string } | null;
  onSuccess: () => void;
}

export const RenameWorkspaceModal: React.FC<RenameWorkspaceModalProps> = ({ isOpen, onClose, workspace, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<RenameWorkspaceInput>({
    resolver: zodResolver(renameWorkspaceSchema),
    defaultValues: { name: '' }
  });

  useEffect(() => {
    if (workspace) {
      reset({ name: workspace.name });
    }
  }, [workspace, reset]);

  const onSubmit = async (data: RenameWorkspaceInput) => {
    if (!workspace) return;
    setIsLoading(true);
    try {
      await workspaceService.update(workspace.id, { name: data.name });
      toast.success('Workspace renamed successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to rename workspace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Workspace" maxWidth="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Workspace Name"
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
