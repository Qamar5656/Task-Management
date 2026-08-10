import React, { useState } from 'react';
import { FolderKanban } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { projectService } from '../../../services/project.service';
import toast from 'react-hot-toast';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

export const CreateProjectModal = ({ isOpen, onClose, workspaceId, onSuccess }: CreateProjectModalProps) => {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !workspaceId) return;

    setIsLoading(true);
    try {
      await projectService.create({ name, workspaceId });
      toast.success('Project created successfully');
      setName('');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Project Name"
          type="text"
          icon={FolderKanban}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Q3 Marketing Campaign"
          required
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
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
