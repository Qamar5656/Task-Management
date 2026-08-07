import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, LayoutTemplate, Users, Settings } from 'lucide-react';
import { workspaceService} from '../../services/workspace.service';
import toast from 'react-hot-toast';

export const WorkspaceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!id) return;
      try {
        const data = await workspaceService.getById(id);
        setWorkspace(data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch workspace details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkspace();
  }, [id]);

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
    <div className="h-full flex flex-col">
      {/* Header Area */}
      <div className="mb-8">
        <Link to="/workspaces" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workspaces
        </Link>
        
        <div className="flex items-center justify-between gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner">
              <LayoutTemplate className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">{workspace.name}</h1>
              <p className="text-slate-400 text-sm">
                Created on {new Date(workspace.createdAt).toLocaleDateString()}
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer" title="Manage Members">
              <Users className="w-5 h-5" />
            </button>
            <button className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer" title="Workspace Settings">
              <Settings className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area (Projects will go here later) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-8"
      >
        <div className="border-b border-slate-800 pb-4 mb-6">
          <h2 className="text-xl font-semibold text-white">Projects</h2>
        </div>
        
        <div className="text-center py-12">
          <p className="text-slate-400 mb-4">No projects created yet in this workspace.</p>
          <button className="px-4 py-2 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors font-medium cursor-pointer">
            Create First Project
          </button>
        </div>
      </motion.div>

    </div>
  );
};
