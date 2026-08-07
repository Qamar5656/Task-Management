import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { workspaceService, type Workspace } from '../../../services/workspace.service';
import toast from 'react-hot-toast';

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspace: Workspace | null;
  onSuccess: () => void;
}

export const DeleteWorkspaceModal = ({ isOpen, onClose, workspace, onSuccess }: DeleteWorkspaceModalProps) => {
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleDelete = async () => {
    if (!workspace) return;

    setIsActionLoading(true);
    try {
      await workspaceService.delete(workspace.id);
      toast.success('Workspace deleted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete workspace');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Workspace">
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-300 mb-1">Warning: Destructive Action</h4>
            <p className="text-sm">
              Are you sure you want to delete <strong className="text-white">{workspace?.name}</strong>? 
              This action cannot be undone and will delete all associated projects and tasks.
            </p>
          </div>
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
          <button 
            onClick={handleDelete}
            disabled={isActionLoading}
            className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center min-w-[100px] cursor-pointer disabled:opacity-70"
          >
            {isActionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete Workspace'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
