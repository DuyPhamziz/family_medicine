import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavigation from '../navigation/TopNavigation';

/**
 * Main authenticated layout with top navigation
 * Used for dashboard, forms, analysis, etc.
 */
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopNavigation />
      
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
