import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  CreditCard,
  FileText,
  Briefcase,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAssistant } from '../../context/AssistantContext';
import { api } from '../../api';
import { UserRole } from '../../types';

interface HeaderProps {
  onNavigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
  const { role, setRole, userName } = useAuth();
  const { toggleOpen } = useAssistant();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search(searchQuery.trim());
        setSearchResults(res.results || []);
        setShowDropdown(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectResult = (route: string) => {
    setShowDropdown(false);
    setSearchQuery('');
    onNavigate(route);
  };

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'ADMIN', label: 'Admin (Chief Risk Officer)', desc: 'Full system governance, audit, & contracts' },
    { id: 'COLLECTIONS_MANAGER', label: 'Collections Manager', desc: 'Strategy, team cases, & approve NBA' },
    { id: 'COLLECTIONS_AGENT', label: 'Collections Agent', desc: 'Assigned customer dossier & agent assist' },
    { id: 'ANALYST', label: 'Risk Analyst', desc: 'Analytics & telemetry (PII masked)' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Global Search Bar */}
      <div className="relative w-96" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowDropdown(true)}
            placeholder="Search Customer, ID, Loan, Card, Phone or Note..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dynamic Search Dropdown */}
        {showDropdown && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 py-2 max-h-96 overflow-y-auto z-50">
            {isSearching ? (
              <div className="p-4 text-center text-xs text-slate-500">Searching enterprise data...</div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No records found matching "{searchQuery}"
              </div>
            ) : (
              <div>
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Found {searchResults.length} Match(es)
                </div>
                {searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectResult(item.route)}
                    className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-start gap-3 transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div className="mt-0.5 p-1 rounded bg-slate-100 text-slate-600">
                      {item.type === 'CUSTOMER' && <User className="w-3.5 h-3.5 text-teal-600" />}
                      {item.type === 'LOAN' && <Briefcase className="w-3.5 h-3.5 text-indigo-600" />}
                      {item.type === 'CARD' && <CreditCard className="w-3.5 h-3.5 text-amber-600" />}
                      {item.type === 'CASE' && <FileText className="w-3.5 h-3.5 text-rose-600" />}
                      {item.type === 'NOTE' && <FileText className="w-3.5 h-3.5 text-slate-600" />}
                    </div>
                    <div className="flex-1 truncate">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900 truncate">{item.title}</span>
                        {item.badge && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Role Switcher, Copilot Summon, Status */}
      <div className="flex items-center gap-3">
        {/* Live System Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>SQLite Engine Connected</span>
        </div>

        {/* Floating Copilot Summon Button */}
        <button
          onClick={toggleOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold hover:bg-teal-100/80 transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Ask AI</span>
        </button>

        {/* RBAC Role Selector Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-xs font-medium text-slate-800 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <div className="text-left hidden sm:block">
              <span className="font-semibold block leading-tight">{role.replace('_', ' ')}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Switch Active Role (RBAC Simulation)
                </span>
                <span className="text-xs text-slate-500 font-medium">Simulate permissions & PII masking</span>
              </div>
              <div className="p-1 space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setRole(r.id);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex flex-col ${
                      role === r.id ? 'bg-teal-50 text-teal-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{r.label}</span>
                      {role === r.id && (
                        <span className="text-[10px] font-bold text-teal-600 uppercase">Active</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-normal mt-0.5">{r.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
