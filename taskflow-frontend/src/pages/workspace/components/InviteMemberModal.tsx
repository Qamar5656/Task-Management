import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Mail, Shield, Loader2 } from 'lucide-react';
import { workspaceService, WorkspaceRole } from '../../../services/workspace.service';
import toast from 'react-hot-toast';
import { inviteMemberSchema, type InviteMemberInput } from '../../../validation/workspace.validation';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ isOpen, onClose, workspaceId, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: '', role: 'MEMBER' as 'ADMIN' | 'MEMBER' | 'VIEWER' }
  });

  const onSubmit = async (data: InviteMemberInput) => {
    setIsLoading(true);
    try {
      await workspaceService.addMember(workspaceId, data.email, data.role as WorkspaceRole);
      toast.success('Member invited successfully');
      onSuccess();
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to invite member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Member" maxWidth="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="user@example.com"
          icon={Mail}
          error={errors.email?.message}
          {...register('email')}
          autoFocus
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Role
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Shield className="h-5 w-5 text-slate-400" />
            </div>
            <select
              {...register('role')}
              className="block w-full pl-10 pr-10 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#0B1120] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none"
            >
              <option value={WorkspaceRole.ADMIN}>Admin (Can manage workspace & members)</option>
              <option value={WorkspaceRole.MEMBER}>Member (Can manage projects & tasks)</option>
              <option value={WorkspaceRole.VIEWER}>Viewer (Read-only access)</option>
            </select>
          </div>
          {errors.role && (
            <p className="mt-1.5 text-sm text-red-500 ml-1">{errors.role.message}</p>
          )}
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
