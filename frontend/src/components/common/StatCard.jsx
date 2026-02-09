import React from "react";

const StatCard = ({ title, value, color, icon }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className={`text-2xl font-bold mt-1 ${color}`}>{value}</h3>
    </div>
    <div className="text-2xl bg-slate-50 w-12 h-12 flex items-center justify-center rounded-xl">
      {icon}
    </div>
  </div>
);

export default StatCard;
