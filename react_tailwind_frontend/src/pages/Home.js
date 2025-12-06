import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4 text-blue-600">Welcome to Collaborate AI</h1>
      <p className="mb-4 text-lg">Platform for company-based project and event collaboration.</p>
      <div className="flex gap-4">
        <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Login</Link>
      </div>
    </div>
  );
};

export default Home;
