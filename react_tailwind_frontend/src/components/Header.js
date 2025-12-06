import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';

// Icons
const MenuIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BellIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const LogoIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// Breadcrumbs Component
const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const routeNameMap = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    events: 'Events',
    messages: 'Messages',
    chat: 'AI Chat',
    profile: 'Profile',
    settings: 'Settings',
  };

  return (
    <nav className="hidden md:flex items-center text-sm font-medium text-gray-500">
      <Link to="/" className="hover:text-primary transition-colors">Home</Link>
      {pathnames.length > 0 && (
        <>
          <span className="mx-2 text-gray-400">/</span>
          {pathnames.map((name, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            const displayName = routeNameMap[name.toLowerCase()] || name.charAt(0).toUpperCase() + name.slice(1);

            return isLast ? (
              <span key={name} className="text-gray-800 font-semibold">{displayName}</span>
            ) : (
              <React.Fragment key={name}>
                <Link to={routeTo} className="hover:text-primary transition-colors">{displayName}</Link>
                <span className="mx-2 text-gray-400">/</span>
              </React.Fragment>
            );
          })}
        </>
      )}
    </nav>
  );
};

// PUBLIC_INTERFACE
const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('#profile-menu')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  return (
    <header className="bg-gradient-to-r from-blue-50 to-gray-50 border-b border-blue-100/50 h-16 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40 shadow-sm transition-all duration-300">
      
      {/* Left Section: Mobile Menu & Brand */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-white hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
          aria-label="Open sidebar"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        
        <Link to="/" className="flex items-center gap-2 group">
           <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
             <LogoIcon className="w-5 h-5 text-primary" />
           </div>
           <span className="text-lg font-bold text-gray-800 tracking-tight hidden sm:block">
             Collaborate<span className="text-primary">AI</span>
           </span>
        </Link>
      </div>

      {/* Center Section: Breadcrumbs */}
      <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
        <Breadcrumbs />
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        
        {/* Search Bar */}
        <div className={`relative hidden sm:block transition-all duration-300 ${isSearchFocused ? 'w-64' : 'w-48'}`}>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className={`h-4 w-4 ${isSearchFocused ? 'text-primary' : 'text-gray-400'}`} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-1.5 border border-transparent rounded-full leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-200 sm:text-sm transition-all shadow-sm"
            placeholder="Search..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
        </div>

        {/* Search Icon (Mobile) */}
        <button className="sm:hidden p-2 rounded-full text-gray-500 hover:bg-white hover:text-primary transition-colors">
          <SearchIcon className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-full text-gray-500 hover:bg-white hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
          <BellIcon className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

        {/* Profile Dropdown */}
        <div className="relative" id="profile-menu">
            <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-white transition-all focus:outline-none focus:ring-2 focus:ring-primary/50 border border-transparent hover:border-gray-100 hover:shadow-sm"
                aria-expanded={isProfileOpen}
                aria-haspopup="true"
            >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-blue-400 text-white flex items-center justify-center font-bold shadow-sm ring-2 ring-white">
                    {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:flex flex-col items-start">
                    <span className="text-xs font-semibold text-gray-700 leading-none">
                        {user?.username || 'User'}
                    </span>
                    <span className="text-[10px] text-gray-400 leading-none mt-0.5">Admin</span>
                </div>
                <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform duration-200 hidden md:block ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg ring-1 ring-black ring-opacity-5 py-1 z-50 transform origin-top-right animate-in fade-in zoom-in duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50 rounded-t-xl">
                        <p className="text-sm font-semibold text-gray-800">{user?.username || 'Guest User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || 'guest@example.com'}</p>
                    </div>
                    
                    <div className="py-1">
                        <Link 
                            to="/profile" 
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                        >
                            Your Profile
                        </Link>
                        <Link 
                            to="/settings" 
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                        >
                            Settings
                        </Link>
                    </div>
                    
                    <div className="border-t border-gray-100 py-1">
                        <button 
                            onClick={logout}
                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
