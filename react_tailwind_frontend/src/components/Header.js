import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// PUBLIC_INTERFACE
const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <header className="bg-surface shadow-sm border-b border-gray-100 h-16 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
            <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
            >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shadow-sm">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:block text-sm font-medium text-text-secondary">
                    {user?.username || 'User'}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
                <>
                    <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsProfileOpen(false)}
                        aria-hidden="true"
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 animate-fade-in-down">
                        <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-text">{user?.username}</p>
                            <p className="text-xs text-text-light truncate">{user?.email}</p>
                        </div>
                        <Link 
                            to="/dashboard" 
                            className="block px-4 py-2 text-sm text-text-secondary hover:bg-gray-50 hover:text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <button 
                            onClick={logout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
