import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Brain, CheckCircle2, Zap, Calendar, FileText, TrendingUp, Shield, Rocket, Users, Target } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ThemeToggle } from '../components/ThemeToggle';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX - window.innerWidth / 2) / 50,
        y: (e.clientY - window.innerHeight / 2) / 50,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden smooth-scroll">
      
      {/* Premium Background - Mesh Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 gradient-mesh-ios opacity-50" />
        
        {/* Animated gradient orbs */}
        <motion.div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsla(211, 100%, 50%, 0.3) 0%, transparent 70%)',
            x: mousePosition.x * 3,
            y: mousePosition.y * 3,
          }}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        <motion.div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl"
          style={{
            background: 'radial-gradient(circle, hsla(271, 81%, 56%, 0.3) 0%, transparent 70%)',
            x: mousePosition.x * -2,
            y: mousePosition.y * -2,
          }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 left-0 right-0 z-50 glass-nav"
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
              onClick={() => navigate('/')}
            >
              <div className="relative group">
                <div className="w-11 h-11 rounded-2xl gradient-ios-blue flex items-center justify-center shadow-depth-2 transition-all duration-300 group-hover:shadow-depth-3 group-hover:scale-105">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="absolute inset-0 rounded-2xl gradient-ios-blue opacity-40 blur-lg group-hover:opacity-60 transition-opacity" />
              </div>
              <span className="text-2xl font-bold tracking-tightest bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                AIRecruiter
              </span>
            </motion.div>
            
            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-4"
            >
              <ThemeToggle />
              <Button
                data-testid="nav-get-started-button"
                onClick={handleGetStarted}
                className="ios-button-primary h-11 px-6 shadow-depth-2 hover:shadow-depth-3 active:scale-95"
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 glass rounded-full px-5 py-2.5 shadow-depth-1 mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
              </motion.div>
              <span className="text-sm font-semibold tracking-apple">AI-Powered HR Intelligence</span>
            </motion.div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{ opacity, y }}
              className="space-y-8"
            >
              <h1 className="text-6xl lg:text-8xl font-bold leading-[1.05] tracking-tightest">
                <span className="text-foreground">We Clear the</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                  Resume Fog
                </span>
                <br />
                <span className="text-foreground text-5xl lg:text-7xl">So You Can Finally Breathe</span>
              </h1>

              <p className="text-2xl lg:text-3xl text-muted-foreground leading-relaxed max-w-4xl mx-auto font-light tracking-apple">
                Because life's too short for another "enthusiastic fast learner."
                <br />
                <span className="text-xl">Smart screening. Smarter emails. Zero drama.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Button
                  data-testid="hero-get-started-button"
                  onClick={handleGetStarted}
                  size="lg"
                  className="ios-button-primary h-16 px-12 text-lg shadow-depth-3 hover:shadow-depth-4 group"
                >
                  Start Screening Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-sm text-muted-foreground italic pt-4"
              >
                "Yes, we ghosted 417 candidates for you. You're welcome." 👻
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="relative py-20 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card text-center p-12 lg:p-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Hiring Without the Drama
            </h2>
            <p className="text-2xl text-muted-foreground">
              Shortlists, Not Shortcuts<span className="mx-3">•</span>Because Everyone 'Looks Great on Paper'
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tightest mb-6">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Hire Smarter
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto tracking-apple">
              Our algorithm has trust issues... just like your hiring manager after the last hire
            </p>
          </motion.div>

          {/* Feature Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: 'AI-Powered Screening',
                description: 'Intelligent resume analysis that actually reads between the lines (and the buzzwords).',
                gradient: 'gradient-ios-blue',
              },
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Lightning Fast',
                description: 'Screen hundreds of resumes faster than you can say "culture fit."',
                gradient: 'gradient-ios-purple',
              },
              {
                icon: <Shield className="w-8 h-8" />,
                title: 'Bias-Free Evaluation',
                description: 'Objective assessments. No gut feelings. No "they remind me of my nephew."',
                gradient: 'gradient-ios-green',
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: 'Smart Scheduling',
                description: 'Interview calendar that actually respects time zones. Revolutionary, we know.',
                gradient: 'gradient-ios-pink',
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: 'Professional Emails',
                description: 'Generate polished emails without the passive-aggressive undertones.',
                gradient: 'gradient-ios-blue',
              },
              {
                icon: <TrendingUp className="w-8 h-8" />,
                title: 'Analytics Dashboard',
                description: 'Data-driven insights that your CFO will actually appreciate.',
                gradient: 'gradient-ios-purple',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="glass-card hover-lift group"
              >
                <div className={`w-14 h-14 rounded-2xl ${feature.gradient} flex items-center justify-center mb-5 shadow-depth-2 group-hover:shadow-depth-3 group-hover:scale-110 transition-all duration-300`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                
                <h3 className="text-2xl font-bold tracking-tight mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed tracking-apple">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="relative py-24 z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="glass-card p-12 lg:p-16">
            <div className="max-w-4xl mx-auto space-y-8">
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <h2 className="text-5xl lg:text-6xl font-bold tracking-tightest mb-6">
                  Why{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    AIRecruiter
                  </span>
                  ?
                </h2>
                
                <p className="text-2xl text-muted-foreground leading-relaxed">
                  Because reading "team player with excellent communication skills" for the 347th time isn't a real job.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6 pt-8">
                {[
                  {
                    icon: <CheckCircle2 className="w-8 h-8 text-success" />,
                    text: 'Screen resumes 10× faster than traditional methods'
                  },
                  {
                    icon: <CheckCircle2 className="w-8 h-8 text-success" />,
                    text: 'Eliminate unconscious bias with AI-driven evaluation'
                  },
                  {
                    icon: <CheckCircle2 className="w-8 h-8 text-success" />,
                    text: 'Generate professional communications instantly'
                  },
                  {
                    icon: <CheckCircle2 className="w-8 h-8 text-success" />,
                    text: 'Track every candidate from resume to offer'
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-4 glass rounded-2xl p-6"
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    <p className="text-lg text-foreground">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 z-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 lg:p-20 text-center shadow-depth-4"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-8"
            >
              <Rocket className="w-20 h-20 text-primary" />
            </motion.div>
            
            <h2 className="text-5xl lg:text-6xl font-bold tracking-tightest mb-6">
              Ready to Hire Without the Drama?
            </h2>
            
            <p className="text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
              Join the future of recruitment. No more "looking great on paper" surprises.
            </p>

            <Button
              onClick={handleGetStarted}
              size="lg"
              className="ios-button-primary h-16 px-12 text-lg shadow-depth-3 hover:shadow-depth-4 group"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>

            <p className="text-sm text-muted-foreground mt-8">
              No credit card required • Set up in 2 minutes • Cancel anytime
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 z-10 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl gradient-ios-blue flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">AIRecruiter</span>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2025 AIRecruiter. Hiring smarter, not harder.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
