import React, { useMemo } from 'react';

// PUBLIC_INTERFACE
const ProjectsByStatusChart = ({ projects }) => {
  const data = useMemo(() => {
    const counts = {};
    if (!projects) return [];
    
    projects.forEach(p => {
      const status = p.status || 'Unknown';
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([status, count]) => ({ status, count }));
  }, [projects]);

  const maxCount = Math.max(...data.map(d => d.count), 0) || 1;
  
  // Colors for different statuses
  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s.includes('active') || s.includes('progress')) return '#2563EB'; // Primary Blue
    if (s.includes('completed') || s.includes('done')) return '#10B981'; // Green
    if (s.includes('pending') || s.includes('plan')) return '#F59E0B'; // Amber
    return '#6B7280'; // Gray
  };

  if (data.length === 0) {
    return (
        <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-400 text-sm">No project data available</p>
        </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Projects by Status</h3>
      <div className="h-48 flex items-end space-x-4">
        {data.map((item, index) => {
           const heightPercent = (item.count / maxCount) * 100;
           return (
            <div key={item.status} className="flex-1 flex flex-col items-center group">
               <div className="relative w-full flex items-end justify-center">
                   <div 
                      className="w-full max-w-[40px] rounded-t-md transition-all duration-500 hover:opacity-80 relative"
                      style={{ 
                          height: `${heightPercent}%`, 
                          backgroundColor: getStatusColor(item.status),
                          minHeight: '4px'
                      }}
                   >
                     {/* Tooltip */}
                     <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap z-10">
                        {item.count} projects
                     </div>
                   </div>
               </div>
               <p className="text-xs text-gray-500 mt-2 font-medium truncate w-full text-center" title={item.status}>
                   {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
               </p>
            </div>
           );
        })}
      </div>
    </div>
  );
};

export default ProjectsByStatusChart;
