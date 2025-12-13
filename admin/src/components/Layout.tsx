import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/articles', label: 'Articles', icon: '📰' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/sources', label: 'News Sources', icon: '📡' },
  { path: '/categories', label: 'Categories', icon: '🏷️' },
  { path: '/analytics', label: 'Analytics', icon: '📈' },
  { path: '/system', label: 'System Health', icon: '🔧' },
];

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-variant">
      {/* Zimbabwe flag strip */}
      <div className="zw-flag-strip" />

      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-serif font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="font-serif font-bold text-lg text-gray-900">Mukoko</h1>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              end={item.path === '/'}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
              <span className="text-primary font-medium">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.displayName || user?.username || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn btn-secondary text-sm"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-[272px] min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 header-glass">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome back, {user?.displayName || user?.username || 'Admin'}
              </h2>
              <p className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="badge badge-success">
                {user?.role || 'admin'}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
