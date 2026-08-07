import React, { useState, useEffect } from 'react';
import { LayoutTemplate } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { workspaceService, type Workspace } from '../../../services/workspace.service';
import toast from 'react-hot-toast';

interface RenameWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace | null;
  onSuccess: () => void;
}

export const RenameWorkspaceModal = ({ isOpen, onClose, workspace, onSuccess }: RenameWorkspaceModalProps) => {
  const [newName, setNewName] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (workspace && isOpen) {
      setNewName(workspace.name);
    }
  }, [workspace, isOpen]);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace || !newName.trim()) return;

    setIsActionLoading(true);
    try {
      await workspaceService.update(workspace.id, { name: newName });
      toast.success('Workspace renamed successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to rename workspace');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Workspace">
      <form onSubmit={handleRename} className="space-y-6">
        <Input
          label="Workspace Name"
          type="text"
          icon={LayoutTemplate}
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
            isLoading={isActionLoading}
            className="w-auto cursor-pointer"
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
