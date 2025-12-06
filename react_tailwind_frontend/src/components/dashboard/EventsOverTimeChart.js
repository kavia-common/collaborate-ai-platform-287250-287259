import React, { useMemo } from 'react';

// PUBLIC_INTERFACE
const EventsOverTimeChart = ({ events }) => {
  const data = useMemo(() => {
    if (!events || events.length === 0) return [];

    // Group by month for the last 6 months or upcoming
    // Actually, let's show upcoming events for next few months or recent past + future
    // Simple approach: Group by Month-Year
    const groups = {};
    events.forEach(e => {
        const date = new Date(e.startTime);
        const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        // Use a sortable key for ordering
        const sortKey = date.toISOString().slice(0, 7); // YYYY-MM
        if (!groups[sortKey]) {
            groups[sortKey] = { label: key, count: 0, sortKey };
        }
        groups[sortKey].count++;
    });

    // Sort by date
    const sorted = Object.values(groups).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    
    // Take last 6 points if too many, or just all if few
    return sorted.slice(-6); 
  }, [events]);

  const maxCount = Math.max(...data.map(d => d.count), 0) || 5; // Default max 5 if empty or 0

  // Chart dimensions
  const height = 150;
  const width = 100; // percent

  // Helper to get points for polyline
  const getPoints = () => {
      if (data.length < 2) return '';
      return data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (d.count / maxCount) * 100;
          return `${x},${y}`;
      }).join(' ');
  };

  if (data.length === 0) {
      return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Events Trends</h3>
            <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-400 text-sm">No event data available</p>
            </div>
        </div>
      );
  }

  const points = getPoints();

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Events Over Time</h3>
      <div className="h-48 relative">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
             {/* Grid lines */}
             <line x1="0" y1="0" x2="100" y2="0" stroke="#f3f4f6" strokeWidth="1" />
             <line x1="0" y1="50" x2="100" y2="50" stroke="#f3f4f6" strokeWidth="1" />
             <line x1="0" y1="100" x2="100" y2="100" stroke="#f3f4f6" strokeWidth="1" />
             
             {/* Area fill */}
             {data.length > 1 && (
                 <polygon 
                    points={`0,100 ${points} 100,100`} 
                    fill="url(#gradient)" 
                    opacity="0.2"
                 />
             )}
             
             {/* Line */}
             {data.length > 1 ? (
                 <polyline 
                    points={points} 
                    fill="none" 
                    stroke="#2563EB" 
                    strokeWidth="2" 
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                 />
             ) : (
                // Single point representation if only 1 data point
                <circle cx="50" cy={100 - (data[0].count / maxCount) * 100} r="2" fill="#2563EB" />
             )}

             {/* Gradient Def */}
             <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                </linearGradient>
             </defs>
          </svg>

          {/* X Axis Labels */}
          <div className="absolute bottom-0 left-0 right-0 translate-y-6 flex justify-between text-xs text-gray-400">
             {data.map((d, i) => (
                 <span key={d.sortKey} style={{ flex: 1, textAlign: i === 0 ? 'left' : i === data.length - 1 ? 'right' : 'center' }}>
                     {d.label}
                 </span>
             ))}
          </div>

           {/* Tooltips (Invisible overlay bars) */}
           <div className="absolute inset-0 flex items-end">
               {data.map((d, i) => (
                   <div key={d.sortKey} className="flex-1 h-full group relative cursor-pointer">
                       {/* Dot on hover */}
                       <div 
                         className="absolute w-3 h-3 bg-white border-2 border-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                         style={{ 
                             left: '50%', 
                             top: `${100 - (d.count / maxCount) * 100}%`,
                             transform: 'translate(-50%, -50%)' 
                         }}
                       />
                       {/* Tooltip */}
                       <div 
                         className="absolute bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap"
                         style={{ 
                            left: '50%', 
                            top: `${100 - (d.count / maxCount) * 100}%`,
                            transform: 'translate(-50%, -150%)' 
                        }}
                       >
                           {d.count} events
                       </div>
                   </div>
               ))}
           </div>
      </div>
      <div className="h-6"></div> {/* Spacer for labels */}
    </div>
  );
};

export default EventsOverTimeChart;
