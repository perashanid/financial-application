import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { 
  FiArrowRight, 
  FiTrendingUp, 
  FiTarget, 
  FiUsers, 
  FiBarChart2, 
  FiShield,
  FiDollarSign,
  FiCreditCard,
  FiGlobe,
  FiLock,
  FiSmartphone,
  FiBell,
  FiRefreshCw,
  FiAward,
  FiActivity
} from 'react-icons/fi';

const Landing = () => {
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});
  const [scrollY, setScrollY] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, []);

  const splitTextIntoWords = (text: string) => {
    const words = text.split(' ');
    return words.map((word, index) => (
      <span key={index}>
        <span className="word-reveal" style={{ animationDelay: `${index * 0.1}s` }}>
          {word}
        </span>
        {index < words.length - 1 && ' '}
      </span>
    ));
  };

  const features = [
    {
      icon: <FiDollarSign className="w-7 h-7" />,
      title: 'Transaction Tracking',
      description: 'Track all your income and expenses with receipt uploads and smart categorization for better financial insights.'
    },
    {
      icon: <FiTarget className="w-7 h-7" />,
      title: 'Savings Goals',
      description: 'Set financial goals and automate your savings with intelligent rules that help you reach your targets faster.'
    },
    {
      icon: <FiCreditCard className="w-7 h-7" />,
      title: 'Loan Management',
      description: 'Track borrowed and lent money with automatic interest calculations and payment reminders.'
    },
    {
      icon: <FiUsers className="w-7 h-7" />,
      title: 'Bill Splitting',
      description: 'Share expenses with groups and track settlements effortlessly with automated calculations.'
    },
    {
      icon: <FiBarChart2 className="w-7 h-7" />,
      title: 'Smart Analytics',
      description: 'Visualize spending patterns and get AI-powered financial predictions to make better decisions.'
    },
    {
      icon: <FiTrendingUp className="w-7 h-7" />,
      title: 'Crowdfunding',
      description: 'Create campaigns and raise funds for your goals with community support and transparent tracking.'
    }
  ];

  const benefits = [
    { icon: <FiGlobe className="w-5 h-5" />, text: 'Multi-currency support for global transactions' },
    { icon: <FiLock className="w-5 h-5" />, text: 'Secure two-factor authentication' },
    { icon: <FiSmartphone className="w-5 h-5" />, text: 'Payment gateway integration' },
    { icon: <FiBarChart2 className="w-5 h-5" />, text: 'Export reports in CSV and PDF' },
    { icon: <FiRefreshCw className="w-5 h-5" />, text: 'Automated recurring transactions' },
    { icon: <FiBell className="w-5 h-5" />, text: 'Real-time notifications and alerts' }
  ];

  const stats = [
    { icon: <FiUsers className="w-8 h-8" />, value: '10K+', label: 'Active Users' },
    { icon: <FiDollarSign className="w-8 h-8" />, value: '$2M+', label: 'Transactions Tracked' },
    { icon: <FiActivity className="w-8 h-8" />, value: '99.9%', label: 'Uptime' },
    { icon: <FiAward className="w-8 h-8" />, value: '4.9/5', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav 
        className="fixed w-full z-50 transition-all duration-300"
        style={{
          background: scrollY > 50 ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(12px)' : 'none',
          boxShadow: scrollY > 50 ? '0 4px 20px rgba(37, 99, 235, 0.1)' : 'none'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                <FiTrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                FinLedger
              </span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 link-hover"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative bg-gradient-to-b from-blue-50 to-white">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl animate-float"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight animate-fade-in-up">
              Take Control of Your
              <span className="block text-blue-600 mt-2">
                Financial Future
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up stagger-2">
              {splitTextIntoWords('Track expenses, achieve savings goals, manage loans, and split bills with friends. All your finances in one powerful platform.')}
            </p>
            <div className="flex justify-center animate-fade-in-up stagger-3">
              <Link
                to="/register"
                className="group bg-blue-600 text-white px-10 py-5 rounded-xl hover:bg-blue-700 transform hover:-translate-y-2 transition-all duration-300 font-semibold flex items-center space-x-3 shadow-xl hover:shadow-2xl text-lg"
              >
                <span>Start Free Trial</span>
                <FiArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div 
            id="features-header"
            data-animate
            className={`text-center mb-20 transition-all duration-1000 ${
              isVisible['features-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Everything You Need
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              {splitTextIntoWords('Powerful features designed to simplify your financial life and help you achieve your goals.')}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                id={`feature-${index}`}
                data-animate
                className={`group p-10 rounded-2xl border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 bg-white transform hover:-translate-y-3 card-hover ${
                  isVisible[`feature-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {splitTextIntoWords(feature.description)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div
              id="benefits-content"
              data-animate
              className={`transition-all duration-1000 ${
                isVisible['benefits-content'] ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'
              }`}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Built for Security and Convenience
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                {splitTextIntoWords('Your financial data is protected with enterprise-grade security while enjoying seamless access across all your devices.')}
              </p>
              <div className="space-y-5">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-4 group animate-fade-in-left"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {benefit.icon}
                    </div>
                    <span className="text-gray-700 text-lg font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div
              id="benefits-card"
              data-animate
              className={`relative transition-all duration-1000 ${
                isVisible['benefits-card'] ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
              }`}
            >
              <div className="bg-blue-600 rounded-3xl p-12 text-white shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <div className="w-20 h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
                  <FiShield className="w-12 h-12" />
                </div>
                <h3 className="text-4xl font-bold mb-6">Bank-Level Security</h3>
                <p className="text-blue-100 mb-10 leading-relaxed text-lg">
                  {splitTextIntoWords('Your data is encrypted end-to-end with industry-standard protocols. We never share your information with third parties.')}
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300">
                    <div className="text-4xl font-bold mb-2">256-bit</div>
                    <div className="text-sm text-blue-100">Encryption</div>
                  </div>
                  <div className="bg-white bg-opacity-10 rounded-2xl p-6 backdrop-blur-sm hover:bg-opacity-20 transition-all duration-300">
                    <div className="text-4xl font-bold mb-2">2FA</div>
                    <div className="text-sm text-blue-100">Authentication</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div 
            id="stats"
            data-animate
            className={`grid md:grid-cols-2 lg:grid-cols-4 gap-8 transition-all duration-1000 ${
              isVisible['stats'] ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            {stats.map((stat, index) => (
              <div 
                key={index}
                className="text-center p-10 rounded-2xl bg-blue-50 hover:bg-blue-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex justify-center mb-4 text-blue-600">
                  {stat.icon}
                </div>
                <div className="text-5xl font-bold text-blue-600 mb-3">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div 
            id="testimonials-header"
            data-animate
            className={`text-center mb-20 transition-all duration-1000 ${
              isVisible['testimonials-header'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Loved by Users
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our community has to say about their experience
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "FinLedger has completely transformed how I manage my finances. The automated savings feature is a game changer.",
                author: "Sarah Johnson",
                role: "Small Business Owner"
              },
              {
                quote: "The bill splitting feature makes it so easy to manage group expenses. No more awkward conversations about money.",
                author: "Michael Chen",
                role: "Freelancer"
              },
              {
                quote: "I love the analytics dashboard. It gives me clear insights into my spending patterns and helps me save more.",
                author: "Emily Rodriguez",
                role: "Marketing Manager"
              }
            ].map((testimonial, index) => (
              <div
                key={index}
                id={`testimonial-${index}`}
                data-animate
                className={`p-8 rounded-2xl bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2 ${
                  isVisible[`testimonial-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiAward key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed text-lg">
                  {splitTextIntoWords(testimonial.quote)}
                </p>
                <div>
                  <div className="font-bold text-gray-900">{testimonial.author}</div>
                  <div className="text-gray-500 text-sm">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative">
          <div
            id="cta"
            data-animate
            className={`transition-all duration-1000 ${
              isVisible['cta'] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Ready to Transform Your Finances?
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 leading-relaxed">
              {splitTextIntoWords('Join thousands of users who are already managing their money smarter.')}
            </p>
            <Link
              to="/register"
              className="group inline-flex items-center space-x-3 bg-white text-blue-600 px-10 py-5 rounded-xl hover:bg-gray-100 hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 font-bold text-lg"
            >
              <span>Get Started for Free</span>
              <FiArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <FiTrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">FinLedger</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Your trusted partner in financial management
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Features</Link></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">About</Link></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Blog</Link></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Help Center</Link></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Contact</Link></li>
                <li><Link to="/login" className="hover:text-blue-400 transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-sm">
              © 2025 FinLedger. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
