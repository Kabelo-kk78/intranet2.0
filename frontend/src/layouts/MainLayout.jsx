import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  DocumentIcon, 
  CheckCircleIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Documents', href: '/documents', icon: DocumentIcon },
  { name: 'Approvals', href: '/approvals', icon: CheckCircleIcon },
  { name: 'Users', href: '/users', icon: UsersIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-card border-r border-gray-200 dark:border-gray-700 animate-fade-in">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Enterprise Intranet</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{user?.department || 'Dashboard'}</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const active = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    active 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role || 'Staff'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto animate-slide-up">
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
