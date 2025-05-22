import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap as Graduation, User, LogOut, LogIn, Coins } from 'lucide-react';
import { useAuthStore } from '../store/auth';

const Navbar: React.FC = () => {
  const { user, tokens, signOut } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-blue-800 font-semibold text-xl">
          <Graduation className="h-6 w-6" />
          <span>CheckSup</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-blue-600 font-medium">
                <Coins className="h-5 w-5" />
                <span>{tokens} tokens</span>
              </div>
              
              <Link 
                to="/tokens" 
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                Acheter des tokens
              </Link>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Connexion</span>
              </Link>
              
              <Link 
                to="/signup" 
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Inscription</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar