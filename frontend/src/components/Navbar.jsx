import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { LogOut, User, Calendar, BarChart3, Menu } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    const onKey = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white fixed top-0 left-0 right-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20">
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

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="p-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            >
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
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
                  className="flex items-center px-4 py-2 rounded-xl text-sm font-bold text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all"
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
      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-50 md:hidden ${mobileOpen ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${mobileOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-80 max-w-[85%] bg-white shadow-xl transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black text-gray-900">{t('navbar.brand')}</span>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-2">
              {['mk', 'en', 'al'].map(code => (
                <button
                  key={code}
                  onClick={() => setLang(code)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border w-full text-center ${lang === code ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
                >
                  {t(`navbar.languages.${code}`)}
                </button>
              ))}
            </div>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  {t('navbar.dashboard')}
                </Link>
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-lg bg-blue-600 text-white text-sm font-bold text-center hover:bg-blue-700"
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
