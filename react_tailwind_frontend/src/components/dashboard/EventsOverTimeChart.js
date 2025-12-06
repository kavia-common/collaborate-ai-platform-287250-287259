import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Skeleton from '../common/Skeleton';

// PUBLIC_INTERFACE
const EventsOverTimeChart = ({ events, loading = false }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [visibleSeries, setVisibleSeries] = useState({ total: true });

  const data = useMemo(() => {
    if (!events || events.length === 0) return [];

    // Group by Month-Year for last 6 months or surrounding current date
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

    // Fill in missing months to make the chart look better if we have gaps? 
    // For now, let's just sort existing data points.
    const sorted = Object.values(groups).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    
    // Take last 6 points
    return sorted.slice(-6); 
  }, [events]);

  const maxCount = Math.max(...data.map(d => d.count), 0) || 5;
  const chartHeight = 100;

  // Helper to get points for polyline
  const getPoints = () => {
      if (data.length < 2) return '';
      return data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (d.count / maxCount) * 100;
          return `${x},${y}`;
      }).join(' ');
  };

  const toggleSeries = (series) => {
    setVisibleSeries(prev => ({ ...prev, [series]: !prev[series] }));
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[300px] flex flex-col">
         <Skeleton className="h-6 w-48 mb-6" />
         <div className="flex-1 flex items-end justify-between space-x-2">
            {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className={`w-full rounded-t-lg opacity-50`} style={{ height: `${Math.random() * 60 + 20}%`}} />
            ))}
         </div>
      </div>
    );
  }

  if (data.length === 0) {
      return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[300px] flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Events Over Time</h3>
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium">No events found</p>
                <Link to="/events" className="text-primary text-xs font-semibold mt-2 hover:underline">
                    Create Event
                </Link>
            </div>
        </div>
      );
  }

  const points = getPoints();
  const showLine = visibleSeries.total;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[300px] flex flex-col relative">
      <div className="flex justify-between items-start mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Events Over Time</h3>
          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs">
              <button 
                onClick={() => toggleSeries('total')}
                className={`flex items-center space-x-2 transition-opacity ${!showLine ? 'opacity-50' : 'opacity-100'}`}
                aria-label="Toggle Total Events series"
              >
                  <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                  <span className="text-gray-600 font-medium">Total Events</span>
              </button>
          </div>
      </div>

      <div className="flex-1 relative pb-6 px-2">
          {/* Chart Area */}
          <div className="absolute inset-0 bottom-6">
            <svg 
                className="w-full h-full overflow-visible" 
                preserveAspectRatio="none" 
                viewBox="0 0 100 100"
                aria-label="Line chart showing events over time"
            >
                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                    <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#f3f4f6" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                ))}

                {showLine && (
                    <>
                        {/* Area fill */}
                        {data.length > 1 && (
                            <polygon 
                                points={`0,100 ${points} 100,100`} 
                                fill="url(#gradient-events)" 
                                opacity="0.1"
                            />
                        )}
                        
                        {/* Line */}
                        {data.length > 1 ? (
                            <polyline 
                                points={points} 
                                fill="none" 
                                stroke="#2563EB" 
                                strokeWidth="3" 
                                vectorEffect="non-scaling-stroke"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        ) : (
                            // Single point representation if only 1 data point
                            <circle cx="50" cy={100 - (data[0].count / maxCount) * 100} r="1.5" fill="#2563EB" />
                        )}
                    </>
                )}

                <defs>
                    <linearGradient id="gradient-events" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Interaction Layer (Points & Tooltips) */}
            {showLine && (
                <div className="absolute inset-0">
                    {data.map((d, i) => {
                        const x = (i / (data.length - 1)) * 100;
                        const y = 100 - (d.count / maxCount) * 100;
                        const isHovered = hoveredPoint === i;

                        return (
                            <div 
                                key={d.sortKey}
                                className="absolute group"
                                style={{ 
                                    left: `${x}%`, 
                                    top: `${y}%`,
                                    width: '1px', 
                                    height: '1px'
                                }}
                            >
                                {/* Hit Area - larger than visible dot */}
                                <div 
                                    className="absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 cursor-pointer z-10"
                                    onMouseEnter={() => setHoveredPoint(i)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                    onFocus={() => setHoveredPoint(i)}
                                    onBlur={() => setHoveredPoint(null)}
                                    tabIndex="0"
                                    role="button"
                                    aria-label={`${d.label}: ${d.count} events`}
                                ></div>

                                {/* Visible Dot */}
                                <div 
                                    className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm transition-all duration-200 pointer-events-none ${isHovered ? 'w-4 h-4 bg-primary ring-4 ring-primary/20 z-20' : 'w-2.5 h-2.5 bg-primary z-0'}`}
                                ></div>

                                {/* Tooltip */}
                                {isHovered && (
                                    <div 
                                        id={`tooltip-${i}`}
                                        className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1.5 px-3 rounded shadow-lg whitespace-nowrap z-50 pointer-events-none"
                                        role="tooltip"
                                    >
                                        <div className="font-semibold">{d.count} Events</div>
                                        <div className="text-gray-400 text-[10px]">{d.label}</div>
                                        {/* Arrow */}
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
          </div>

          {/* X Axis Labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[11px] font-medium text-gray-400 px-2 pointer-events-none">
             {data.map((d, i) => (
                 <span key={d.sortKey} style={{ transform: 'translateX(0)' }}>
                     {d.label}
                 </span>
             ))}
          </div>
      </div>
    </div>
  );
};

export default EventsOverTimeChart;
