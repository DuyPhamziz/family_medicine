import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Users, AlertCircle } from 'lucide-react';

const RiskAnalysisDashboard = ({ data }) => {
  const [selectedRisk, setSelectedRisk] = useState('all');

  const riskDistribution = [
    { name: 'Low', value: 45, color: '#10b981' },
    { name: 'Medium', value: 30, color: '#f59e0b' },
    { name: 'High', value: 25, color: '#ef4444' },
  ];

  const trendData = [
    { month: 'Jan', low: 45, medium: 30, high: 25 },
    { month: 'Feb', low: 42, medium: 32, high: 26 },
    { month: 'Mar', low: 40, medium: 35, high: 25 },
    { month: 'Apr', low: 38, medium: 37, high: 25 },
    { month: 'May', low: 36, medium: 38, high: 26 },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Risk Analysis Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Low Risk</p>
              <p className="text-2xl font-bold text-green-600">45%</p>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Medium Risk</p>
              <p className="text-2xl font-bold text-yellow-600">30%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">High Risk</p>
              <p className="text-2xl font-bold text-red-600">25%</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Patients</p>
              <p className="text-2xl font-bold text-blue-600">1,240</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Trend (Last 5 Months)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="low" fill="#10b981" />
              <Bar dataKey="medium" fill="#f59e0b" />
              <Bar dataKey="high" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysisDashboard;
