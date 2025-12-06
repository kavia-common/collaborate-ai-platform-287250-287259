import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import client from './apollo/client';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Router>
            <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* Example of how to protect future routes */}
                {/* <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} /> */}
              </Routes>
            </div>
        </Router>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
