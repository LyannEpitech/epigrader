import { Link, useLocation } from 'react-router-dom';
import { useGitHubAuth } from '../hooks/useGitHubAuth';
import { useNotification } from '../contexts/NotificationContext';
import { Home, FileText, PlayCircle, History, LogOut, Sparkles, Settings } from 'lucide-react';

export const Header = () => {
  const { isAuthenticated, user, logout } = useGitHubAuth();
  const { success } = useNotification();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/rubric', label: 'Rubrics', icon: FileText },
    { path: '/analyze', label: 'Analyze', icon: PlayCircle },
    { path: '/history', label: 'History', icon: History },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    success('Logged out successfully');
  };

  return (
    <header className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a87] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl group-hover:bg-white/20 transition-all">
              <Sparkles className="w-6 h-6 text-[#ff6b35]" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight">EpiGrader</span>
              <span className="hidden sm:block text-xs text-white/60">AI-Powered Code Review</span>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-white/20 text-white shadow-inner' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Navigation - Mobile */}
          <nav className="md:hidden flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    p-2 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:bg-white/10'
                    }
                  `}
                  title={item.label}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </nav>

          {/* User & Logout */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full pl-1 pr-4 py-1">
                <img 
                  src={user.avatar_url} 
                  alt={user.login}
                  className="w-8 h-8 rounded-full border-2 border-white/30"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-tight">{user.login}</span>
                  <span className="text-xs text-white/60 leading-tight">{user.name || 'GitHub User'}</span>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-white/10 hover:bg-red-500/80 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};