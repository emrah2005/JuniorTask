import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  Calendar, 
  Users, 
  BarChart3, 
  MessageSquare, 
  Globe, 
  ShieldCheck,
  ChevronDown,
  Zap,
  MousePointer2,
  Clock,
  Smartphone,
  Play
} from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

const Landing = () => {
  const { t } = useI18n();
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const stats = [
    { label: t('landing.stats.activeBusinesses'), value: '50+' },
    { label: t('landing.stats.hoursSavedMonthly'), value: '10,000+' },
    { label: t('landing.stats.availability'), value: '99.9%' }
  ];

  const features = [
    {
      title: t('landing.features.items.schedule.title'),
      description: t('landing.features.items.schedule.desc'),
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: t('landing.features.items.clients.title'),
      description: t('landing.features.items.clients.desc'),
      icon: <Users className="w-6 h-6" />,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      title: t('landing.features.items.analytics.title'),
      description: t('landing.features.items.analytics.desc'),
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      title: t('landing.features.items.sms.title'),
      description: t('landing.features.items.sms.desc'),
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      title: t('landing.features.items.online.title'),
      description: t('landing.features.items.online.desc'),
      icon: <Globe className="w-6 h-6" />,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: t('landing.features.items.roles.title'),
      description: t('landing.features.items.roles.desc'),
      icon: <ShieldCheck className="w-6 h-6" />,
      color: 'bg-rose-50 text-rose-600'
    }
  ];

  const faqs = [
    { q: t('landing.faq.q1'), a: t('landing.faq.a1') },
    { q: t('landing.faq.q2'), a: t('landing.faq.a2') },
    { q: t('landing.faq.q3'), a: t('landing.faq.a3') },
    { q: t('landing.faq.q4'), a: t('landing.faq.a4') }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Top Banner */}
      <div className="bg-blue-600 py-2.5 px-4 text-center">
        <p className="text-white text-sm font-medium flex items-center justify-center gap-2">
          <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">{t('landing.topBanner.new')}</span>
          {t('landing.topBanner.text')}
        </p>
      </div>

      {/* Hero Section */}
      <header className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-blue-50/50 to-transparent rounded-full blur-3xl opacity-50" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight mb-8">
              {t('landing.hero.title')}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed mb-10 px-4">
              {t('landing.hero.subtitle')}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                to="/register"
                className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {t('landing.hero.ctaStart')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="w-full sm:w-auto px-10 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                {t('landing.hero.ctaHowItWorks')}
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto py-8 border-t border-gray-100">
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-black text-blue-600 mb-1">{stat.value}</div>
                  <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">{t('landing.features.title')}</h2>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">{t('landing.features.subtitle')}</h3>
            <p className="text-lg text-gray-600">{t('landing.features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-300">
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Tour Section */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[3rem] blur-2xl opacity-10 animate-pulse" />
              <div className="relative bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden aspect-video group">
                <video
                  src="/video.mp4"
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                />
              </div>
            </div>

            <div>
              <h2 className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">{t('landing.productTour.label')}</h2>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 leading-tight">{t('landing.productTour.title')}</h3>
              
              <div className="space-y-6">
                {[
                  { icon: <MousePointer2 className="w-5 h-5" />, title: t('landing.productTour.title'), desc: t('landing.productTour.bullets.drag') },
                  { icon: <Zap className="w-5 h-5" />, title: t('landing.productTour.title'), desc: t('landing.productTour.bullets.speed') },
                  { icon: <Smartphone className="w-5 h-5" />, title: t('landing.productTour.title'), desc: t('landing.productTour.bullets.mobile') }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">{t('landing.pricing.label')}</h2>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">{t('landing.pricing.title')}</h3>
            
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className={`text-sm font-bold ${!isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>{t('landing.pricing.monthly')}</span>
              <button 
                onClick={() => setIsAnnual(!isAnnual)}
                className="w-14 h-8 bg-blue-600 rounded-full p-1 relative transition-all"
              >
                <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-all transform ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
              <span className={`text-sm font-bold ${isAnnual ? 'text-gray-900' : 'text-gray-400'}`}>
                {t('landing.pricing.yearly')} <span className="text-emerald-500 ml-1">{t('landing.pricing.save')}</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: t('landing.pricing.plans.basic'),
                price: isAnnual ? '450' : '500',
                desc: 'Совршено за самостојни професионалци',
                features: [t('landing.pricing.plans.features.unlimitedBookings'), t('landing.pricing.plans.features.oneEmployee'), t('landing.pricing.plans.features.recurring'), t('landing.pricing.plans.features.clients'), t('landing.pricing.plans.features.basicNotifications')],
                button: t('landing.pricing.plans.btnBasic'),
                popular: false
              },
              {
                name: t('landing.pricing.plans.premium'),
                price: isAnnual ? '900' : '1000',
                desc: 'Сѐ што ви треба за скалирање на бизнисот',
                features: [t('landing.pricing.plans.features.unlimitedBookings'), t('landing.pricing.plans.features.unlimitedEmployees'), t('landing.pricing.plans.features.recurring'), t('landing.pricing.plans.features.sms'), t('landing.pricing.plans.features.online'), t('landing.pricing.plans.features.advancedAnalytics')],
                button: t('landing.pricing.plans.btnPremium'),
                popular: true
              },
              {
                name: t('landing.pricing.plans.ultimate'),
                price: isAnnual ? '1350' : '1500',
                desc: 'Комплетно решение за професионалци',
                features: [t('landing.pricing.plans.features.unlimitedBookings'), t('landing.pricing.plans.features.ownDomain'), t('landing.pricing.plans.features.vipSupport'), t('landing.pricing.plans.features.personalTraining'), t('landing.pricing.plans.features.apiAccess')],
                button: t('landing.pricing.plans.btnUltimate'),
                popular: false
              }
            ].map((plan, i) => (
              <div key={i} className={`relative bg-white p-8 rounded-[2.5rem] border ${plan.popular ? 'border-blue-500 shadow-2xl shadow-blue-500/10 scale-105 z-10' : 'border-gray-100'} flex flex-col`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                    {t('landing.pricing.plans.popular')}
                  </div>
                )}
                <div className="mb-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                  <p className="text-sm text-gray-500 mb-6">{plan.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                    <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">ден/мес</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm font-medium text-gray-600">
                      <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`w-full py-4 rounded-2xl font-bold transition-all text-center ${plan.popular ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25' : 'bg-gray-50 text-gray-900 hover:bg-gray-100'}`}
                >
                  {plan.button}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em] mb-4">{t('landing.faq.label')}</h2>
            <h3 className="text-3xl md:text-4xl font-black text-gray-900">{t('landing.faq.title')}</h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between group"
                >
                  <span className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-8 pb-6 text-gray-600 text-sm leading-relaxed animate-in slide-in-from-top-2 duration-300">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-gray-900 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent)]" />
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 relative z-10">{t('landing.finalCta.title')}</h2>
          <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto relative z-10">{t('landing.finalCta.subtitle')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              to="/register"
              className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 shadow-xl shadow-blue-500/20 transition-all active:scale-95"
            >
              {t('landing.finalCta.button')}
            </Link>
            <p className="text-gray-500 text-sm font-medium italic">{t('landing.finalCta.note')}</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight">Digitermin</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8">
              {t('landing.footer.links').map((link, i) => (
                <button key={i} className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">{link}</button>
              ))}
            </div>

            <p className="text-sm font-medium text-gray-400">{t('landing.footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
