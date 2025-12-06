import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { ME_QUERY } from '../graphql/authOperations';
import { GET_MY_COMPANY, CREATE_COMPANY } from '../graphql/companyOperations';

const Dashboard = () => {
  const { data: meData, loading: meLoading } = useQuery(ME_QUERY);
  const { data: companyData, loading: companyLoading, refetch: refetchCompany } = useQuery(GET_MY_COMPANY);
  
  const [createCompany] = useMutation(CREATE_COMPANY, {
    onCompleted: () => refetchCompany()
  });

  const [newCompany, setNewCompany] = useState({ name: '', description: '', industry: '' });
  const [showCompanyForm, setShowCompanyForm] = useState(false);

  const handleCreateCompany = (e) => {
    e.preventDefault();
    createCompany({ variables: newCompany });
    setShowCompanyForm(false);
  };

  if (meLoading || companyLoading) return <div className="p-8 text-center">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">Collaborate AI</h1>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/dashboard" className="block px-4 py-2 rounded bg-blue-50 text-blue-700 font-medium">Dashboard</Link>
          <Link to="/projects" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Projects</Link>
          <Link to="/events" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Events</Link>
          <Link to="/messages" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Messages</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <div className="text-gray-600">
            Welcome, <span className="font-semibold">{meData?.me?.username}</span>
          </div>
        </header>

        {/* Company Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Company Profile</h3>
          
          {companyData?.myCompany ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Company Name</p>
                  <p className="text-lg font-medium">{companyData.myCompany.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Industry</p>
                  <p className="text-lg font-medium">{companyData.myCompany.industry || 'Not specified'}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-gray-700">{companyData.myCompany.description || 'No description provided.'}</p>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">You are not associated with a company yet.</p>
              {!showCompanyForm ? (
                <button 
                  onClick={() => setShowCompanyForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Create Company
                </button>
              ) : (
                <form onSubmit={handleCreateCompany} className="max-w-lg space-y-4 bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700">Register New Company</h4>
                  <input
                    type="text"
                    placeholder="Company Name"
                    className="w-full border p-2 rounded"
                    value={newCompany.name}
                    onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Industry"
                    className="w-full border p-2 rounded"
                    value={newCompany.industry}
                    onChange={e => setNewCompany({...newCompany, industry: e.target.value})}
                  />
                  <textarea
                    placeholder="Description"
                    className="w-full border p-2 rounded"
                    value={newCompany.description}
                    onChange={e => setNewCompany({...newCompany, description: e.target.value})}
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Save</button>
                    <button type="button" onClick={() => setShowCompanyForm(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded">Cancel</button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Quick Stats / Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/projects" className="bg-blue-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition">
            <h4 className="text-blue-800 font-semibold mb-2">Projects</h4>
            <p className="text-sm text-blue-600">Manage ongoing work</p>
          </Link>
          <Link to="/events" className="bg-purple-50 p-6 rounded-xl border border-purple-100 hover:shadow-md transition">
            <h4 className="text-purple-800 font-semibold mb-2">Events</h4>
            <p className="text-sm text-purple-600">Upcoming schedules</p>
          </Link>
          <Link to="/messages" className="bg-green-50 p-6 rounded-xl border border-green-100 hover:shadow-md transition">
            <h4 className="text-green-800 font-semibold mb-2">Messages</h4>
            <p className="text-sm text-green-600">Team communication</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
