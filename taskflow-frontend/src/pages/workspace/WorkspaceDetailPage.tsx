import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, LayoutTemplate, Users, Settings, FolderKanban, Plus, Edit2, Trash2, Mail, Shield, UserMinus } from 'lucide-react';
import { workspaceService, type Workspace, type WorkspaceMember, WorkspaceRole } from '../../services/workspace.service';
import { projectService, type Project } from '../../services/project.service';
import { labelService, type Label } from '../../services/label.service';
import { ActionMenu } from '../../components/ui/ActionMenu';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

import { CreateProjectModal } from './components/CreateProjectModal';
import { RenameProjectModal } from './components/RenameProjectModal';
import { DeleteProjectModal } from './components/DeleteProjectModal';
import { InviteMemberModal } from './components/InviteMemberModal';

export const WorkspaceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [isMembersLoading, setIsMembersLoading] = useState(true);
  const [isLabelsLoading, setIsLabelsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'members' | 'labels'>('projects');
  
  // Create Label State
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#6366f1');
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
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

  const fetchMembers = async () => {
    if (!id) return;
    setIsMembersLoading(true);
    try {
      const data = await workspaceService.getMembers(id);
      setMembers(data);
    } catch (error) {
      toast.error('Failed to fetch members');
    } finally {
      setIsMembersLoading(false);
    }
  };

  const fetchLabels = async () => {
    if (!id) return;
    setIsLabelsLoading(true);
    try {
      const data = await labelService.getByWorkspace(id);
      setLabels(data);
    } catch (error) {
      toast.error('Failed to fetch labels');
    } finally {
      setIsLabelsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceAndProjects();
    fetchMembers();
    fetchLabels();
  }, [id]);

  const handleRemoveMember = async (memberUserId: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await workspaceService.removeMember(id, memberUserId);
      toast.success("Member removed successfully");
      fetchMembers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newLabelName.trim()) return;
    setIsCreatingLabel(true);
    try {
      await labelService.create({ name: newLabelName.trim(), color: newLabelColor, workspaceId: id });
      toast.success("Label created successfully");
      setNewLabelName('');
      fetchLabels();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create label');
    } finally {
      setIsCreatingLabel(false);
    }
  };

  const currentUserRole = members.find(m => m.userId === user?.id)?.role;
  const canManageMembers = currentUserRole === WorkspaceRole.OWNER || currentUserRole === WorkspaceRole.ADMIN;

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
      <div className="mb-6">
        <Link to="/workspaces" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-black dark:hover:text-white transition-colors mb-4">
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

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 mb-6 px-2">
        <button
          onClick={() => setActiveTab('projects')}
          className={`pb-4 text-sm font-medium transition-colors relative cursor-pointer ${activeTab === 'projects' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4" />
            Projects
          </div>
          {activeTab === 'projects' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-4 text-sm font-medium transition-colors relative cursor-pointer ${activeTab === 'members' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Members
          </div>
          {activeTab === 'members' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('labels')}
          className={`pb-4 text-sm font-medium transition-colors relative cursor-pointer ${activeTab === 'labels' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2">
            <FolderKanban className="w-4 h-4" />
            Labels
          </div>
          {activeTab === 'labels' && (
            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col"
      >
        {activeTab === 'projects' ? (
          <>
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
          </>
        ) : activeTab === 'members' ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Workspace Members
              </h2>
              {canManageMembers && (
                <Button 
                  variant="primary" 
                  onClick={() => setIsInviteModalOpen(true)}
                  className="!w-auto shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Invite Member
                </Button>
              )}
            </div>

            {isMembersLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
                      <th className="pb-3 font-medium px-4">User</th>
                      <th className="pb-3 font-medium px-4">Role</th>
                      <th className="pb-3 font-medium px-4">Joined</th>
                      {canManageMembers && <th className="pb-3 font-medium px-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {members.map(member => (
                      <tr key={member.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                              {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">{member.user?.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">{member.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider
                            ${member.role === WorkspaceRole.OWNER ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 
                              member.role === WorkspaceRole.ADMIN ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400' :
                              member.role === WorkspaceRole.MEMBER ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' :
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {member.role === WorkspaceRole.OWNER && <Shield className="w-3 h-3" />}
                            {member.role}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-slate-500 dark:text-slate-400">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </td>
                        {canManageMembers && (
                          <td className="py-4 px-4 text-right">
                            {member.role !== WorkspaceRole.OWNER && member.userId !== user?.id && (
                              <ActionMenu 
                                actions={[
                                  { 
                                    label: 'Remove Member', 
                                    icon: UserMinus, 
                                    variant: 'danger',
                                    onClick: () => handleRemoveMember(member.userId)
                                  }
                                ]}
                              />
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : activeTab === 'labels' ? (
          <>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-indigo-500" />
                Workspace Labels
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
              {/* Create Label Form */}
              {canManageMembers && (
                <div className="lg:col-span-1 border-r border-slate-200 dark:border-slate-800 pr-0 lg:pr-8">
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Create New Label</h3>
                  <form onSubmit={handleCreateLabel} className="space-y-4">
                    <Input
                      label="Label Name"
                      placeholder="e.g. Bug, Feature, Urgent"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={newLabelColor}
                          onChange={(e) => setNewLabelColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                        />
                        <span className="text-sm font-mono text-slate-500">{newLabelColor}</span>
                      </div>
                    </div>
                    <Button type="submit" variant="primary" className="w-full" disabled={isCreatingLabel}>
                      {isCreatingLabel ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                      Create Label
                    </Button>
                  </form>
                </div>
              )}

              {/* Labels List */}
              <div className={`lg:col-span-2 ${!canManageMembers ? 'lg:col-span-3' : ''}`}>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Available Labels</h3>
                {isLabelsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  </div>
                ) : labels.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    No labels created yet.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-3">
                    {labels.map(label => (
                      <div 
                        key={label.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
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

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={workspace.id}
        onSuccess={fetchMembers}
      />

    </div>
  );
};
export default WorkspaceDetailPage;
