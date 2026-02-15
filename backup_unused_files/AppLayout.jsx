import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/ui/Navbar';
import Sidebar from '../components/ui/Sidebar';
import ErrorBoundary from '../components/ErrorBoundary';

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  React.useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    const onKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [sidebarOpen]);
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <div className="hidden md:block">
            <Sidebar />
          </div>
          
          <div className="flex-1 flex flex-col">
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
            
            <main className="flex-1 overflow-auto pt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <ErrorBoundary>
                  <Outlet />
                </ErrorBoundary>
              </div>
            </main>
          </div>
        </div>
        <div className={`fixed inset-0 z-50 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
          <div
            className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={`absolute left-0 top-0 h-full w-64 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <Sidebar />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AppLayout;
