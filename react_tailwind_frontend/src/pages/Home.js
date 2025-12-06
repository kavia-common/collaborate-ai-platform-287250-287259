import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-xl font-bold text-blue-600">Collaborate AI</div>
          <div>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-gray-700 hidden md:block">
                  Hello, <span className="font-semibold">{user.username || user.email}</span>
                </span>
                <button 
                  onClick={logout}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium px-3 py-2">Login</Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Smart Collaboration for <span className="text-blue-600">Modern Teams</span>
          </h1>
          <p className="mb-10 text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            A production-ready platform for company-based project and event collaboration with an integrated AI facilitator.
          </p>
          
          {user ? (
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 text-left">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="font-semibold text-lg text-blue-800 mb-2">Projects</h3>
                  <p className="text-gray-600 mb-4">Manage your ongoing projects and tasks.</p>
                  <button className="text-blue-600 font-medium hover:underline">View Projects &rarr;</button>
                </div>
                <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
                  <h3 className="font-semibold text-lg text-purple-800 mb-2">Events</h3>
                  <p className="text-gray-600 mb-4">Coordinate upcoming company events.</p>
                  <button className="text-purple-600 font-medium hover:underline">View Events &rarr;</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
                Get Started
              </Link>
              <Link to="/login" className="bg-white text-gray-700 border border-gray-300 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500">
          &copy; {new Date().getFullYear()} Collaborate AI Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;
