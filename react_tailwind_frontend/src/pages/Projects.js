import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECTS, CREATE_PROJECT, DELETE_PROJECT } from '../graphql/projectOperations';

const Projects = () => {
  const { data, loading, error, refetch } = useQuery(GET_PROJECTS);
  const [createProject] = useMutation(CREATE_PROJECT, { onCompleted: refetch });
  const [deleteProject] = useMutation(DELETE_PROJECT, { onCompleted: refetch });

  const [newProject, setNewProject] = useState({ name: '', description: '', status: 'PLANNING' });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    createProject({ variables: newProject });
    setNewProject({ name: '', description: '', status: 'PLANNING' });
    setIsFormOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm('Are you sure you want to delete this project?')) {
      deleteProject({ variables: { id } });
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  if (error) return <div className="p-8 text-red-600 bg-red-50 rounded-lg">Error loading projects: {error.message}</div>;

  return (
    <>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Projects</h1>
            <p className="text-text-secondary text-sm">Manage and track your company projects</p>
          </div>
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition shadow-sm hover:shadow-md flex items-center gap-2"
          >
            {isFormOpen ? (
                <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Close
                </>
            ) : (
                <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Project
                </>
            )}
          </button>
        </div>

        {isFormOpen && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Project Name"
                className="w-full border p-2 rounded"
                value={newProject.name}
                onChange={e => setNewProject({...newProject, name: e.target.value})}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full border p-2 rounded"
                value={newProject.description}
                onChange={e => setNewProject({...newProject, description: e.target.value})}
              />
              <select
                className="w-full border p-2 rounded"
                value={newProject.status}
                onChange={e => setNewProject({...newProject, status: e.target.value})}
              >
                <option value="PLANNING">Planning</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
              <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Create Project</button>
            </form>
          </div>
        )}

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          {data.projects && data.projects.length > 0 ? (
            data.projects.map(project => (
              <div key={project.id} className="bg-surface p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-text">{project.name}</h3>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                    project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-text-secondary mb-4 text-sm line-clamp-2 h-10">{project.description || 'No description provided.'}</p>
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                   {/* Placeholder for Edit */}
                   <button className="text-primary hover:text-primary-700 text-sm font-medium transition-colors" onClick={() => alert('Edit feature coming soon')}>Edit</button>
                   <button 
                    onClick={() => handleDelete(project.id)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
                   >
                     Delete
                   </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-200">
                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-text">No projects</h3>
                <p className="mt-1 text-sm text-text-secondary">Get started by creating a new project.</p>
            </div>
          )}
        </div>
    </>
  );
};

export default Projects;
