import React, { Suspense, useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ErrorBoundary from '../UI/ErrorBoundary';
import PageSkeleton from '../UI/PageSkeleton';
import LiveAnalyticsDashboard from '../UI/LiveAnalyticsDashboard';

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="app-shell">
      <TopBar onMenuClick={openSidebar} />

      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <main className="main-content">
        <div className="page-scroll">
          <ErrorBoundary>
            <Suspense fallback={<PageSkeleton />}>
              <div className="route-stage">
                <LiveAnalyticsDashboard />
                <Outlet />
              </div>
            </Suspense>
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
