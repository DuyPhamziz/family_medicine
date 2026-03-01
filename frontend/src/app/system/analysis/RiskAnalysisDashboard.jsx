import React, { Suspense } from 'react';
import { Activity, TrendingUp, Users, AlertCircle } from 'lucide-react';

const RiskAnalysisCharts = React.lazy(() => import('./RiskAnalysisCharts'));

const RiskAnalysisDashboard = ({ data }) => {
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

      <Suspense
        fallback={
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg h-[340px] animate-pulse" />
            <div className="bg-gray-50 p-4 rounded-lg h-[340px] animate-pulse" />
          </div>
        }
      >
        <RiskAnalysisCharts riskDistribution={riskDistribution} trendData={trendData} />
      </Suspense>
    </div>
  );
};

export default RiskAnalysisDashboard;
