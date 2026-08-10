import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Edit2, Trash2, LayoutTemplate, Plus, FolderKanban, Clock, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ActionMenu } from '../../components/ui/ActionMenu';
import { workspaceService, type Workspace } from '../../services/workspace.service';
import toast from 'react-hot-toast';

import { RenameWorkspaceModal } from './components/RenameWorkspaceModal';
import { DeleteWorkspaceModal } from './components/DeleteWorkspaceModal';

export const WorkspacesPage = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [workspaceToEdit, setWorkspaceToEdit] = useState<Workspace | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const fetchWorkspaces = async () => {
    try {
      const data = await workspaceService.getAll();
      setWorkspaces(data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch workspaces');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const openRenameModal = (workspace: Workspace) => {
    setWorkspaceToEdit(workspace);
    setIsRenameModalOpen(true);
  };

  const openDeleteModal = (workspace: Workspace) => {
    setWorkspaceToEdit(workspace);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Header Area */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-heading">Your Workspaces</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage and organize your projects across different teams.</p>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Link to="/workspaces/create">
              <Button 
                variant="primary" 
                className="w-full md:w-auto shadow-lg shadow-indigo-500/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                New Workspace
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : workspaces.length === 0 ? (
          /* Empty State */
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/50 dark:bg-[#1E293B]/40 backdrop-blur-md border border-slate-200 dark:border-white/5 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-12 min-h-[400px]"
          >
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-white/5">
              <FolderKanban className="w-10 h-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-heading">No workspaces yet</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8 text-lg">
              Create your first workspace to start organizing your projects, tasks, and team members all in one place.
            </p>
            <Link to="/workspaces/create">
              <Button 
                variant="secondary" 
                className="px-8 w-auto cursor-pointer"
              >
                Create Workspace
              </Button>
            </Link>
          </motion.div>
        ) : (
          /* Workspace Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {workspaces.map((workspace, index) => (
              <motion.div
                key={workspace.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <Link to={`/workspaces/${workspace.id}`} className="block h-full">
                  <div className="group relative z-10 hover:z-50 focus-within:z-50 bg-white/70 dark:bg-[#1E293B]/40 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-3xl p-6 transition-all duration-300 hover:border-indigo-400/50 dark:hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:-translate-y-1 h-full flex flex-col">
                    
                    {/* Hover Gradient Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
                    
                    {/* Card Header */}
                    <div className="relative z-10 flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-all duration-300">
                        <LayoutTemplate className="w-7 h-7" />
                      </div>
                      
                      {/* Action Menu (prevent click from navigating) */}
                      <div className="relative z-20">
                        <ActionMenu 
                          actions={[
                            { 
                              label: 'Rename Workspace', 
                              icon: Edit2, 
                              onClick: () => openRenameModal(workspace) 
                            },
                            { 
                              label: 'Delete Workspace', 
                              icon: Trash2, 
                              variant: 'danger',
                              onClick: () => openDeleteModal(workspace) 
                            }
                          ]}
                        />
                      </div>
                    </div>
                    
                    {/* Card Body */}
                    <div className="relative z-10 flex-1 flex flex-col">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors font-heading">
                        {workspace.name}
                      </h3>
                      
                      {/* Spacer to push footer to bottom */}
                      <div className="mt-auto pt-6" />
                      
                      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-white/5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(workspace.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform">
                          <span className="font-medium">Open</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

      {/* Extracted Modals */}
      <RenameWorkspaceModal 
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        workspace={workspaceToEdit}
        onSuccess={fetchWorkspaces}
      />
      
      <DeleteWorkspaceModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        workspace={workspaceToEdit}
        onSuccess={fetchWorkspaces}
      />
      
    </div>
  );
};
export default WorkspacesPage;