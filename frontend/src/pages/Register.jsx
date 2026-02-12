import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Lock, Building, ArrowLeft, Calendar } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

const Register = () => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'User'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(
      formData.name, 
      formData.email, 
      formData.password, 
      formData.role
    );
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-[2.5rem] shadow-2xl shadow-gray-200/50 p-10 border border-gray-100">
          <div className="mb-10 text-center">
            <Link to="/" className="inline-flex items-center gap-2 group mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-blue-500/20">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black text-gray-900 tracking-tight">
                Digitermin
              </span>
            </Link>
            
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">
              {t('auth.register.title', 'Create your account')}
            </h2>
            <p className="mt-3 text-sm text-gray-500 font-medium">
              {t('auth.register.haveAccount', 'Already have an account?')}{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-bold underline decoration-blue-200 underline-offset-4"
              >
                {t('auth.register.signInHere', 'Sign in here')}
              </Link>
            </p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium flex items-center animate-shake">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-3 shrink-0"></div>
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="group">
                <label htmlFor="name" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  {t('auth.fields.name', 'Full Name')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300"
                    placeholder={t('auth.placeholders.name', 'John Doe')}
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

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
                    required
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300"
                    placeholder={t('auth.placeholders.email', 'you@example.com')}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
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
                    type="password"
                    required
                    className="block w-full pl-11 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-300"
                    placeholder={t('auth.placeholders.password', '••••••••')}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  {t('auth.register.roleLabel', 'Account Type')}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'User' })}
                    className={`py-3 px-4 rounded-2xl text-sm font-bold border-2 transition-all ${
                      formData.role === 'User' 
                        ? 'border-blue-600 bg-blue-50 text-blue-600' 
                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {t('auth.register.roleUser', 'Client')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'Admin' })}
                    className={`py-3 px-4 rounded-2xl text-sm font-bold border-2 transition-all ${
                      formData.role === 'Admin' 
                        ? 'border-blue-600 bg-blue-50 text-blue-600' 
                        : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    {t('auth.register.roleAdmin', 'Business')}
                  </button>
                </div>
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
                t('auth.register.submit', 'Create Account')
              )}
            </button>
          </form>
        </div>
        
        <p className="mt-8 text-center text-xs text-gray-400 font-medium">
          {t('auth.register.terms', 'By joining, you agree to our Terms of Service and Privacy Policy.')}
        </p>
      </div>
    </div>
  );
};

export default Register;
