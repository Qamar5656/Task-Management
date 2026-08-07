import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, LogIn } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-900 text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="z-10 text-center max-w-md transition-all duration-500">
        <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-400 to-purple-600 mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-slate-400 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <Button 
          variant="primary" 
          className="cursor-pointer inline-flex items-center justify-center"
          onClick={() => navigate('/')}
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
