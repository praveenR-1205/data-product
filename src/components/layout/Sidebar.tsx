import React from 'react';
import { NavLink } from 'react-router-dom';
import { CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../app/providers';

export const Sidebar: React.FC = () => {
  const { isSidebarCollapsed, toggleSidebar } = useApp();

  return (
    <aside
      className={`bg-[#101828] text-white flex flex-col transition-all duration-200 ease-in-out border-r border-[#172033] select-none shrink-0 ${
        isSidebarCollapsed ? 'w-18' : 'w-64'
      }`}
      aria-label="Application sidebar"
    >
      {/* Sidebar Header with Collapse Button */}
      <div className={`h-14 flex items-center border-b border-[#1E293B] ${isSidebarCollapsed ? 'justify-center px-2' : 'justify-end px-4'}`}>
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation section containing ONLY ONE business navigation item */}
      <div className="flex-1 py-4 px-2">
        <nav className="space-y-1">
          <NavLink
            to="/test-runs"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-[#FF6600] text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-[#1E293B]'
              } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-md shrink-0 ${
                    isActive ? 'bg-black/15 text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                >
                  <CheckSquare size={18} />
                </div>
                {!isSidebarCollapsed && (
                  <span className="truncate tracking-tight">Ingestion E2E Testing</span>
                )}
                {isSidebarCollapsed && isActive && (
                  <span className="sr-only">Active</span>
                )}
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};
