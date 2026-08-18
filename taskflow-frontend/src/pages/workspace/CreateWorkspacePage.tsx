import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutTemplate, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { workspaceService } from '../../services/workspace.service';
import { createWorkspaceSchema, type CreateWorkspaceInput } from '../../validation/workspace.validation';

export const CreateWorkspacePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { name: '' }
  });

  const onSubmit = async (data: CreateWorkspaceInput) => {
    setIsLoading(true);
    try {
      await workspaceService.create({ name: data.name });
      toast.success('Workspace created successfully!');
      navigate(`/workspaces`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto py-8">
      
      <div className="mb-8">
        <Link to="/workspaces" className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workspaces
        </Link>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-heading">Create a new workspace</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Workspaces are shared environments where your team can collaborate on projects and tasks.
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Workspace Name"
            type="text"
            placeholder="e.g. Acme Corp Engineering"
            icon={LayoutTemplate}
            error={errors.name?.message}
            {...register('name')}
            autoFocus
          />

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => navigate(-1)}
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
              Create Workspace
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
