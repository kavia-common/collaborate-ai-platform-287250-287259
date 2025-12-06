import React from 'react';

// PUBLIC_INTERFACE
const KPICard = ({ title, value, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
