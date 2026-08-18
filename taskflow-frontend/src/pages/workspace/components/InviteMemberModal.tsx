import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Mail, Shield, Loader2 } from 'lucide-react';
import { workspaceService, WorkspaceRole } from '../../../services/workspace.service';
import toast from 'react-hot-toast';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

export const InviteMemberModal = ({ isOpen, onClose, workspaceId, onSuccess }: InviteMemberModalProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<WorkspaceRole>(WorkspaceRole.MEMBER);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsLoading(true);
    try {
      await workspaceService.addMember(workspaceId, email.trim(), role);
      toast.success('Member invited successfully');
      onSuccess();
      onClose();
      setEmail('');
      setRole(WorkspaceRole.MEMBER);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to invite member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Member">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="user@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Role
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-5 w-5 text-slate-400" />
            </div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as WorkspaceRole)}
              className="block w-full pl-10 pr-10 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
            >
              <option value={WorkspaceRole.ADMIN}>Admin (Can manage workspace & members)</option>
              <option value={WorkspaceRole.MEMBER}>Member (Can manage projects & tasks)</option>
              <option value={WorkspaceRole.VIEWER}>Viewer (Read-only access)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading} className='cursor-pointer'>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} className='cursor-pointer'>
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Send Invite
          </Button>
        </div>
      </form>
    </Modal>
  );
};
