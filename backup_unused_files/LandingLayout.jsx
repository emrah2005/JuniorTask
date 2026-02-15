import React from 'react';
import Navbar from '../components/ui/Navbar';
import ErrorBoundary from '../components/ErrorBoundary';

const LandingLayout = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          {children}
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default LandingLayout;
