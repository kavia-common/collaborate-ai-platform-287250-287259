import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECTS, CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT } from '../graphql/projectOperations';

const Projects = () => {
  const { data, loading, error, refetch } = useQuery(GET_PROJECTS, {
    notifyOnNetworkStatusChange: true,
  });

  const [createProject, { loading: creating }] = useMutation(CREATE_PROJECT, {
    onCompleted: () => {
      refetch();
      closeModal();
      showToast('Project created successfully!', 'success');
    },
    onError: (err) => showToast(err.message || 'Failed to create project', 'error')
  });

  const [updateProject, { loading: updating }] = useMutation(UPDATE_PROJECT, {
    onCompleted: () => {
      refetch();
      closeModal();
      showToast('Project updated successfully!', 'success');
    },
    onError: (err) => showToast(err.message || 'Failed to update project', 'error')
  });

  const [deleteProject, { loading: deleting }] = useMutation(DELETE_PROJECT, {
    onCompleted: () => {
      refetch();
      showToast('Project deleted successfully!', 'success');
    },
    onError: (err) => showToast(err.message || 'Failed to delete project', 'error')
  });

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState(null); // If null, we are creating
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'PLANNING',
    startDate: '',
    endDate: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [toast, setToast] = useState(null); // { message, type }

  // Clear toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const openCreateModal = () => {
    setCurrentProject(null);
    setFormData({
      title: '',
      description: '',
      status: 'PLANNING',
      startDate: '',
      endDate: ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Helper to safely parse date from string or number
  const safeDate = (val) => {
    if (!val) return null;
    const d = isNaN(Number(val)) ? new Date(val) : new Date(Number(val));
    return isNaN(d.getTime()) ? null : d;
  };

  const openEditModal = (project) => {
    setCurrentProject(project);
    const start = safeDate(project.startDate);
    const end = safeDate(project.endDate);

    setFormData({
      title: project.title,
      description: project.description || '',
      status: project.status,
      startDate: start ? start.toISOString().split('T')[0] : '',
      endDate: end ? end.toISOString().split('T')[0] : ''
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentProject(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Project title is required';
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        errors.endDate = 'End date cannot be before start date';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const inputData = {
      ...formData,
      // Ensure dates are strings or null if empty
      startDate: formData.startDate || null,
      endDate: formData.endDate || null
    };

    if (currentProject) {
      updateProject({ 
        variables: { 
          input: {
            id: currentProject.id, 
            ...inputData
          }
        } 
      });
    } else {
      createProject({ 
        variables: { 
          input: inputData 
        } 
      });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteProject({ variables: { id } });
    }
  };

  // Helper to format timestamps or date strings
  const formatDate = (dateVal) => {
    const date = safeDate(dateVal);
    if (!date) return '-';
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Helper for status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ON_HOLD': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PLANNING':
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded shadow-lg border-l-4 transition-all duration-300 transform translate-y-0 ${
          toast.type === 'error' ? 'bg-white border-red-500 text-red-700' : 'bg-white border-green-500 text-green-700'
        }`}>
          <div className="flex items-center gap-2">
            {toast.type === 'error' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text">Projects</h1>
          <p className="text-text-secondary text-sm">Manage, track, and collaborate on projects</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition shadow-sm hover:shadow-md flex items-center gap-2 group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Project
        </button>
      </div>

      {/* Loading State */}
      {loading && !data && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-6 text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center gap-3">
           <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <div>
             <h3 className="font-bold">Error loading projects</h3>
             <p className="text-sm">{error.message}</p>
             <button onClick={() => refetch()} className="text-red-700 underline text-sm mt-1 hover:text-red-900">Try Again</button>
           </div>
        </div>
      )}

      {/* Projects Grid */}
      {!loading && !error && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {data?.projects?.length > 0 ? (
            data.projects.map(project => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 flex flex-col group h-full">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyle(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => openEditModal(project)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Project"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(project.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Project"
                      >
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1" title={project.title}>{project.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 line-clamp-3 h-14">
                    {project.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-400 border-t pt-4 mt-auto">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>Start: {formatDate(project.startDate)}</span>
                    </div>
                    {project.endDate && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>Due: {formatDate(project.endDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white rounded-xl border border-dashed border-gray-200">
                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
                <p className="mt-1 text-gray-500 max-w-sm mx-auto mb-6">Create your first project to start tracking tasks and collaborating with your team.</p>
                <button 
                  onClick={openCreateModal}
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
                >
                  Create Project
                </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <>
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity"
            onClick={closeModal}
          ></div>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg pointer-events-auto transform transition-all animate-fade-in-up">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
                <h3 className="text-xl font-bold text-gray-900">
                  {currentProject ? 'Edit Project' : 'Create New Project'}
                </h3>
                <button 
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Title <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${formErrors.title ? 'border-red-500' : 'border-gray-200'}`}
                    placeholder="e.g. Website Redesign"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                  {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white"
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="ON_HOLD">On Hold</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  {/* Empty col for spacing or future field */}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${formErrors.endDate ? 'border-red-500' : 'border-gray-200'}`}
                      value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                    />
                     {formErrors.endDate && <p className="text-red-500 text-xs mt-1">{formErrors.endDate}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none h-24"
                    placeholder="Brief description of the project goals..."
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
                  <button 
                    type="button" 
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={creating || updating}
                    className="flex-1 px-4 py-2 text-white bg-primary hover:bg-primary-700 rounded-lg font-medium shadow-md shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {(creating || updating) && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    {currentProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Projects;
