import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useI18n } from '../../contexts/I18nContext';
import {
  HomeIcon,
  BuildingIcon,
  CalendarIcon,
  DollarSignIcon,
  UsersIcon,
  BarChart3Icon,
  SettingsIcon,
  LogOutIcon,
  MenuIcon
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navigation = [
    { key: 'dashboard', href: '/dashboard', icon: HomeIcon, roles: ['Admin', 'SuperAdmin', 'User'] },
    { key: 'businesses', href: '/dashboard/businesses', icon: BuildingIcon, roles: ['Admin', 'SuperAdmin'] },
    { key: 'bookings', href: '/dashboard/bookings', icon: CalendarIcon, roles: ['Admin', 'User'] },
    { key: 'analytics', href: '/dashboard/analytics', icon: BarChart3Icon, roles: ['Admin', 'SuperAdmin'] },
    { key: 'users', href: '/dashboard/users', icon: UsersIcon, roles: ['Admin', 'SuperAdmin'] }
  ];

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(user?.role)
  );

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === href || location.pathname.startsWith('/dashboard/') && !filteredNavigation.some(item => item.href !== '/dashboard' && location.pathname.startsWith(item.href));
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col h-screen`}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          {!isCollapsed && (
            <span className="ml-3 text-lg font-semibold">BookingPro</span>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              to={item.href}
              className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {!isCollapsed && t(`sidebar.items.${item.key}`)}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-gray-300 font-medium text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Logout Button */}
      <div className="border-t border-gray-800 p-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <LogOutIcon className="w-4 h-4 mr-2" />
          {!isCollapsed && t('sidebar.signOut')}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
