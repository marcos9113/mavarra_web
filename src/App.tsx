import React from 'react';
import './App.css';
import logo from './logo_no_background.png';
import StartTransformation from './StartTransformation';
import Blog from './Blog';
import Admin from './Admin';
import Auth from './Auth';
import Signup from './Signup';
import { getToken } from './utils/auth';

function App() {
  const [route, setRoute] = React.useState<string>(window.location.hash || '#/');
  React.useEffect(() => {
    const onHash = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const isStart = route.startsWith('#/start');
  const isBlog = route.startsWith('#/blog');
  const isAdmin = route.startsWith('#/admin');
  const isAuth = route.startsWith('#/auth');
  const isSignup = route.startsWith('#/signup');
  const hideMain = isAuth || isAdmin || isSignup || isStart || isBlog;

  const onAdminClick = React.useCallback(() => {
    if (getToken()) {
      window.location.hash = '#/admin';
    } else {
      window.location.hash = '#/auth';
    }
  }, []);

  React.useEffect(() => {
    if (route.startsWith('#/admin') && !getToken()) {
      window.location.hash = '#/auth';
    }
  }, [route]);

  React.useEffect(() => {
    if (!route || route === '#/' || route.startsWith('#/')) return;
    const id = route.slice(1);
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [route]);

  React.useEffect(() => {
    if (route.startsWith('#/')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [route]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-slate via-charcoal to-steel text-white relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-mavarra-purple rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-mavarra-pink rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/2 w-3 h-3 bg-mavarra-emerald rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 right-1/4 w-2 h-2 bg-mavarra-orange rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Navigation */}
      {!isAdmin && (
      <nav className="fixed w-full top-0 z-50 bg-dark-slate/95 backdrop-blur-2xl border-b border-mavarra-purple/10 shadow-2xl shadow-mavarra-purple/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              {/* Logo Image */}
              <div className="relative group cursor-pointer">
                <div className="relative transform group-hover:scale-105 transition-transform duration-300" style={{width: '200px', height: '200px'}}>
                  <img 
                    src={logo} 
                    alt="Mavarra Logo" 
                    style={{width: '200px', height: '200px'}}
                    className="object-contain group-hover:opacity-90 transition-opacity duration-300"
                  />
                  
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-mavarra-purple/20 to-mavarra-pink/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>

            </div>

            {/* Navigation Links - Desktop */}
            <div className="hidden lg:flex items-center space-x-1">
              <a href="#home" className="group relative px-6 py-3 rounded-xl transition-all duration-300 hover:bg-mavarra-purple/10">
                <span className="text-gray-300 group-hover:text-white font-medium text-sm tracking-wide">Home</span>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-mavarra-purple to-mavarra-pink group-hover:w-8 transition-all duration-300 rounded-full"></div>
              </a>
              
              <a href="#services" className="group relative px-6 py-3 rounded-xl transition-all duration-300 hover:bg-mavarra-indigo/10">
                <span className="text-gray-300 group-hover:text-white font-medium text-sm tracking-wide">Services</span>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-mavarra-indigo to-mavarra-cyan group-hover:w-8 transition-all duration-300 rounded-full"></div>
              </a>
              
              <a href="#about" className="group relative px-6 py-3 rounded-xl transition-all duration-300 hover:bg-mavarra-orange/10">
                <span className="text-gray-300 group-hover:text-white font-medium text-sm tracking-wide">Why Us?</span>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-mavarra-orange to-mavarra-pink group-hover:w-8 transition-all duration-300 rounded-full"></div>
              </a>
              
              <a href="#story" className="group relative px-6 py-3 rounded-xl transition-all duration-300 hover:bg-mavarra-indigo/10">
                <span className="text-gray-300 group-hover:text-white font-medium text-sm tracking-wide">Our Story</span>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-mavarra-indigo to-mavarra-purple group-hover:w-8 transition-all duration-300 rounded-full"></div>
              </a>
              
              <a href="#/blog" className="group relative px-6 py-3 rounded-xl transition-all duration-300 hover:bg-mavarra-cyan/10">
                <span className="text-gray-300 group-hover:text-white font-medium text-sm tracking-wide">Blog</span>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-mavarra-cyan to-mavarra-purple group-hover:w-8 transition-all duration-300 rounded-full"></div>
              </a>

              <a href="#contact" className="group relative px-6 py-3 rounded-xl transition-all duration-300 hover:bg-mavarra-pink/10">
                <span className="text-gray-300 group-hover:text-white font-medium text-sm tracking-wide">Contact</span>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-mavarra-pink to-mavarra-purple group-hover:w-8 transition-all duration-300 rounded-full"></div>
              </a>
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-4">
              {/* CTA Button */}
              <div className="hidden md:flex items-center gap-3">
                <a
                  href="#/start"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-mavarra-purple to-mavarra-indigo hover:from-mavarra-pink hover:to-mavarra-orange focus:outline-none focus:ring-2 focus:ring-mavarra-purple shadow-lg shadow-mavarra-purple/10 hover:-translate-y-0.5"
                >
                  <span>Get Started</span>
                  <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>

              {/* Mobile Menu Button */}
              <div className="lg:hidden">
                <button className="p-2 rounded-xl bg-mavarra-purple/10 text-mavarra-purple hover:bg-mavarra-purple hover:text-white transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      )}

      {/* Hero or Start Page */}
      {!hideMain && (
      <section id="home" className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Geometric Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-mavarra-purple/10 to-transparent rounded-full blur-xl animate-float"></div>
          <div className="absolute bottom-40 right-20 w-48 h-48 bg-gradient-to-br from-mavarra-indigo/10 to-transparent rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-to-br from-mavarra-pink/5 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}}></div>
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          {/* Hero Content */}
          <div className="max-w-6xl mx-auto space-y-12 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-mavarra-purple/10 border border-mavarra-purple/30 rounded-full px-6 py-3">
              <div className="w-3 h-3 bg-mavarra-emerald rounded-full animate-pulse"></div>
              <span className="text-mavarra-purple font-semibold">Transforming Businesses Since 2025</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight">
                <span className="block text-white">We Build</span>
                <span className="block bg-gradient-to-r from-mavarra-purple via-mavarra-pink to-mavarra-orange bg-clip-text text-transparent animate-gradient-shift">
                  Digital Futures
                </span>
                <span className="block text-gray-300 text-4xl md:text-5xl lg:text-6xl font-light">
                  for Small Business
                </span>
              </h1>
              
              <div className="flex justify-center">
                <div className="w-24 h-1 bg-gradient-to-r from-mavarra-purple to-mavarra-pink rounded-full"></div>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Mavarra specializes in <span className="text-mavarra-cyan font-semibold">AI-powered digital transformation</span>, 
              helping entrepreneurs and small businesses scale with cutting-edge technology solutions that are 
              <span className="text-mavarra-emerald font-semibold"> affordable</span> and <span className="text-mavarra-orange font-semibold">results-driven</span>.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto py-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-mavarra-purple">New</div>
                <div className="text-gray-400">Startup Partner</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-mavarra-emerald">50%</div>
                <div className="text-gray-400">Cost Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-mavarra-orange">24/7</div>
                <div className="text-gray-400">AI Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-mavarra-pink">#1</div>
                <div className="text-gray-400">Affordable Rates</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <a href="#/start" className="group relative px-12 py-4 bg-gradient-to-r from-mavarra-purple to-mavarra-indigo rounded-full text-white font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105">
                <span className="relative z-10 flex items-center gap-3">
                  🚀 Start Transformation
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-mavarra-pink to-mavarra-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="pt-12">
              <p className="text-gray-400 mb-6">Trusted by innovative businesses worldwide</p>
              <div className="flex flex-wrap justify-center items-center gap-12 text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-mavarra-purple to-mavarra-pink rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">★</span>
                  </div>
                  <span className="font-semibold text-mavarra-purple">4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-mavarra-emerald to-mavarra-cyan rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <span className="font-semibold text-mavarra-emerald">ISO Certified</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-mavarra-orange to-mavarra-pink rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🛡</span>
                  </div>
                  <span className="font-semibold text-mavarra-orange">100% Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center text-gray-400 animate-bounce">
          <span className="text-sm mb-2 tracking-wider">EXPLORE SOLUTIONS</span>
          <div className="w-px h-12 bg-gradient-to-b from-mavarra-purple to-transparent"></div>
          <div className="w-2 h-2 bg-mavarra-purple rounded-full mt-2"></div>
        </div>
      </section>
      )}

      {isStart && (
        <StartTransformation />
      )}

      {isBlog && (
        <Blog />
      )}

      {isAdmin && (
        <Admin />
      )}

      {isAuth && (
        <Auth />
      )}

      {isSignup && (
        <Signup />
      )}

      {!hideMain && (
      <section id="services" className="py-20 px-6 bg-gradient-to-br from-dark-slate/50 via-charcoal/30 to-steel/20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-mavarra-purple/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-br from-mavarra-emerald/5 to-transparent rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-mavarra-purple/10 border border-mavarra-purple/30 rounded-full px-6 py-3 mb-6">
              <div className="w-3 h-3 bg-mavarra-purple rounded-full animate-pulse"></div>
              <span className="text-mavarra-purple font-semibold">Our Expertise</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-mavarra-purple via-mavarra-pink to-mavarra-orange bg-clip-text text-transparent">
              Our Services
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              We don’t just build software — we build businesses. Whether you’re a small business looking to go digital or an entrepreneur with a bold new idea, we’re here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 1. Digital Solutions for Businesses */}
            <div className="group relative bg-gradient-to-br from-black/60 via-gray-900/50 to-black/60 p-8 rounded-2xl border border-mavarra-purple/20 hover:border-mavarra-purple/60 transition-all duration-500 hover:shadow-2xl hover:shadow-mavarra-purple/25 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-mavarra-purple/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-mavarra-purple to-mavarra-pink rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">🧩</div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-mavarra-purple to-mavarra-pink bg-clip-text text-transparent">Digital Solutions for Businesses</h3>
                <p className="text-gray-300 leading-relaxed mb-3">We build custom websites, platforms, and tools tailored for your unique business needs.</p>
                <p className="text-gray-300 leading-relaxed">From education platforms to small-scale retail and services, we make digital transformation simple and affordable.</p>
                <div className="mt-4 text-gray-400 italic">“We don’t sell templates — we create solutions that fit your business.”</div>
              </div>
            </div>

            {/* 2. Idea-to-Execution for Entrepreneurs */}
            <div className="group relative bg-gradient-to-br from-black/60 via-gray-900/50 to-black/60 p-8 rounded-2xl border border-mavarra-orange/20 hover:border-mavarra-orange/60 transition-all duration-500 hover:shadow-2xl hover:shadow-mavarra-orange/25 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-mavarra-orange/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-mavarra-orange to-mavarra-pink rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">🚀</div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-mavarra-orange to-mavarra-pink bg-clip-text text-transparent">Idea‑to‑Execution for Entrepreneurs</h3>
                <p className="text-gray-300 leading-relaxed mb-3">Have a startup idea but don’t know where to start? We work with entrepreneurs to design, build, and launch MVPs.</p>
                <p className="text-gray-300 leading-relaxed">Whether it’s a mobile app, SaaS platform, or AI‑powered tool — we help you turn vision into reality.</p>
                <div className="mt-4 text-gray-400 italic">“You bring the idea, we bring the technology.”</div>
              </div>
            </div>

            {/* 3. Technology Without Limits */}
            <div className="group relative bg-gradient-to-br from-black/60 via-gray-900/50 to-black/60 p-8 rounded-2xl border border-mavarra-emerald/20 hover:border-mavarra-emerald/60 transition-all duration-500 hover:shadow-2xl hover:shadow-mavarra-emerald/25 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-mavarra-emerald/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-mavarra-emerald to-mavarra-cyan rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">♾️</div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-mavarra-emerald to-mavarra-cyan bg-clip-text text-transparent">Technology Without Limits</h3>
                <p className="text-gray-300 leading-relaxed mb-3">We use every tool at our disposal — from AI to cloud platforms — to craft scalable solutions.</p>
                <p className="text-gray-300 leading-relaxed">Web, mobile, cloud infrastructure, automation, AI, and integrations — our stack adapts to your needs.</p>
                <div className="mt-4 text-gray-400 italic">“We’re not limited to one technology — we build what works best for you.”</div>
              </div>
            </div>

            {/* 4. Growth & Long‑Term Support */}
            <div className="group relative bg-gradient-to-br from-black/60 via-gray-900/50 to-black/60 p-8 rounded-2xl border border-mavarra-indigo/20 hover:border-mavarra-indigo/60 transition-all duration-500 hover:shadow-2xl hover:shadow-mavarra-indigo/25 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-mavarra-indigo/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-mavarra-indigo to-mavarra-purple rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">📈</div>
                <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-mavarra-indigo to-mavarra-purple bg-clip-text text-transparent">Growth & Long‑Term Support</h3>
                <p className="text-gray-300 leading-relaxed mb-3">We don’t just deliver a product and walk away. Our team provides maintenance, upgrades, and scaling support as you grow.</p>
                <p className="text-gray-300 leading-relaxed">Hosting, security, updates, and training — all covered.</p>
                <div className="mt-4 text-gray-400 italic">“Your success is long‑term, and so is our partnership.”</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {!hideMain && (
      <section id="about" className="py-20 px-6 bg-gradient-to-br from-charcoal/30 via-dark-slate/20 to-steel/10 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-40 right-20 w-72 h-72 bg-gradient-to-br from-mavarra-orange/5 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-mavarra-pink/5 to-transparent rounded-full blur-2xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-mavarra-orange/10 border border-mavarra-orange/30 rounded-full px-6 py-3 mb-6">
              <div className="w-3 h-3 bg-mavarra-orange rounded-full animate-pulse"></div>
              <span className="text-mavarra-orange font-semibold">Why Choose Us</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-mavarra-orange via-mavarra-pink to-mavarra-purple bg-clip-text text-transparent">
              Why Choose Mavarra?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Your trusted partner in <span className="text-mavarra-emerald font-semibold">digital transformation</span> and business growth
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            {/* Left Column - Key Benefits */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-8 rounded-2xl border border-mavarra-orange/20 backdrop-blur-sm">
                <p className="text-lg text-gray-300 leading-relaxed mb-8">
                  We specialize in transforming small businesses and empowering new entrepreneurs with cutting-edge IT solutions. 
                  Our approach goes beyond just technology - we become your <span className="text-mavarra-orange font-semibold">strategic partners</span> in business growth.
                </p>
                
                <div className="space-y-6">
                  {/* Collaborative Approach */}
                  <div className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-mavarra-purple/5 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-mavarra-purple to-mavarra-indigo rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-mavarra-purple mb-2">Collaborative Approach</h3>
                      <p className="text-gray-300 leading-relaxed">We sit with you to understand your unique requirements and brainstorm innovative solutions that align with your business vision.</p>
                    </div>
                  </div>

                  {/* Financial Awareness */}
                  <div className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-mavarra-emerald/5 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-mavarra-emerald to-mavarra-cyan rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-mavarra-emerald mb-2">Financial Awareness</h3>
                      <p className="text-gray-300 leading-relaxed">We understand the financial constraints of growing businesses. That's why we offer the most competitive pricing in town without compromising on quality.</p>
                    </div>
                  </div>

                  {/* Business Expansion Focus */}
                  <div className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-mavarra-orange/5 transition-all duration-300">
                    <div className="w-12 h-12 bg-gradient-to-br from-mavarra-orange to-mavarra-pink rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-mavarra-orange mb-2">Business Expansion Focus</h3>
                      <p className="text-gray-300 leading-relaxed">Our solutions are designed not just for today, but to scale with your business as it grows and expands into new markets.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Our Process */}
            <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-8 rounded-2xl border border-mavarra-cyan/20 backdrop-blur-sm">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-mavarra-cyan to-mavarra-emerald bg-clip-text text-transparent">Our Process</h3>
                <p className="text-gray-300">Your journey to digital transformation</p>
              </div>
              
              <div className="space-y-8">
                <div className="group relative">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-mavarra-purple to-mavarra-indigo rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">1</div>
                      <div className="absolute top-12 left-1/2 w-px h-8 bg-gradient-to-b from-mavarra-purple to-mavarra-indigo transform -translate-x-1/2"></div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="font-bold text-white mb-2 text-lg">Discovery & Requirements</h4>
                      <p className="text-gray-300 leading-relaxed">We listen to your needs and understand your business goals through comprehensive analysis</p>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-mavarra-emerald to-mavarra-cyan rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">2</div>
                      <div className="absolute top-12 left-1/2 w-px h-8 bg-gradient-to-b from-mavarra-emerald to-mavarra-cyan transform -translate-x-1/2"></div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="font-bold text-white mb-2 text-lg">Collaborative Brainstorming</h4>
                      <p className="text-gray-300 leading-relaxed">Together, we design innovative solutions that fit your budget and align with your vision</p>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-mavarra-orange to-mavarra-pink rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">3</div>
                      <div className="absolute top-12 left-1/2 w-px h-8 bg-gradient-to-b from-mavarra-orange to-mavarra-pink transform -translate-x-1/2"></div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="font-bold text-white mb-2 text-lg">Implementation & Support</h4>
                      <p className="text-gray-300 leading-relaxed">We build, deploy, and provide ongoing support for your complete digital transformation</p>
                    </div>
                  </div>
                </div>
                
                <div className="group relative">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-mavarra-pink to-mavarra-purple rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">4</div>
                    </div>
                    <div className="flex-1 pt-2">
                      <h4 className="font-bold text-white mb-2 text-lg">Growth & Scaling</h4>
                      <p className="text-gray-300 leading-relaxed">We help you scale and expand as your business grows into new markets and opportunities</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-24">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-mavarra-purple to-mavarra-pink bg-clip-text text-transparent mb-4">
                Proven Results
              </h3>
            <p className="text-gray-300">Building trust through transparent collaboration</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <div className="group bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-8 rounded-2xl border border-mavarra-purple/20 text-center hover:border-mavarra-purple/60 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-mavarra-purple to-mavarra-indigo rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 3a1 1 0 011-1h12a1 1 0 011 1v14a1 1 0 01-1.447.894L10 15.118l-5.553 2.776A1 1 0 013 17V3z" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-mavarra-purple mb-2">2025</div>
                <div className="text-gray-300 font-medium">Founded To Build With You</div>
              </div>
              
              <div className="group bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-8 rounded-2xl border border-mavarra-emerald/20 text-center hover:border-mavarra-emerald/60 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-mavarra-emerald to-mavarra-cyan rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-4xl font-bold text-mavarra-emerald mb-2">50%</div>
                <div className="text-gray-300 font-medium">Average Cost Savings</div>
              </div>
              
              <div className="group bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-8 rounded-2xl border border-mavarra-orange/20 text-center hover:border-mavarra-orange/60 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-mavarra-orange to-mavarra-pink rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-4xl font-bold text-mavarra-orange mb-2">24/7</div>
                <div className="text-gray-300 font-medium">Support Available</div>
              </div>
              
              <div className="group bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-8 rounded-2xl border border-mavarra-cyan/20 text-center hover:border-mavarra-cyan/60 transition-all duration-500 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-mavarra-cyan to-mavarra-purple rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"/>
                  </svg>
                </div>
                <div className="text-4xl font-bold text-mavarra-cyan mb-2">AI</div>
                <div className="text-gray-300 font-medium">Powered Solutions</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {!hideMain && (
      <section id="story" className="py-20 px-6 bg-gradient-to-br from-steel/20 via-charcoal/40 to-dark-slate/30 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-mavarra-indigo/10 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-40 right-10 w-64 h-64 bg-gradient-to-br from-mavarra-purple/10 to-transparent rounded-full blur-2xl animate-float" style={{animationDelay: '3s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-br from-mavarra-emerald/5 to-transparent rounded-full blur-xl animate-float" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center space-x-2 bg-mavarra-indigo/10 border border-mavarra-indigo/30 rounded-full px-6 py-3 mb-6">
              <div className="w-3 h-3 bg-mavarra-indigo rounded-full animate-pulse"></div>
              <span className="text-mavarra-indigo font-semibold">Our Journey</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-mavarra-indigo via-mavarra-purple to-mavarra-pink bg-clip-text text-transparent">
              Our Story
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The vision that sparked a <span className="text-mavarra-purple font-semibold">digital revolution</span> for small businesses
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Story Content */}
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-8 rounded-2xl border border-mavarra-indigo/20 backdrop-blur-sm">
                <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-mavarra-purple to-mavarra-indigo rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-mavarra-purple mb-3">The Spark</h3>
                      <p>
                        Mavarra was born from a simple yet powerful observation: <span className="text-mavarra-cyan font-semibold">small businesses were being left behind</span> in the digital revolution. 
                        While enterprise companies had access to cutting-edge technology and dedicated IT teams, entrepreneurs and small business owners struggled with outdated systems, limited budgets, and complex technical barriers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-mavarra-emerald to-mavarra-cyan rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-mavarra-emerald mb-3">The Mission</h3>
                      <p>
We founded Mavarra in 2025 with a clear mission: to <span className="text-mavarra-orange font-semibold">democratize technology</span> and make AI-powered digital solutions accessible to every business, regardless of size or budget. 
                        We believed that innovation shouldn't be a privilege reserved for Fortune 500 companies.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-mavarra-orange to-mavarra-pink rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-mavarra-orange mb-3">The Vision</h3>
                      <p>
                        Today, Mavarra stands as a beacon for <span className="text-mavarra-pink font-semibold">collaborative innovation</span>. We don't just provide solutions; we become partners in your journey. 
                        Our approach combines cutting-edge AI technology with deep understanding of small business challenges, creating solutions that are both powerful and affordable.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Values & Timeline */}
            <div className="space-y-8">
              {/* Core Values */}
              <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-8 rounded-2xl border border-mavarra-purple/20 backdrop-blur-sm">
                <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-mavarra-purple to-mavarra-pink bg-clip-text text-transparent text-center">
                  Our Core Values
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4 p-4 rounded-xl bg-mavarra-purple/5 border border-mavarra-purple/10">
                    <div className="w-3 h-3 bg-mavarra-purple rounded-full"></div>
                    <div>
                      <h4 className="font-bold text-mavarra-purple">Accessibility First</h4>
                      <p className="text-gray-300 text-sm">Technology should empower, not exclude</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 rounded-xl bg-mavarra-emerald/5 border border-mavarra-emerald/10">
                    <div className="w-3 h-3 bg-mavarra-emerald rounded-full"></div>
                    <div>
                      <h4 className="font-bold text-mavarra-emerald">Collaborative Partnership</h4>
                      <p className="text-gray-300 text-sm">We grow together with our clients</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 rounded-xl bg-mavarra-orange/5 border border-mavarra-orange/10">
                    <div className="w-3 h-3 bg-mavarra-orange rounded-full"></div>
                    <div>
                      <h4 className="font-bold text-mavarra-orange">Innovation with Purpose</h4>
                      <p className="text-gray-300 text-sm">Every solution solves real problems</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 p-4 rounded-xl bg-mavarra-cyan/5 border border-mavarra-cyan/10">
                    <div className="w-3 h-3 bg-mavarra-cyan rounded-full"></div>
                    <div>
                      <h4 className="font-bold text-mavarra-cyan">Transparent Excellence</h4>
                      <p className="text-gray-300 text-sm">Quality work, honest pricing, clear communication</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Future Vision */}
              <div className="bg-gradient-to-br from-black/40 via-gray-900/30 to-black/40 p-8 rounded-2xl border border-mavarra-cyan/20 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-mavarra-cyan to-mavarra-emerald bg-clip-text text-transparent">
                  Looking Forward
                </h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  As we continue to grow, our commitment remains unchanged: to be the bridge between ambitious small businesses and the digital future they deserve.
                </p>
                
                <div className="bg-gradient-to-r from-mavarra-purple/10 to-mavarra-pink/10 p-6 rounded-xl border border-mavarra-purple/20">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-mavarra-purple to-mavarra-pink rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🚀</span>
                    </div>
                    <h4 className="font-bold text-white">Join Our Journey</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Every business we transform brings us closer to a world where technology truly serves everyone. 
                    <span className="text-mavarra-pink font-semibold"> Ready to be part of this revolution?</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      )}

      {!hideMain && (
      <section id="contact" className="py-20 px-6 bg-gradient-to-br from-dark-slate/60 via-charcoal/40 to-steel/20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-80 h-80 bg-gradient-to-br from-mavarra-pink/10 to-transparent rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-mavarra-cyan/10 to-transparent rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-mavarra-pink via-mavarra-orange to-mavarra-cyan bg-clip-text text-transparent">
            Let's Transform Your Business
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Ready to start your digital transformation journey? Let's <span className="text-mavarra-cyan font-semibold">brainstorm together</span> and create something amazing!
          </p>
          <div className="mt-10">
            <a
              href="#/start"
              className="inline-flex items-center gap-3 px-12 py-4 rounded-full text-white font-semibold bg-gradient-to-r from-mavarra-pink to-mavarra-orange hover:from-mavarra-purple hover:to-mavarra-indigo transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-mavarra-pink"
            >
              <span>Start Transformation</span>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </section>
      )}

      {!hideMain && (
      <footer className="bg-black py-12 px-6 border-t border-gray-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-3xl font-bold text-tech-blue mb-4">Mavarra</div>
          <p className="text-gray-400 mb-6">Transforming businesses through innovative IT solutions</p>
          <div className="flex justify-center space-x-6 text-gray-400">
            <a href="/privacy" className="hover:text-tech-blue transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-tech-blue transition-colors">Terms of Service</a>
            <a href="https://linkedin.com" className="hover:text-tech-blue transition-colors">LinkedIn</a>
            <a href="https://twitter.com" className="hover:text-tech-blue transition-colors">Twitter</a>
          </div>
          <div className="mt-6">
            <button
              type="button"
              onClick={onAdminClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-white font-semibold text-sm transition-all duration-300 bg-gradient-to-r from-mavarra-purple to-mavarra-indigo hover:from-mavarra-pink hover:to-mavarra-orange focus:outline-none focus:ring-2 focus:ring-mavarra-purple"
            >
              Admin Dashboard
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          <div className="mt-6 text-gray-500">
            © 2025 Mavarra. All rights reserved.
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}

export default App;
