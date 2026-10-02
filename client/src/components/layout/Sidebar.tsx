import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Bot,
  BrainCircuit,
  Headphones,
  PhoneCall,
  BarChart3,
  CheckSquare,
  ShieldAlert,
  Settings,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { role, userName } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Collections 360', path: '/collections-360', icon: UserCheck },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'AI Assistant', path: '/assistant', icon: Bot, highlight: true },
    { label: 'AI Agent', path: '/agent', icon: BrainCircuit, badge: 'Agentic' },
    { label: 'Agent Assist', path: '/agent-assist', icon: Headphones },
    { label: 'Post-Call Summary', path: '/post-call', icon: PhoneCall },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Data Quality', path: '/data-quality', icon: CheckSquare },
    { label: 'Governance', path: '/governance', icon: ShieldAlert },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 h-screen sticky top-0 border-r border-slate-800 select-none z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-extrabold text-white tracking-tight">COLLECTIQ</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Collections Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Intelligence & Operations
        </div>
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Demo Status & Active Role Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50">
        <div className="px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/50 mb-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Platform Mode:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Demo Ready
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1 truncate">
            Zero-config AI & Embedded SQLite
          </div>
        </div>

        <div className="px-3 py-2 flex items-center justify-between text-xs">
          <div className="truncate mr-2">
            <div className="text-white font-medium truncate">{userName.split('(')[0]}</div>
            <div className="text-[10px] text-teal-400 font-semibold">{role.replace('_', ' ')}</div>
          </div>
          <button
            onClick={() => onNavigate('/settings')}
            title="Help & Info"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
