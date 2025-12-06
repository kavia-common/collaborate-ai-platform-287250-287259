import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LOGIN_MUTATION } from '../graphql/authOperations';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  
  // Get redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      if (data.login && data.login.token) {
        authLogin(data.login.token);
        navigate(from, { replace: true });
      }
    },
    onError: (err) => {
      setError(err.message || 'Invalid email or password');
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
        setError('Please enter both email and password');
        return;
    }
    login({ variables: formData });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Login to your account</p>
        </div>

        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-red-700">{error}</p>
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">Email Address</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
                    placeholder="Enter your email" 
                />
            </div>
            <div>
                <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">Password</label>
                <input 
                    type="password" 
                    id="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors" 
                    placeholder="Enter your password" 
                />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 font-medium ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
                {loading ? 'Signing In...' : 'Sign In'}
            </button>
        </form>
        
        <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Sign up
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
