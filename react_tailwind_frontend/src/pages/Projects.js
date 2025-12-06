import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECTS, CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT } from '../graphql/projectOperations';
import ProjectList from '../components/projects/ProjectList';
import ProjectForm from '../components/projects/ProjectForm';
import ConfirmDialog from '../components/common/ConfirmDialog';

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
      setProjectToDelete(null);
      showToast('Project deleted successfully!', 'success');
    },
    onError: (err) => showToast(err.message || 'Failed to delete project', 'error')
  });

  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [toast, setToast] = useState(null);

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

  const handleCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (project) => {
    setProjectToDelete(project);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProject({ variables: { id: projectToDelete.id } });
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

  const handleFormSubmit = (formData) => {
    const inputData = {
      title: formData.title,
      description: formData.description,
      status: formData.status,
      startDate: formData.startDate || null,
      endDate: formData.endDate || null
    };

    if (editingProject) {
      updateProject({ 
        variables: { 
          input: {
            id: editingProject.id, 
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
          onClick={handleCreate}
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

      {/* Projects List */}
      {!loading && !error && (
        <ProjectList 
          projects={data?.getProjects || []} 
          onEdit={handleEdit} 
          onDelete={handleDeleteClick}
          onCreate={handleCreate}
        />
      )}

      {/* Create/Edit Modal */}
      <ProjectForm 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSubmit={handleFormSubmit} 
        initialData={editingProject}
        isSubmitting={creating || updating}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={!!projectToDelete} 
        onClose={() => setProjectToDelete(null)} 
        onConfirm={confirmDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.title}"? This action cannot be undone.`}
        isDeleting={true}
      />
    </div>
  );
};

export default Projects;
