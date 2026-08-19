import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/user.service';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Settings, User, Shield, Moon, Loader2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  updateProfileSchema, type UpdateProfileInput, 
  updatePasswordSchema, type UpdatePasswordInput 
} from '../../validation/user.validation';

export const SettingsPage = () => {
  const { user, login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'account' | 'preferences'>('account');

  // Profile Form using react-hook-form
  const { 
    register: registerProfile, 
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileLoading } 
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: user?.name || '' }
  });

  // Password Form using react-hook-form
  const { 
    register: registerPassword, 
    handleSubmit: handlePasswordSubmit, 
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordLoading } 
  } = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema)
  });

  const onUpdateProfile = async (data: UpdateProfileInput) => {
    try {
      await userService.updateProfile({ name: data.name });
      if (user) {
        login(
          localStorage.getItem('token')!, 
          localStorage.getItem('refresh_token')!, 
          { ...user, name: data.name }
        );
      }
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onUpdatePassword = async (data: UpdatePasswordInput) => {
    try {
      await userService.updatePassword({ 
        currentPassword: data.currentPassword, 
        newPassword: data.newPassword 
      });
      toast.success('Password updated successfully');
      resetPasswordForm();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Header Area */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 shadow-inner">
            <Settings className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 font-heading">Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Manage your account details and app preferences.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800 mb-8 px-2">
        <button
          onClick={() => setActiveTab('account')}
          className={`pb-4 text-sm font-medium transition-colors relative cursor-pointer ${activeTab === 'account' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </div>
          {activeTab === 'account' && (
            <motion.div layoutId="settingsTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`pb-4 text-sm font-medium transition-colors relative cursor-pointer ${activeTab === 'preferences' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}`}
        >
          <div className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Preferences
          </div>
          {activeTab === 'preferences' && (
            <motion.div layoutId="settingsTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
          )}
        </button>
      </div>
 
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
        <div className="">
          {activeTab === 'account' ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              
              {/* Profile Section */}
              <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-indigo-500" />
                  Profile Information
                </h2>
                <form onSubmit={handleProfileSubmit(onUpdateProfile)} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                    <input 
                      type="text" 
                      value={user?.email || ''} 
                      disabled 
                      className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Your email address cannot be changed currently.</p>
                  </div>
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    {...registerProfile('name')}
                    error={profileErrors.name?.message}
                  />
                  <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="primary" disabled={isProfileLoading} className="cursor-pointer">
                      {isProfileLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Save Profile
                    </Button>
                  </div>
                </form>
              </div>

              {/* Password Section */}
              <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  Change Password
                </h2>
                <form onSubmit={handlePasswordSubmit(onUpdatePassword)} className="space-y-5">
                  <Input
                    label="Current Password"
                    type="password"
                    {...registerPassword('currentPassword')}
                    error={passwordErrors.currentPassword?.message}
                  />
                  <Input
                    label="New Password"
                    type="password"
                    {...registerPassword('newPassword')}
                    error={passwordErrors.newPassword?.message}
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    {...registerPassword('confirmPassword')}
                    error={passwordErrors.confirmPassword?.message}
                  />
                  <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="primary" disabled={isPasswordLoading} className="cursor-pointer">
                      {isPasswordLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Update Password
                    </Button>
                  </div>
                </form>
              </div>

            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              
              {/* Preferences Section */}
              <div className="bg-white/70 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <Moon className="w-5 h-5 text-indigo-500" />
                  Appearance
                </h2>
                
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                  <div>
                    <h3 className="font-medium text-slate-900 dark:text-white">Dark Mode</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Toggle dark mode interface.</p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${theme === 'dark' ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
