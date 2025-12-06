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

  if (meLoading || companyLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <>
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text">Dashboard Overview</h2>
            <p className="text-text-secondary text-sm mt-1">Welcome back, <span className="font-semibold text-primary">{meData?.me?.username}</span></p>
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
                  className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-700 transition"
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
          <Link to="/projects" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/30 transition group">
            <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
            </div>
            <h4 className="text-text font-semibold mb-1 group-hover:text-primary transition-colors">Projects</h4>
            <p className="text-sm text-text-secondary">Manage ongoing work</p>
          </Link>
          <Link to="/events" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-secondary/30 transition group">
            <div className="bg-amber-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h4 className="text-text font-semibold mb-1 group-hover:text-secondary transition-colors">Events</h4>
            <p className="text-sm text-text-secondary">Upcoming schedules</p>
          </Link>
          <Link to="/messages" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-500/30 transition group">
            <div className="bg-green-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
               <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <h4 className="text-text font-semibold mb-1 group-hover:text-green-600 transition-colors">Messages</h4>
            <p className="text-sm text-text-secondary">Team communication</p>
          </Link>
        </div>
    </>
  );
};

export default Dashboard;
