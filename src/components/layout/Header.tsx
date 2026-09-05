import React, { useState } from 'react';
import { ChevronDown, Check, LogOut } from 'lucide-react';
import { useApp } from '../../app/providers';
import { ENVIRONMENTS } from '../../utils/constants';
import { Environment } from '../../types/testRun';

export const Header: React.FC = () => {
  const { environment, setEnvironment } = useApp();

  const [isEnvDropdownOpen, setIsEnvDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const getHeaderEnvBadge = (env: string) => {
    switch (env) {
      case 'PROD':
        return 'bg-red-100 text-red-700 border border-red-200 font-extrabold';
      case 'PREPROD':
        return 'bg-amber-100 text-amber-800 border border-amber-200 font-extrabold';
      case 'DEV':
      default:
        return 'bg-sky-100 text-blue-700 border border-blue-200 font-extrabold';
    }
  };

  return (
    <header className="h-14 bg-[#FF6600] text-white sticky top-0 z-30 flex items-center justify-between px-6 shadow-md select-none">
      {/* Left: easyJet Brand Banner & App Name */}
      <div className="flex items-center space-x-3">
        {/* Brand Text */}
        <span className="font-extrabold text-2xl tracking-tighter text-white font-sans select-none">
          easyJet
        </span>
        <span className="h-5 w-px bg-white/30 hidden sm:inline-block" />
        <h1 className="font-bold text-base text-white tracking-tight leading-none">
          Data Ingestion Hub
        </h1>
      </div>

      {/* Right Actions: Environment Selector & User Profile */}
      <div className="flex items-center space-x-3">
        {/* Environment Selector with Translucent Container & Light Color Badges */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsEnvDropdownOpen(!isEnvDropdownOpen)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-white/40 bg-white/10 hover:bg-white/20 transition-all text-xs font-semibold text-white shadow-xs backdrop-blur-xs"
            aria-label="Select environment"
            aria-expanded={isEnvDropdownOpen}
          >
            <span className="text-white text-xs font-semibold tracking-wide">Environment:</span>
            <span className={`px-2.5 py-0.5 rounded-md text-xs uppercase ${getHeaderEnvBadge(environment)}`}>
              {environment}
            </span>
            <ChevronDown size={14} className="text-white/90 ml-0.5" />
          </button>

          {isEnvDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-lg bg-white shadow-xl border border-border-subtle py-1 z-40 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Switch Environment
              </div>
              {ENVIRONMENTS.map((env: Environment) => {
                const badgeStyle = getHeaderEnvBadge(env);
                const isCurrent = env === environment;
                return (
                  <button
                    key={env}
                    type="button"
                    onClick={() => {
                      setEnvironment(env);
                      setIsEnvDropdownOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${badgeStyle}`}>
                        {env}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {env === 'PROD' ? 'Production' : env === 'PREPROD' ? 'Pre-Production' : 'Development'}
                      </span>
                    </div>
                    {isCurrent && <Check size={14} className="text-[#FF6600]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-white/30" />

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-md hover:bg-white/15 transition-colors text-left"
            aria-label="User profile"
            aria-expanded={isUserMenuOpen}
          >
            <div className="w-8 h-8 rounded-full bg-[#101828] text-white flex items-center justify-center font-bold text-xs shadow-xs ring-2 ring-white/40">
              PR
            </div>
            <div className="hidden lg:block text-white">
              <div className="text-xs font-semibold leading-tight">Praveen Radhakrishnan</div>
              <div className="text-[10px] text-white/80 leading-tight">DevOps Engineer</div>
            </div>
            <ChevronDown size={14} className="text-white/80 ml-0.5" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-lg bg-white shadow-xl border border-border-subtle py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 text-slate-800">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-navy-900">Praveen Radhakrishnan</div>
                <div className="text-[11px] text-slate-500 truncate">praveen.radhakrishnan@easyjet.com</div>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="w-full flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
