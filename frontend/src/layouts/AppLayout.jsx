import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Sidebar from '../components/ui/Sidebar';
import ErrorBoundary from '../components/ErrorBoundary';

const AppLayout = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Top Navigation */}
            <Navbar />
            
            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ErrorBoundary>
                  <Outlet />
                </ErrorBoundary>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AppLayout;
