import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Plus, LayoutTemplate, Users, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { workspaceService, type Workspace } from '../../services/workspace.service';
import { activityService, type ActivityLog } from '../../services/activity.service';
import { dashboardService, type DashboardStats } from '../../services/dashboard.service';

export const DashboardOverviewPage = () => {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [workspaceData, activityData, statsData] = await Promise.all([
          workspaceService.getAll(),
          activityService.getRecentActivities(20),
          dashboardService.getOverviewStats()
        ]);
        setWorkspaces(workspaceData);
        setActivities(activityData);
        setStats(statsData);
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-heading">
            Good morning, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
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
              { label: 'Total Workspaces', value: stats?.totalWorkspaces?.toString() || '0', icon: LayoutTemplate, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
              { label: 'Active Projects', value: stats?.activeProjects?.toString() || '0', icon: Users, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { label: 'Tasks Completed', value: stats?.tasksCompleted?.toString() || '0', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { label: 'Upcoming Deadlines', value: stats?.upcomingDeadlines?.toString() || '0', icon: Clock, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-white/70 dark:bg-[#1E293B]/40 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-3xl p-6 flex items-center gap-4 overflow-hidden transition-all duration-300 hover:border-indigo-400/50 dark:hover:border-indigo-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.05)] dark:hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] hover:-translate-y-1 cursor-pointer"
              >
                {/* Subtle inner hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-3xl" />
                
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} relative z-10 group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1 font-heading">{stat.value}</h3>
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
              className="flex-1 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 border-dashed rounded-3xl flex flex-col items-center justify-center text-center p-12 min-h-[300px]"
            >
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <LayoutTemplate className="w-10 h-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-heading">No active workspaces</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 text-lg">
                Get started by creating your first workspace to collaborate with your team and manage projects.
              </p>
              <Link to="/workspaces/create">
                <Button variant="secondary" className='cursor-pointer px-8'>
                  Create Workspace
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="flex-1 bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 font-heading">Recent Activity</h3>
              {activities.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-sm">No recent activity yet. Create some workspaces or projects to get started!</p>
              ) : (
                <div className="space-y-6">
                  {activities.map((activity, index) => (
                    <motion.div 
                      key={activity.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                          {activity.user?.name?.charAt(0).toUpperCase() || activity.user?.email.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-700 dark:text-slate-300">
                          <span className="font-semibold text-slate-900 dark:text-white">{activity.user?.name || activity.user?.email}</span>{' '}
                          <span className="text-slate-500 dark:text-slate-400">{activity.action.toLowerCase()}</span>{' '}
                          {activity.entityType.toLowerCase()}{' '}
                          <span className="font-medium text-slate-900 dark:text-white">"{activity.entityName}"</span>
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                          {new Date(activity.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
