import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { LogOut, User, Calendar, BarChart3 } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">
                {t('navbar.brand')}
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center gap-2">
              {['mk', 'en', 'al'].map(code => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${lang === code ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  {t(`navbar.languages.${code}`)}
                </button>
              ))}
            </div>
            {user ? (
              <>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-sm font-bold text-gray-700">{user.name}</span>
                </div>
                <Link
                  to="/dashboard"
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('navbar.dashboard')}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-all"
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95"
                >
                  {t('navbar.getStarted')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
