import React, { useState, useEffect } from 'react';

const PROJECT_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
};

// PUBLIC_INTERFACE
const ProjectForm = ({ isOpen, onClose, onSubmit, initialData = null, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: PROJECT_STATUS.PLANNED,
    startDate: '',
    endDate: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const safeDate = (val) => {
        if (!val) return null;
        const d = isNaN(Number(val)) ? new Date(val) : new Date(Number(val));
        return isNaN(d.getTime()) ? null : d;
      };

      const start = safeDate(initialData.startDate);
      const end = safeDate(initialData.endDate);

      // Normalize status
      let status = initialData.status;
      if (status === 'PLANNING') status = PROJECT_STATUS.PLANNED;
      if (status === 'planning') status = PROJECT_STATUS.PLANNED;
      if (status === 'active') status = PROJECT_STATUS.IN_PROGRESS;
      if (status === 'completed') status = PROJECT_STATUS.COMPLETED;
      if (status === 'on_hold') status = PROJECT_STATUS.ON_HOLD;
      if (status === 'archived') status = PROJECT_STATUS.ARCHIVED;

      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        status: status || PROJECT_STATUS.PLANNED,
        startDate: start ? start.toISOString().split('T')[0] : '',
        endDate: end ? end.toISOString().split('T')[0] : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: PROJECT_STATUS.PLANNED,
        startDate: '',
        endDate: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) < new Date(formData.startDate)) {
        newErrors.endDate = 'End date cannot be before start date';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-lg pointer-events-auto transform transition-all animate-fade-in-up">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
            <h3 className="text-xl font-bold text-gray-900">
              {initialData ? 'Edit Project' : 'Create New Project'}
            </h3>
            <button 
              onClick={onClose}
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${errors.title ? 'border-red-500' : 'border-gray-200'}`}
                placeholder="e.g. Website Redesign"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-white ${errors.status ? 'border-red-500' : 'border-gray-200'}`}
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value={PROJECT_STATUS.PLANNED}>Planned</option>
                  <option value={PROJECT_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={PROJECT_STATUS.ON_HOLD}>On Hold</option>
                  <option value={PROJECT_STATUS.COMPLETED}>Completed</option>
                  <option value={PROJECT_STATUS.ARCHIVED}>Archived</option>
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${errors.endDate ? 'border-red-500' : 'border-gray-200'}`}
                  value={formData.endDate}
                  onChange={e => setFormData({...formData, endDate: e.target.value})}
                />
                 {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
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
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-white bg-primary hover:bg-primary-700 rounded-lg font-medium shadow-md shadow-blue-500/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                {initialData ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProjectForm;
