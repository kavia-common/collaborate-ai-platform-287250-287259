import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

// PUBLIC_INTERFACE
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden bg-gradient-to-br from-blue-500/5 to-gray-50">
           <div className="max-w-7xl mx-auto w-full animate-fade-in">
             {children}
           </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
