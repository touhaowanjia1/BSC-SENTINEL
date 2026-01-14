
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: string;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, colorClass }) => {
  return (
    <div className="glass p-6 rounded-2xl flex items-start space-x-4 transition-all hover:scale-[1.02]">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-20`}>
        <i className={`fa-solid ${icon} text-xl ${colorClass.replace('bg-', 'text-')}`}></i>
      </div>
      <div>
        <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold mt-1 mono">{value}</h3>
        {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
      </div>
    </div>
  );
};

export default StatCard;
