import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { projectService, type Project } from '../../../services/project.service';
import toast from 'react-hot-toast';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onSuccess: () => void;
}

export const DeleteProjectModal = ({ isOpen, onClose, project, onSuccess }: DeleteProjectModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!project) return;

    setIsLoading(true);
    try {
      await projectService.delete(project.id);
      toast.success('Project deleted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Project">
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-700 dark:text-red-300 mb-1">Warning: Destructive Action</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{project?.name}</strong>? 
              This action cannot be undone and will delete all associated tasks.
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
            disabled={isLoading}
            className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center min-w-[100px] cursor-pointer disabled:opacity-70"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Delete Project'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
