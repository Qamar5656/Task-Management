import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Plus, LayoutTemplate, Users, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { workspaceService } from '../../services/workspace.service';

export const DashboardOverviewPage = () => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await workspaceService.getAll();
        setWorkspaces(data);
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-2xl font-bold text-white mb-1">
            Good morning, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-400 text-sm">
            Here's what's happening across your workspaces today.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
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
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Workspaces', value: workspaces.length.toString(), icon: LayoutTemplate, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
              { label: 'Active Projects', value: '0', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' }, // Placeholder until Projects API
              { label: 'Tasks Completed', value: '0', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }, // Placeholder until Tasks API
              { label: 'Upcoming Deadlines', value: '0', icon: Clock, color: 'text-orange-400', bg: 'bg-orange-500/10' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-[#1E293B]/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4 overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:-translate-y-1 cursor-pointer"
              >
                {/* Subtle inner hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-white mt-1 font-heading">{stat.value}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State vs Content */}
          {workspaces.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
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
            <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
              <p className="text-slate-400 text-sm">You have {workspaces.length} active workspaces. Select one from the sidebar to view projects!</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
