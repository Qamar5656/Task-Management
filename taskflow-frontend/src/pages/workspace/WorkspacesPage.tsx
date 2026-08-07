import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Edit2, Trash2, LayoutTemplate, Plus } from 'lucide-react';
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
      <div className="flex items-center justify-between gap-4 mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-white mb-1">Workspaces</h1>
          <p className="text-slate-400 text-sm">Manage your team's workspaces and projects.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <Link to="/workspaces/create">
            <Button variant="primary" className="shadow-lg shadow-indigo-500/20 cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              New Workspace
            </Button>
          </Link>
        </motion.div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : workspaces.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-8 min-h-[300px]"
        >
          <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <LayoutTemplate className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No active workspaces</h3>
          <p className="text-slate-400 max-w-sm mb-6">
            Get started by creating your first workspace to collaborate with your team and manage projects.
          </p>
          <Link to="/workspaces/create">
            <Button variant="secondary" className='cursor-pointer'>
              Create Workspace
            </Button>
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {workspaces.map((workspace, index) => (
            <motion.div
              key={workspace.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/workspaces/${workspace.id}`} className="block h-full">
                <div className="group relative bg-[#1E293B]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:-translate-y-1 h-full flex flex-col">
                  
                  {/* Subtle inner hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  <div className="relative z-10 flex justify-between items-start mb-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                      <LayoutTemplate className="w-6 h-6" />
                    </div>
                    
                    {/* Reusable Action Menu */}
                    <div className="relative z-20">
                      <ActionMenu 
                        actions={[
                          { 
                            label: 'Rename', 
                            icon: Edit2, 
                            onClick: () => openRenameModal(workspace) 
                          },
                          { 
                            label: 'Delete', 
                            icon: Trash2, 
                            variant: 'danger',
                            onClick: () => openDeleteModal(workspace) 
                          }
                        ]}
                      />
                    </div>
                  </div>
                  
                  <div className="relative z-10 mt-auto">
                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors font-heading">
                      {workspace.name}
                    </h3>
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