import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-primary">
      {/* Top Enterprise Application Header */}
      <Header />

      {/* Main Workspace Layout with Sidebar and Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Enterprise Left Navigation with strictly one item */}
        <Sidebar />

        {/* Scrollable Main Application Content */}
        <main className="flex-1 overflow-y-auto bg-canvas">
          <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
