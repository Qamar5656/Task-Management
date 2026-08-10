import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, LayoutTemplate, Users, Settings, FolderKanban, Plus, Edit2, Trash2 } from 'lucide-react';
import { workspaceService, type Workspace } from '../../services/workspace.service';
import { projectService, type Project } from '../../services/project.service';
import { ActionMenu } from '../../components/ui/ActionMenu';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

import { CreateProjectModal } from './components/CreateProjectModal';
import { RenameProjectModal } from './components/RenameProjectModal';
import { DeleteProjectModal } from './components/DeleteProjectModal';

export const WorkspaceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);

  const fetchWorkspaceAndProjects = async () => {
    if (!id) return;
    try {
      const [workspaceData, projectsData] = await Promise.all([
        workspaceService.getById(id),
        projectService.getAllByWorkspace(id)
      ]);
      setWorkspace(workspaceData);
      setProjects(projectsData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch workspace details');
    } finally {
      setIsLoading(false);
      setIsProjectsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceAndProjects();
  }, [id]);

  const openRenameModal = (project: Project) => {
    setProjectToEdit(project);
    setIsRenameModalOpen(true);
  };

  const openDeleteModal = (project: Project) => {
    setProjectToEdit(project);
    setIsDeleteModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <LayoutTemplate className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Workspace not found</h2>
        <Link to="/workspaces" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          Return to Workspaces
        </Link>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col relative">
      {/* Header Area */}
      <div className="mb-8">
        <Link to="/workspaces" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workspaces
        </Link>
        
        <div className="flex items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-inner">
              <LayoutTemplate className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 font-heading">{workspace.name}</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Created on {new Date(workspace.createdAt).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area (Projects Area) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col"
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white font-heading">Projects</h2>
          <Button 
            variant="primary" 
            onClick={() => setIsCreateModalOpen(true)}
            className="!w-auto shadow-lg shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {isProjectsLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
              <FolderKanban className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6">No projects created yet in this workspace.</p>
            <Button 
              variant="secondary" 
              onClick={() => setIsCreateModalOpen(true)}
              className="!w-auto cursor-pointer"
            >
              Create First Project
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <Link to={`/projects/${project.id}`} className="block h-full">
                  <div className="group relative z-10 hover:z-50 focus-within:z-50 bg-slate-50 dark:bg-[#1E293B]/40 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-2xl p-6 transition-all duration-300 hover:border-indigo-400/50 dark:hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:-translate-y-1 h-full flex flex-col">
                    
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
                    
                    <div className="relative z-10 flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 dark:text-blue-400 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-all duration-300">
                        <FolderKanban className="w-6 h-6" />
                      </div>
                      
                      <div className="relative z-20">
                        <ActionMenu 
                          actions={[
                            { 
                              label: 'Rename', 
                              icon: Edit2, 
                              onClick: () => openRenameModal(project) 
                            },
                            { 
                              label: 'Delete', 
                              icon: Trash2, 
                              variant: 'danger',
                              onClick: () => openDeleteModal(project) 
                            }
                          ]}
                        />
                      </div>
                    </div>
                    
                    <div className="relative z-10 mt-auto">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors font-heading">
                        {project.name}
                      </h3>
                    </div>

                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      <CreateProjectModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        workspaceId={workspace.id}
        onSuccess={fetchWorkspaceAndProjects}
      />
      
      <RenameProjectModal 
        isOpen={isRenameModalOpen}
        onClose={() => setIsRenameModalOpen(false)}
        project={projectToEdit}
        onSuccess={fetchWorkspaceAndProjects}
      />
      
      <DeleteProjectModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        project={projectToEdit}
        onSuccess={fetchWorkspaceAndProjects}
      />

    </div>
  );
};
export default WorkspaceDetailPage;
