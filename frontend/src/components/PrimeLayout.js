import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileSearch, 
  Briefcase, 
  Mail, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  Sparkles
} from 'lucide-react';
import ThemeTogglePrime from '../components/ThemeTogglePrime';

const PrimeLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard',
      description: 'Overview & Analytics'
    },
    { 
      id: 'candidates', 
      label: 'Candidates', 
      icon: Users, 
      path: '/candidates',
      description: 'Manage your talent pool'
    },
    { 
      id: 'screening', 
      label: 'Screening', 
      icon: FileSearch, 
      path: '/screening',
      description: 'AI-powered resume screening'
    },
    { 
      id: 'jobs', 
      label: 'Jobs', 
      icon: Briefcase, 
      path: '/jobs',
      description: 'Job descriptions & positions'
    },
    { 
      id: 'emails', 
      label: 'Emails', 
      icon: Mail, 
      path: '/emails',
      description: 'AI email generator'
    },
    { 
      id: 'calendar', 
      label: 'Calendar', 
      icon: CalendarIcon, 
      path: '/calendar',
      description: 'Interviews & events'
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside 
        className={`
          frosted-panel border-r border-border transition-all duration-300 ease-spring
          ${collapsed ? 'w-20' : 'w-64'}
          hidden md:flex flex-col relative z-50
        `}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-background" viewBox="0 0 16 16">
                  <path d="M.036 12.314a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.757-.703a.5.5 0 0 1-.278-.65m0 2a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.757-.703a.5.5 0 0 1-.278-.65M2.662 8.08c-.456 1.063-.994 2.098-1.842 2.804a.5.5 0 0 1-.64-.768c.652-.544 1.114-1.384 1.564-2.43.14-.328.281-.68.427-1.044.302-.754.624-1.559 1.01-2.308C3.763 3.2 4.528 2.105 5.7 1.299 6.877.49 8.418 0 10.5 0c1.463 0 2.511.4 3.179 1.058.67.66.893 1.518.819 2.302-.074.771-.441 1.516-1.02 1.965a1.88 1.88 0 0 1-1.904.27c-.65.642-.907 1.679-.71 2.614C11.076 9.215 11.784 10 13 10h2.5a.5.5 0 0 1 0 1H13c-1.784 0-2.826-1.215-3.114-2.585-.232-1.1.005-2.373.758-3.284L10.5 5.06l-.777.388a.5.5 0 0 1-.447 0l-1-.5a.5.5 0 0 1 .447-.894l.777.388.776-.388a.5.5 0 0 1 .447 0l1 .5.034.018c.44.264.81.195 1.108-.036.328-.255.586-.729.637-1.27.05-.529-.1-1.076-.525-1.495s-1.19-.77-2.477-.77c-1.918 0-3.252.448-4.232 1.123C5.283 2.8 4.61 3.738 4.07 4.79c-.365.71-.655 1.433-.945 2.16-.15.376-.301.753-.463 1.13"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">PrimeHire</h1>
                <p className="text-[10px] text-foreground-muted -mt-0.5">Prime Talent Only</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="text-background" viewBox="0 0 16 16">
                <path d="M.036 12.314a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.757-.703a.5.5 0 0 1-.278-.65m0 2a.5.5 0 0 1 .65-.278l1.757.703a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.014-.406a2.5 2.5 0 0 1 1.857 0l1.015.406a1.5 1.5 0 0 0 1.114 0l1.757-.703a.5.5 0 1 1 .372.928l-1.758.703a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.014-.406a1.5 1.5 0 0 0-1.114 0l-1.015.406a2.5 2.5 0 0 1-1.857 0l-1.757-.703a.5.5 0 0 1-.278-.65M2.662 8.08c-.456 1.063-.994 2.098-1.842 2.804a.5.5 0 0 1-.64-.768c.652-.544 1.114-1.384 1.564-2.43.14-.328.281-.68.427-1.044.302-.754.624-1.559 1.01-2.308C3.763 3.2 4.528 2.105 5.7 1.299 6.877.49 8.418 0 10.5 0c1.463 0 2.511.4 3.179 1.058.67.66.893 1.518.819 2.302-.074.771-.441 1.516-1.02 1.965a1.88 1.88 0 0 1-1.904.27c-.65.642-.907 1.679-.71 2.614C11.076 9.215 11.784 10 13 10h2.5a.5.5 0 0 1 0 1H13c-1.784 0-2.826-1.215-3.114-2.585-.232-1.1.005-2.373.758-3.284L10.5 5.06l-.777.388a.5.5 0 0 1-.447 0l-1-.5a.5.5 0 0 1 .447-.894l.777.388.776-.388a.5.5 0 0 1 .447 0l1 .5.034.018c.44.264.81.195 1.108-.036.328-.255.586-.729.637-1.27.05-.529-.1-1.076-.525-1.495s-1.19-.77-2.477-.77c-1.918 0-3.252.448-4.232 1.123C5.283 2.8 4.61 3.738 4.07 4.79c-.365.71-.655 1.433-.945 2.16-.15.376-.301.753-.463 1.13"/>
              </svg>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`
                  w-full rounded-full px-4 py-3 flex items-center gap-3
                  transition-all duration-200 group relative
                  ${active 
                    ? 'bg-elevated text-foreground border-2 border-primary dark:border-[#D4AF37]' 
                    : 'text-foreground-secondary hover:text-foreground hover:bg-elevated border-2 border-transparent'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                style={{ whiteSpace: 'nowrap' }}
              >
                <Icon className={`${collapsed ? 'w-5 h-5' : 'w-5 h-5'} flex-shrink-0`} />
                {!collapsed && (
                  <div className="flex flex-col items-start flex-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    {!active && (
                      <span className="text-[10px] opacity-60">{item.description}</span>
                    )}
                  </div>
                )}
                
                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <div className="
                    absolute left-full ml-2 px-3 py-2 rounded-xl
                    frosted-panel text-xs font-medium whitespace-nowrap
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 pointer-events-none
                  ">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-3 space-y-2 border-t border-border">
          {/* Theme Toggle */}
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-3'} py-2`}>
            {!collapsed && <span className="text-sm text-foreground-secondary">Theme</span>}
            <ThemeTogglePrime />
          </div>

          {/* Settings - REMOVED per request */}
          {/* <button
            onClick={() => navigate('/settings')}
            className={`
              w-full rounded-full px-4 py-3 flex items-center gap-3
              text-foreground-secondary hover:text-foreground hover:bg-elevated
              transition-all duration-200
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Settings</span>}
          </button> */}

          {/* User Profile */}
          <button
            onClick={() => navigate('/profile')}
            className={`
              w-full rounded-full px-4 py-3 flex items-center gap-3
              text-foreground-secondary hover:text-foreground hover:bg-elevated
              transition-all duration-200
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">Recruiter</span>
                <span className="text-[10px] opacity-60">View profile</span>
              </div>
            )}
          </button>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="
            absolute -right-3 top-20 
            w-6 h-6 rounded-full 
            frosted-panel border border-border
            flex items-center justify-center
            hover:gradient-gold-silver hover:border-transparent
            transition-all duration-200
            group
          "
        >
          {collapsed ? (
            <ChevronRight className="w-3 h-3 text-foreground-secondary group-hover:text-background" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-foreground-secondary group-hover:text-background" />
          )}
        </button>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="
        md:hidden fixed bottom-0 left-0 right-0 z-50
        frosted-panel border-t border-border
        px-2 py-2
      ">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-2xl
                  transition-all duration-200 relative
                  ${active ? 'text-foreground' : 'text-foreground-secondary'}
                `}
              >
                <div className={`
                  p-2 rounded-full transition-all duration-200
                  ${active ? 'gradient-gold-silver' : ''}
                `}>
                  <Icon className={`w-5 h-5 ${active ? 'text-background' : ''}`} />
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
                
                {/* Active indicator */}
                {active && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full gradient-gold-silver" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
};

export default PrimeLayout;
