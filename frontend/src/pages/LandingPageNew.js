import React, { useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Brain, Zap, Target, TrendingUp, Users, Shield, CheckCircle2 } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UnicornScene from "unicornstudio-react";

const LandingPageNew = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroRef = useRef(null);
  
  // Smooth parallax effects
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    // Force dark theme on landing page
    document.documentElement.classList.add('dark');
    
    // Smooth scroll
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white overflow-x-hidden smooth-scroll custom-scrollbar">
      
      {/* Navigation Bar */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 border-b border-white/5"
        style={{
          backgroundColor: 'rgba(10, 10, 18, 0.8)',
          backdropFilter: 'blur(20px)',
        }}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="relative group">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-105">
                  <Sparkles className="w-6 h-6 text-black" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 opacity-50 blur-xl group-hover:opacity-70 transition-opacity" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                PrimeHire
              </span>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              onClick={handleGetStarted}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-semibold text-sm hover:shadow-lg hover:shadow-amber-400/30 transition-all duration-300 hover:scale-105"
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section with Unicorn Studio */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto"
        >
          {/* Removed middle Get Started button as per user request */}
        </motion.div>

        {/* Unicorn Studio WebGL Scene */}
        <div className="absolute inset-0 z-0">
          <UnicornScene 
            projectId="e1enjLKX9nbRQp4KW3Wq" 
            sdkUrl="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.5/dist/unicornStudio.umd.js"
            width="100%" 
            height="100%" 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: 0.6,
            }}
          />
        </div>

        {/* Gradient overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a12]/50 via-transparent to-[#0a0a12]" />
      </section>

      {/* Who We Are Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-[#0a0a12] to-[#0f0f1a]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-gray-300">Who We Are</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                AI-Native
              </span>
              {' '}Recruitment Platform
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              PrimeHire combines cutting-edge artificial intelligence with deep recruitment expertise to deliver unparalleled hiring intelligence. We empower talent teams to make data-driven decisions faster and with greater confidence.
            </p>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: "AI-Powered Insights",
                description: "Advanced machine learning algorithms analyze candidate profiles, predict success rates, and surface hidden talent.",
                gradient: "from-amber-400 to-yellow-300"
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Fast",
                description: "Screen hundreds of resumes in seconds, generate personalized emails, and automate repetitive tasks instantly.",
                gradient: "from-slate-300 to-zinc-400"
              },
              {
                icon: <Target className="w-8 h-8" />,
                title: "Precision Matching",
                description: "Multi-dimensional scoring engine evaluates skills, experience, and cultural fit with unprecedented accuracy.",
                gradient: "from-yellow-300 to-amber-500"
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: "Predictive Analytics",
                description: "Forecast hiring outcomes, identify bottlenecks, and optimize your recruitment funnel with real-time insights.",
                gradient: "from-zinc-400 to-slate-500"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Collaboration Tools",
                description: "Streamline team communication, centralize feedback, and maintain complete visibility across your hiring pipeline.",
                gradient: "from-amber-500 to-yellow-400"
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: "Bias Detection",
                description: "Built-in fairness algorithms identify and mitigate unconscious bias, ensuring equitable hiring practices.",
                gradient: "from-slate-400 to-zinc-300"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="relative py-32 px-6 bg-[#0f0f1a]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm text-gray-300">Our Services</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              Everything You Need to
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                Hire Smarter
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              A comprehensive suite of AI-powered tools designed to transform every stage of your recruitment process
            </p>
          </motion.div>

          {/* Services List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              {
                title: "Intelligent Resume Screening",
                description: "Upload hundreds of resumes and get AI-powered ranking with detailed match scores, skill assessments, and experience analysis in seconds.",
                features: ["Multi-format support", "Batch processing", "ATS scoring", "Skill extraction"]
              },
              {
                title: "Predictive Candidate Analytics",
                description: "Leverage machine learning to predict hiring success rates, identify flight risks, and surface top performers before your competitors.",
                features: ["Success prediction", "Risk scoring", "Trend forecasting", "Talent clustering"]
              },
              {
                title: "AI Email & Communication",
                description: "Generate personalized interview invitations, offers, and follow-ups with AI. Set up automated sequences and maintain consistent engagement.",
                features: ["Smart templates", "Auto-follow-ups", "Tone adjustment", "Multi-language"]
              },
              {
                title: "Real-Time Collaboration",
                description: "Centralized dashboard for your entire hiring team. Share feedback, schedule interviews, and track progress with complete visibility.",
                features: ["Team workspaces", "Interview scheduling", "Feedback loops", "Activity tracking"]
              },
              {
                title: "Advanced Analytics Dashboard",
                description: "Deep insights into your recruitment metrics. Visualize funnel performance, conversion rates, and team productivity with beautiful charts.",
                features: ["Custom reports", "KPI tracking", "Funnel analysis", "Benchmarking"]
              },
              {
                title: "Bias Detection & Compliance",
                description: "Ensure fair and equitable hiring with built-in bias detection, diversity tracking, and compliance monitoring across all stages.",
                features: ["Bias alerts", "Diversity metrics", "Audit trails", "Compliance reporting"]
              }
            ].map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                  {service.title}
                </h3>
                <p className="text-gray-400 mb-6 leading-relaxed text-lg">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {service.features.map((feature, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300"
                    >
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 bg-gradient-to-b from-[#0f0f1a] to-[#0a0a12]">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              Ready to Transform
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                Your Hiring Process?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Join forward-thinking companies using AI to hire faster, smarter, and more effectively
            </p>
            <button
              onClick={handleGetStarted}
              className="group px-10 py-5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black font-semibold text-xl hover:shadow-2xl hover:shadow-amber-400/40 transition-all duration-300 hover:scale-105 flex items-center gap-3 mx-auto"
            >
              Get Started Now
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-amber-300 to-yellow-200 bg-clip-text text-transparent">
                PrimeHire
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2025 PrimeHire. AI-Native Hiring Intelligence Platform.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPageNew;
