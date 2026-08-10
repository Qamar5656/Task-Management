import React, { useState, useEffect } from 'react';
import { FolderKanban } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { projectService, type Project } from '../../../services/project.service';
import toast from 'react-hot-toast';

interface RenameProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess: () => void;
}

export const RenameProjectModal = ({ isOpen, onClose, project, onSuccess }: RenameProjectModalProps) => {
  const [newName, setNewName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (project && isOpen) {
      setNewName(project.name);
    }
  }, [project, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !newName.trim()) return;

    setIsLoading(true);
    try {
      await projectService.update(project.id, { name: newName });
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
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Project">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Project Name"
          type="text"
          icon={FolderKanban}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
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
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
