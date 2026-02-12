import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateEmail, validateRequired, getErrorMessage } from '../utils/helpers';
import { Eye, EyeOff, Mail, Lock, AlertCircle, Calendar } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

const Login = () => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    const emailError = validateRequired(formData.email, 'Email');
    if (emailError) {
      newErrors.email = emailError;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const passwordError = validateRequired(formData.password, 'Password');
    if (passwordError) {
      newErrors.password = passwordError;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      setApiError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-blue-500/20">
              <Calendar className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black text-gray-900 tracking-tight">
              Digitermin
            </span>
          </Link>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('auth.login.title', 'Sign in to your account')}</h2>
          <p className="mt-3 text-gray-500 font-medium">
            {t('auth.login.or', 'Or')}{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-bold underline decoration-blue-200 underline-offset-4">
              {t('auth.login.createAccount', 'create a new account')}
            </Link>
          </p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm py-10 px-4 shadow-2xl shadow-gray-200/50 rounded-[2.5rem] border border-gray-100 sm:px-12">
          {apiError && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                <p className="text-red-800">{apiError}</p>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="group">
                <label htmlFor="email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  {t('auth.fields.email', 'Email')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300"
                    placeholder={t('auth.placeholders.email', 'you@example.com')}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-600 font-medium ml-1">{errors.email}</p>}
              </div>

              <div className="group">
                <label htmlFor="password" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  {t('auth.fields.password', 'Password')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="block w-full pl-11 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300"
                    placeholder={t('auth.placeholders.password', '••••••••')}
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600 font-medium ml-1">{errors.password}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-bold text-gray-500 cursor-pointer">
                  {t('auth.login.remember', 'Remember me')}
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-bold text-blue-600 hover:text-blue-500 underline decoration-blue-200 underline-offset-4">
                  {t('auth.login.forgot', 'Forgot your password?')}
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-blue-500/20 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 mt-8"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                t('auth.login.submit', 'Sign in')
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('auth.login.orProviders', 'Or continue with')}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <span className="sr-only">{t('auth.providers.google', 'Sign in with Google')}</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.24 10.285V14.4h6.806c-.272 1.739-1.94 4.944-6.806 4.944-4.09 0-7.439-3.329-7.439-7.439s3.349-7.439 7.439-7.439c1.83 0 3.398.671 4.646 1.773l3.129-3.129c-2.016-1.889-4.65-3.044-7.775-3.044-6.627 0-12 5.373-12 12s5.373 12 12 12c6.942 0 11.525-4.925 11.525-11.731 0-.363-.027-.716-.082-1.064z" />
                </svg>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <span className="sr-only">{t('auth.providers.microsoft', 'Sign in with Microsoft')}</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.4 24H0V0h11.4v24zM17.9 0H24v24h-6.1V0z" />
                </svg>
              </button>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">{t('auth.test.title', 'Test Accounts:')}</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('auth.test.superadmin', 'SuperAdmin:')}</span>
                <span className="text-gray-900 font-mono">superadmin@booking.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('auth.test.admin', 'Admin:')}</span>
                <span className="text-gray-900 font-mono">john@booking.com</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('auth.test.user', 'User:')}</span>
                <span className="text-gray-900 font-mono">mike@booking.com</span>
              </div>
              <div className="text-center mt-2">
                <span className="text-gray-500">{t('auth.test.passwords', 'Password: super123 / admin123 / user123')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
