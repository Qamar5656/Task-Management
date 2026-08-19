import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { api } from '../../services/api';
import { resetPasswordSchema, type ResetPasswordInput } from '../../validation/auth.validation';

export const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' }
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) return toast.error('Reset token is missing');

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { 
        resetToken: token, 
        newPassword: data.newPassword 
      });
      toast.success('Password changed successfully! You can now log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 dark:bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/70 dark:bg-slate-800/40 backdrop-blur-xl border border-white dark:border-white/10 rounded-2xl p-8 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 mb-4 shadow-lg shadow-indigo-500/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Create New Password
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Please enter your new strong password.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.newPassword?.message}
              {...register('newPassword')}
            />
            
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="••••••••"
              icon={Lock}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            
            <p className="text-xs text-slate-500 mt-1 ml-1">
              Must contain 1 uppercase, 1 lowercase, 1 number, and 1 special char.
            </p>

            <div className="pt-2">
              <Button type="submit" isLoading={isLoading} variant="primary" className='cursor-pointer'>
                Reset Password
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
