import React from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Bell, ExternalLink } from 'lucide-react';
import { useApp } from '../../app/providers';

interface NotificationItem {
  id: string;
  type: 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  runId?: string;
}

const notifications: NotificationItem[] = [];

export const NotificationDrawer: React.FC = () => {
  const { isNotificationsOpen, setIsNotificationsOpen } = useApp();

  if (!isNotificationsOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/30 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-[#FF6600]" />
            <h2 className="text-sm font-semibold text-text-primary">Pipeline Notifications</h2>
            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-600">
              {notifications.length}
            </span>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-3 space-y-2">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3 border border-slate-100">
                <Bell size={20} />
              </div>
              <p className="text-sm font-medium text-slate-700">No new notifications</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
                Pipeline lifecycle events, validation anomalies, and status updates will appear here in real time.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {notif.type === 'success' && <CheckCircle2 size={16} className="text-emerald-600" />}
                    {notif.type === 'warning' && <AlertTriangle size={16} className="text-amber-600" />}
                    {notif.type === 'error' && <XCircle size={16} className="text-red-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-text-primary">{notif.title}</span>
                      <span className="text-[11px] text-text-secondary">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">{notif.message}</p>
                    {notif.runId && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#FF6600]">
                        <span>Run ID: {notif.runId}</span>
                        <ExternalLink size={12} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-border-subtle bg-slate-50 flex items-center justify-between text-xs text-text-secondary">
          <span>Delivery Channel: Slack #data-eng-alerts</span>
          <button
            onClick={() => setIsNotificationsOpen(false)}
            className="font-medium text-slate-700 hover:text-slate-900"
          >
            Mark all read
          </button>
        </div>
      </div>
    </div>
  );
};
