import React from 'react';

const PROJECT_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS',
  ON_HOLD: 'ON_HOLD',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED'
};

const getStatusStyle = (status) => {
  switch (status) {
    case PROJECT_STATUS.COMPLETED: return 'bg-green-100 text-green-800 border-green-200';
    case PROJECT_STATUS.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border-blue-200';
    case PROJECT_STATUS.ON_HOLD: return 'bg-amber-100 text-amber-800 border-amber-200';
    case PROJECT_STATUS.ARCHIVED: return 'bg-gray-200 text-gray-700 border-gray-300';
    case PROJECT_STATUS.PLANNED:
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  if (status === 'PLANNING') return 'Planned';
  return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (dateVal) => {
  if (!dateVal) return '-';
  const d = new Date(Number(dateVal) || dateVal);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

// PUBLIC_INTERFACE
const ProjectCard = ({ project, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 flex flex-col group h-full">
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusStyle(project.status)}`}>
            {formatStatus(project.status)}
          </span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onEdit(project)}
              className="p-1.5 text-gray-400 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Project"
              aria-label="Edit Project"
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
            </button>
            <button 
              onClick={() => onDelete(project)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Project"
              aria-label="Delete Project"
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
  );
};

export default ProjectCard;
