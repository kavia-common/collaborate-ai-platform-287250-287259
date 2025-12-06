import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '../common/Skeleton';

// PUBLIC_INTERFACE
const ProjectsByStatusChart = ({ projects, loading = false }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Colors for different statuses
  const statusConfig = {
      'active': { color: '#2563EB', label: 'Active', className: 'bg-blue-600' },
      'in_progress': { color: '#2563EB', label: 'In Progress', className: 'bg-blue-600' },
      'completed': { color: '#10B981', label: 'Completed', className: 'bg-green-500' },
      'done': { color: '#10B981', label: 'Done', className: 'bg-green-500' },
      'pending': { color: '#F59E0B', label: 'Pending', className: 'bg-amber-500' },
      'planning': { color: '#F59E0B', label: 'Planning', className: 'bg-amber-500' },
      'archived': { color: '#6B7280', label: 'Archived', className: 'bg-gray-500' },
      'default': { color: '#6B7280', label: 'Other', className: 'bg-gray-500' }
  };

  const getStatusConfig = (status) => {
      const s = (status || '').toLowerCase().replace(' ', '_');
      return statusConfig[s] || Object.values(statusConfig).find(c => s.includes(c.label.toLowerCase())) || statusConfig.default;
  };

  const data = useMemo(() => {
    const counts = {};
    if (!projects) return [];
    
    projects.forEach(p => {
      const status = p.status || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({ 
        status, 
        count,
        config: getStatusConfig(status)
    })).sort((a, b) => b.count - a.count); // Sort by count desc
  }, [projects]);

  const maxCount = Math.max(...data.map(d => d.count), 0) || 1;

  if (loading) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[300px] flex flex-col">
           <Skeleton className="h-6 w-48 mb-6" />
           <div className="flex-1 flex items-end space-x-6 px-4">
              {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                     <Skeleton className="w-full rounded-t-md opacity-50" style={{ height: `${Math.random() * 50 + 30}%`}} />
                     <Skeleton className="h-3 w-12" />
                  </div>
              ))}
           </div>
        </div>
      );
  }

  if (data.length === 0) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[300px] flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Projects by Status</h3>
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
                <p className="text-sm font-medium">No projects found</p>
                <Link to="/projects" className="text-primary text-xs font-semibold mt-2 hover:underline">
                    Create Project
                </Link>
            </div>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[300px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">Projects by Status</h3>
      
      <div className="flex-1 relative">
         <div className="absolute inset-0 flex items-end justify-between space-x-4">
            {/* Grid Lines */}
            <div className="absolute inset-0 w-full h-full pointer-events-none flex flex-col justify-between z-0">
                <div className="border-t border-gray-100 w-full"></div>
                <div className="border-t border-gray-100 w-full"></div>
                <div className="border-t border-gray-100 w-full"></div>
                <div className="border-t border-gray-100 w-full"></div>
                <div className="border-t border-gray-100 w-full"></div>
            </div>

            {data.map((item, index) => {
                const heightPercent = (item.count / maxCount) * 100;
                const isHovered = hoveredIndex === index;
                
                return (
                    <div 
                        key={item.status} 
                        className="flex-1 h-full flex flex-col items-center justify-end relative group z-10"
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        {/* Bar */}
                        <div className="relative w-full max-w-[50px] flex items-end h-full">
                            <button
                                className={`w-full rounded-t-md transition-all duration-300 relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isHovered ? 'opacity-100 scale-105 shadow-md' : 'opacity-80'}`}
                                style={{ 
                                    height: `${heightPercent}%`, 
                                    backgroundColor: item.config.color,
                                    minHeight: '4px'
                                }}
                                aria-label={`${item.status}: ${item.count} projects`}
                            >
                            </button>
                            
                            {/* Tooltip */}
                            {isHovered && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs py-1.5 px-3 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none">
                                    <div className="font-semibold">{item.count} Projects</div>
                                    <div className="text-gray-400 text-[10px] capitalize">{item.status}</div>
                                    {/* Arrow */}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                </div>
                            )}
                        </div>

                        {/* X-Axis Label */}
                        <p className={`text-[11px] font-medium mt-3 truncate w-full text-center transition-colors ${isHovered ? 'text-gray-800' : 'text-gray-500'}`} title={item.status}>
                            {item.status.length > 10 ? item.status.slice(0, 8) + '...' : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </p>
                    </div>
                );
            })}
         </div>
      </div>
    </div>
  );
};

export default ProjectsByStatusChart;
