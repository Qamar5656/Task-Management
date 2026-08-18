import React, { useEffect, useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { ActionMenu } from '../../../components/ui/ActionMenu';
import { type Task, TaskStatus, Priority, type TaskComment } from '../../../services/task.service';
import { commentService } from '../../../services/comment.service';
import { Clock, MessageSquare, Send, Trash2, Calendar, FolderKanban, Briefcase, ExternalLink, Edit2, Loader2, Tag, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { labelService, type Label } from '../../../services/label.service';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  showProjectLink?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

const statusConfig = {
  [TaskStatus.TODO]: { label: 'To Do', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  [TaskStatus.IN_PROGRESS]: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  [TaskStatus.IN_REVIEW]: { label: 'In Review', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  [TaskStatus.DONE]: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  [TaskStatus.BLOCKED]: { label: 'Blocked', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
};

const priorityColors = {
  [Priority.LOW]: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  [Priority.MEDIUM]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  [Priority.HIGH]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  [Priority.URGENT]: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const TaskDetailModal = ({ isOpen, onClose, task, showProjectLink = false, onEdit, onDelete }: TaskDetailModalProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [workspaceLabels, setWorkspaceLabels] = useState<Label[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAttachingLabel, setIsAttachingLabel] = useState(false);

  // If task has project.workspaceId or project.workspace.id, we can fetch labels
  const workspaceId = task?.project && ('workspaceId' in task.project) 
    ? (task.project as any).workspaceId 
    : task?.project?.workspace?.id;

  useEffect(() => {
    if (isOpen && task) {
      loadComments();
      if (workspaceId) {
        loadLabels();
      }
    } else {
      setComments([]);
      setNewComment('');
    }
  }, [isOpen, task]);

  const loadLabels = async () => {
    if (!workspaceId) return;
    try {
      const labels = await labelService.getByWorkspace(workspaceId);
      setWorkspaceLabels(labels);
    } catch (e) {
      console.error("Failed to load labels");
    }
  };

  const loadComments = async () => {
    if (!task) return;
    setIsLoading(true);
    try {
      const data = await commentService.getByTask(task.id);
      setComments(data);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;
    setIsSubmitting(true);
    try {
      const comment = await commentService.create(task.id, newComment.trim());
      // Append user info artificially since it's just created by current user
      const fullComment = {
        ...comment,
        user: { id: user?.id || '', name: user?.name || 'You', email: user?.email || '' }
      };
      setComments([fullComment, ...comments]);
      setNewComment('');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.delete(commentId);
      setComments(comments.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleAttachLabel = async (labelId: string) => {
    if (!task) return;
    setIsAttachingLabel(true);
    try {
      const updatedTask = await labelService.attachToTask(task.id, labelId);
      // We would ideally update the task in the parent component here, but for now we just show a toast
      // and let the parent refresh later if needed, or we could pass an `onTaskUpdate` prop.
      toast.success("Label attached! Please close and reopen to see changes.");
    } catch (error) {
      toast.error('Failed to attach label');
    } finally {
      setIsAttachingLabel(false);
    }
  };

  if (!task) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task.name} maxWidth="max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        {/* Left Column: Task Details */}
        <div className="lg:col-span-2 space-y-6 relative">
          
          {/* Action Menu (Top Right of Left Column) */}
          {(onEdit || onDelete) && (
            <div className="absolute top-0 right-0 z-10">
              <ActionMenu
                actions={[
                  ...(onEdit ? [{ label: 'Edit Task', icon: Edit2, onClick: () => { onClose(); onEdit(task); } }] : []),
                  ...(onDelete ? [{ label: 'Delete Task', icon: Trash2, variant: 'danger' as const, onClick: () => { onClose(); onDelete(task); } }] : [])
                ]}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 mb-4 pr-10">
             <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${statusConfig[task.status].color}`}>
                {statusConfig[task.status].label}
             </span>
             <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1.5 rounded-md ${priorityColors[task.priority]}`}>
                {task.priority} Priority
             </span>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Description</h4>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 min-h-[120px] text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap border border-slate-200 dark:border-slate-700/50 leading-relaxed">
              {task.description || <span className="italic opacity-70">No description provided.</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
            </div>
            
            {task.startDate && (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-green-500" />
                <span>Starts: {new Date(task.startDate).toLocaleDateString()}</span>
              </div>
            )}
            
            {task.dueDate && (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                <Calendar className="w-4 h-4 text-red-500" />
                <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}

            {task.estimate && (
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-orange-500" />
                <span>Estimate: {task.estimate}h</span>
              </div>
            )}

            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
              <UserIcon className="w-4 h-4 text-blue-500" />
              <span>Assignee: {task.user ? (task.user.name || task.user.email) : 'Unassigned'}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4" /> Labels
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {task.labels && task.labels.map(label => (
                <span 
                  key={label.id} 
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: `${label.color}20`, color: label.color }}
                >
                  {label.name}
                </span>
              ))}
              
              {workspaceLabels.length > 0 && (
                <select 
                  className="text-xs px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded cursor-pointer outline-none"
                  onChange={(e) => {
                    if(e.target.value) handleAttachLabel(e.target.value);
                    e.target.value = '';
                  }}
                  disabled={isAttachingLabel}
                  defaultValue=""
                >
                  <option value="" disabled>+ Attach Label</option>
                  {workspaceLabels.filter(l => !task.labels?.find(tl => tl.id === l.id)).map(label => (
                    <option key={label.id} value={label.id}>{label.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {showProjectLink && task.project && (
            <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800">
               <Link to={`/projects/${task.projectId}`} className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 cursor-pointer">
                 <FolderKanban className="w-4 h-4 mr-2" />
                 Open Project Board
                 <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-50" />
               </Link>
            </div>
          )}
        </div>

        {/* Right Column: Comments */}
        <div className="flex flex-col h-[500px] lg:h-auto border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 pt-6 lg:pt-0 lg:pl-8">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2 shrink-0">
            <MessageSquare className="w-4 h-4" />
            Activity & Comments
          </h4>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4 space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-indigo-500 w-6 h-6" />
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 text-sm py-8 bg-slate-50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/50">
                <MessageSquare className="w-8 h-8 mb-2 opacity-20" />
                No comments yet
              </div>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-700/30 group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
                        {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {comment.user?.name || 'Unknown User'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                      {comment.userId === user?.id && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap ml-8">
                    {comment.content}
                  </p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="mt-auto shrink-0 pt-2">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none min-h-[100px] custom-scrollbar"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment(e);
                  }
                }}
              />
              <div className="absolute bottom-3 right-3">
                <Button type="submit" variant="primary" disabled={isSubmitting || !newComment.trim()} className="!p-2 shadow-sm shadow-indigo-500/20 cursor-pointer">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 text-right mt-1.5 mr-1">Press Enter to send, Shift+Enter for new line</p>
          </form>
        </div>
      </div>
    </Modal>
  );
};
