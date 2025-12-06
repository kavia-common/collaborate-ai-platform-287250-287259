import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
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

  if (loading) return <div className="p-8">Loading projects...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading projects: {error.message}</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
       <aside className="w-64 bg-white shadow-md flex-shrink-0 hidden md:block">
        <div className="p-6 border-b">
           <Link to="/dashboard" className="text-xl font-bold text-blue-600">Collaborate AI</Link>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/dashboard" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Dashboard</Link>
          <Link to="/projects" className="block px-4 py-2 rounded bg-blue-50 text-blue-700 font-medium">Projects</Link>
          <Link to="/events" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Events</Link>
          <Link to="/messages" className="block px-4 py-2 rounded text-gray-600 hover:bg-gray-50">Messages</Link>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {isFormOpen ? 'Close Form' : 'New Project'}
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
              <div key={project.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    project.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                    project.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description || 'No description'}</p>
                <div className="flex justify-end gap-2">
                   {/* Placeholder for Edit */}
                   <button className="text-blue-600 text-sm hover:underline" onClick={() => alert('Edit feature coming soon')}>Edit</button>
                   <button 
                    onClick={() => handleDelete(project.id)}
                    className="text-red-600 text-sm hover:underline"
                   >
                     Delete
                   </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-2 text-center py-10">No projects found. Create one to get started.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
