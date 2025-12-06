import React from 'react';

const Login = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h2>
        <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-4">
                <label className="block text-gray-700 mb-2 font-medium" htmlFor="email">Email</label>
                <input type="email" id="email" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your email" />
            </div>
            <div className="mb-6">
                <label className="block text-gray-700 mb-2 font-medium" htmlFor="password">Password</label>
                <input type="password" id="password" className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter your password" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200">Sign In</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
