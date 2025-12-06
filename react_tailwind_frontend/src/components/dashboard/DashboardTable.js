import React, { useMemo, useState } from 'react';

// PUBLIC_INTERFACE
const DashboardTable = ({ projects, events }) => {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filter, setFilter] = useState('');

  const data = useMemo(() => {
    const combined = [
      ...(projects || []).map(p => ({
        id: p.id,
        type: 'Project',
        name: p.title,
        status: p.status,
        date: p.startDate,
        details: p.description
      })),
      ...(events || []).map(e => ({
        id: e.id,
        type: 'Event',
        name: e.title,
        status: new Date(e.startTime) > new Date() ? 'Upcoming' : 'Past',
        date: e.startTime,
        details: e.location || 'Virtual'
      }))
    ];

    return combined
      .filter(item => 
         item.name.toLowerCase().includes(filter.toLowerCase()) || 
         item.type.toLowerCase().includes(filter.toLowerCase())
      )
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        
        // Handle dates
        if (sortField === 'date') {
            valA = new Date(valA || 0).getTime();
            valB = new Date(valB || 0).getTime();
        } else {
            valA = (valA || '').toString().toLowerCase();
            valB = (valB || '').toString().toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      })
      .slice(0, 10); // Show top 10 recent
  }, [projects, events, filter, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc'); // Default to desc for new field (esp date)
    }
  };

  const SortIcon = ({ field }) => {
      if (sortField !== field) return <span className="ml-1 text-gray-300">↕</span>;
      return <span className="ml-1 text-primary">{sortDirection === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        <input 
            type="text" 
            placeholder="Search activity..." 
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-64"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm">
              <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort('type')}>
                  Type <SortIcon field="type" />
              </th>
              <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort('name')}>
                  Name <SortIcon field="name" />
              </th>
              <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort('status')}>
                  Status <SortIcon field="status" />
              </th>
              <th className="p-4 font-medium cursor-pointer hover:bg-gray-100 transition" onClick={() => handleSort('date')}>
                  Date <SortIcon field="date" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length > 0 ? data.map((item) => (
              <tr key={`${item.type}-${item.id}`} className="hover:bg-blue-50/30 transition text-sm">
                <td className="p-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.type === 'Project' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.type}
                  </span>
                </td>
                <td className="p-4 font-medium text-gray-800">{item.name}</td>
                <td className="p-4">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        item.status.toLowerCase().includes('active') || item.status === 'Upcoming' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></span>
                    <span className="text-gray-600">{item.status}</span>
                </td>
                <td className="p-4 text-gray-500">
                    {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                </td>
              </tr>
            )) : (
              <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                      No matching records found.
                  </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardTable;
