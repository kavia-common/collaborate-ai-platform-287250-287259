import React, { useState, useMemo } from 'react';
import ProjectCard from './ProjectCard';

// PUBLIC_INTERFACE
const ProjectList = ({ projects = [], onEdit, onDelete, onCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt'); // default sort
  const [sortOrder, setSortOrder] = useState('desc');

  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.title?.toLowerCase().includes(lower) || 
        p.description?.toLowerCase().includes(lower)
      );
    }

    // Sort
    result.sort((a, b) => {
      let valA, valB;

      switch(sortBy) {
        case 'title':
          valA = a.title || '';
          valB = b.title || '';
          break;
        case 'status':
          valA = a.status || '';
          valB = b.status || '';
          break;
        case 'startDate':
          valA = new Date(Number(a.startDate) || a.startDate || 0).getTime();
          valB = new Date(Number(b.startDate) || b.startDate || 0).getTime();
          break;
        case 'endDate':
            valA = new Date(Number(a.endDate) || a.endDate || 0).getTime();
            valB = new Date(Number(b.endDate) || b.endDate || 0).getTime();
            break;
        default: // createdAt/updatedAt assumed available or fallback
          // Assuming higher ID is newer if no dates, or purely based on backend order which we can't easily replicate unless we have fields.
          // Using ID as proxy for creation time if no other fields
          valA = Number(a.id);
          valB = Number(b.id);
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [projects, searchTerm, sortBy, sortOrder]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
          <select
            className="block w-full sm:w-auto pl-3 pr-8 py-2 border border-gray-200 rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="updatedAt">Newest</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
            <option value="startDate">Start Date</option>
            <option value="endDate">Due Date</option>
          </select>
          <button 
            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 text-gray-500 hover:text-primary transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h5m4 0v12m0 0l-4-4m4 4l4-4" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-xl border border-dashed border-gray-200">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
            <p className="mt-1 text-gray-500 max-w-sm mx-auto mb-6">
              {searchTerm ? `No projects match "${searchTerm}"` : "Create your first project to start tracking tasks."}
            </p>
            {!searchTerm && (
              <button 
                onClick={onCreate}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition"
              >
                Create Project
              </button>
            )}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
