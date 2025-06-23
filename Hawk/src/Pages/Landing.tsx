
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, Lock, BarChart2, AlertTriangle, ArrowRight, Globe, Server, Users, Code } from 'lucide-react';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';
import { useInView } from 'react-intersection-observer';
import { TypeAnimation } from 'react-type-animation';
import { loadSlim } from 'tsparticles-slim';

// Animated Components
const AnimatedFeatureCard = ({ icon, title, description, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary/10"
    >
      <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-primary/10 text-primary">
        {React.cloneElement(icon, { className: 'h-8 w-8' })}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

const AnimatedTestimonial = ({ quote, author, role, delay }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -50 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg border border-gray-100"
    >
      <div className="flex items-start mb-6">
        <div className="text-primary text-4xl font-serif mr-4">"</div>
        <p className="text-gray-700 text-lg italic">{quote}</p>
      </div>
      <div className="flex items-center">
        <div className="w-14 h-14 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {author.charAt(0)}
        </div>
        <div className="ml-4">
          <p className="font-semibold">{author}</p>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </motion.div>
  );
};

// Create a simple visualization component that doesn't use Three.js
const VisualizationPlaceholder = () => {
  return (
    <div className="relative w-full h-[400px] bg-blue-50 rounded-xl overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0">
        <div className="absolute w-40 h-40 bg-blue-400/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
        <div className="absolute w-60 h-60 bg-blue-500/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '300ms' }}></div>
        <div className="absolute w-80 h-80 bg-blue-600/20 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '600ms' }}></div>
      </div>
      <div className="relative z-10 p-6 bg-white/80 backdrop-blur-lg rounded-lg shadow-lg text-center">
        <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
        <p className="text-xl font-semibold text-gray-800">Interactive Threat Visualization</p>
        <p className="text-gray-600 mt-2">Real-time security monitoring and analysis</p>
      </div>
    </div>
  );
};

const Landing = () => {
  const particlesInit = async (engine) => {
    await loadSlim(engine);
  };
  
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-blue-900 text-white overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
          {/* Removed particles for simplicity and to avoid errors */}
        </div>

        <div className="container mx-auto px-4 py-6 relative z-10">
          <nav className="flex justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-300">
                HAWK
              </span>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-4"
            >
              <Link 
                to="/auth/login" 
                className="text-gray-200 hover:text-white transition-colors font-medium hover:underline underline-offset-4 decoration-primary"
              >
                Log in
              </Link>
              <Link to="/auth/signup">
                <Button 
                  variant="outline" 
                  className="border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 text-white hover:text-white transition-all shadow-lg hover:shadow-primary/20"
                >
                  Sign up
                </Button>
              </Link>
            </motion.div>
          </nav>
          
          <div className="py-24 max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                  Enterprise-Grade{' '}
                </span>
                <TypeAnimation
                  sequence={[
                    'Security Monitoring',
                    2000,
                    'Threat Detection',
                    2000,
                    'Vulnerability Management',
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-300"
                />
              </h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-xl text-gray-300 max-w-3xl mx-auto"
              >
                HAWK provides real-time security monitoring and vulnerability management for 
                organizations of all sizes. Detect threats before they impact your business.
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link to="/auth/signup">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px] group"
                  >
                    <span className="group-hover:scale-105 transition-transform">Get Started</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <a href="mailto:sales@hawksecurity.example.com">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 text-white hover:text-white w-full sm:w-auto shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px] group"
                  >
                    <span className="group-hover:scale-105 transition-transform">Request Demo</span>
                    <FiArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 mb-8">Trusted by security teams at</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            {['Microsoft', 'Google', 'Amazon', 'IBM', 'Cisco'].map((company, index) => (
              <motion.div
                key={company}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-2xl font-bold text-gray-700"
              >
                {company}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4">
              Why Choose HAWK
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Advanced Security Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive protection with cutting-edge technology designed for modern threats
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedFeatureCard
              icon={<AlertTriangle />}
              title="Real-time Threat Detection"
              description="Instant alerts for security threats with AI-powered anomaly detection and behavior analysis."
              delay={0.1}
            />
            
            <AnimatedFeatureCard
              icon={<BarChart2 />}
              title="Advanced Analytics"
              description="Comprehensive dashboards with actionable insights and predictive threat modeling."
              delay={0.2}
            />
            
            <AnimatedFeatureCard
              icon={<Lock />}
              title="Zero Trust Architecture"
              description="Built on security-first principles with end-to-end encryption and strict access controls."
              delay={0.3}
            />

            <AnimatedFeatureCard
              icon={<Globe />}
              title="Global Threat Intelligence"
              description="Leverage our worldwide network of threat sensors and intelligence feeds."
              delay={0.4}
            />

            <AnimatedFeatureCard
              icon={<Server />}
              title="Cloud & On-Prem Coverage"
              description="Protect all your environments with unified visibility and control."
              delay={0.5}
            />

            <AnimatedFeatureCard
              icon={<Users />}
              title="Team Collaboration"
              description="Built-in workflows for security teams with role-based access and audit trails."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* 3D Visualization Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4">
                Threat Visualization
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Interactive Threat Map</h2>
              <p className="text-xl text-gray-600 mb-8">
                Our threat visualization provides real-time monitoring of your network security.
                Identify vulnerabilities and see attack patterns in an intuitive spatial interface.
              </p>
              <ul className="space-y-4">
                {[
                  "Real-time threat monitoring",
                  "Visual risk assessment",
                  "Attack path visualization",
                  "Interactive node inspection"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="lg:w-1/2">
              <VisualizationPlaceholder />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: "99.9%", label: "Threat Detection Accuracy" },
              { value: "24/7", label: "Monitoring Coverage" },
              { value: "500+", label: "Enterprise Customers" },
              { value: "2min", label: "Average Response Time" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6"
              >
                <p className="text-5xl font-bold mb-2">{stat.value}</p>
                <p className="text-gray-300">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4">
              Customer Stories
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from security leaders who trust HAWK
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatedTestimonial
              quote="HAWK has transformed how we manage security vulnerabilities across our organization. The real-time alerts have helped us respond to threats much faster."
              author="Jamie Smith"
              role="CISO, TechCorp Inc."
              delay={0.1}
            />
            
            <AnimatedTestimonial
              quote="The comprehensive dashboard and reporting features give us complete visibility into our security posture. We've reduced response time by 60%."
              author="Alex Johnson"
              role="Head of IT Security, Global Services Ltd"
              delay={0.2}
            />

            <AnimatedTestimonial
              quote="Implementation was seamless and the support team is exceptional. HAWK has become our single pane of glass for security monitoring."
              author="Maria Garcia"
              role="Director of Cybersecurity, FinTech Solutions"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-primary/10 rounded-full -z-10"></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full -z-10"></div>
                <div className="p-8 bg-white rounded-2xl shadow-lg border border-gray-100 relative">
                  <Code className="h-12 w-12 text-primary mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Seamless Integration</h3>
                  <p className="text-gray-600 mb-6">
                    HAWK integrates with your existing security stack through our comprehensive API and 
                    pre-built connectors for all major platforms.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {['AWS', 'Azure', 'GCP', 'Slack', 'Jira', 'Splunk', 'Okta', 'More...'].map((platform) => (
                      <div key={platform} className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-700">{platform}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4">
                Developer Friendly
              </span>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Built for Your Stack</h2>
              <p className="text-xl text-gray-600 mb-8">
                HAWK is designed to fit seamlessly into your existing workflows with robust APIs, 
                webhooks, and native integrations.
              </p>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">RESTful API</h4>
                  <p className="text-gray-600">
                    Full programmatic access to all HAWK features with comprehensive documentation.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Webhook Support</h4>
                  <p className="text-gray-600">
                    Receive real-time alerts in your existing systems with customizable payloads.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">SDKs & Libraries</h4>
                  <p className="text-gray-600">
                    Officially supported libraries for Python, JavaScript, Go, and Java.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary mb-4">
              Flexible Plans
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your security needs
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$499",
                period: "per month",
                description: "Perfect for small teams getting started with security monitoring",
                features: [
                  "Up to 50 assets",
                  "Basic threat detection",
                  "Email alerts",
                  "24/7 monitoring",
                  "Community support"
                ],
                popular: false
              },
              {
                name: "Professional",
                price: "$1,499",
                period: "per month",
                description: "For growing teams needing advanced security features",
                features: [
                  "Up to 200 assets",
                  "Advanced threat detection",
                  "SMS & Email alerts",
                  "API access",
                  "Priority support",
                  "Weekly reports"
                ],
                popular: true
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For large organizations with complex security needs",
                features: [
                  "Unlimited assets",
                  "All Professional features",
                  "Dedicated account manager",
                  "Custom integrations",
                  "On-prem deployment",
                  "24/7 premium support",
                  "Security consulting"
                ],
                popular: false
              }
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl overflow-hidden border ${plan.popular ? 'border-primary shadow-xl' : 'border-gray-200 shadow-lg'}`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                    Most Popular
                  </div>
                )}
                <div className={`p-8 ${plan.popular ? 'bg-primary/5' : 'bg-white'}`}>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <p className="text-gray-600 mb-6">{plan.description}</p>
                  <div className="mb-8">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-600"> {plan.period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    size="lg" 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : 'bg-gray-900 hover:bg-gray-800'}`}
                  >
                    Get Started
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-32 bg-gradient-to-br from-gray-900 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-white/10 backdrop-blur-sm mb-4">
              Ready to get started?
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                Secure Your Organization Today
              </span>
            </h2>
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
              Join hundreds of organizations that trust HAWK to monitor and protect their critical systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth/signup">
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px] group"
                >
                  <span className="group-hover:scale-105 transition-transform">Get Started Free</span>
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="mailto:sales@hawksecurity.example.com">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-white/30 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/50 text-white hover:text-white shadow-lg hover:shadow-xl transition-all hover:translate-y-[-2px] group"
                >
                  <span className="group-hover:scale-105 transition-transform">Contact Sales</span>
                  <FiArrowUpRight className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row justify-between gap-12">
            <div className="lg:w-1/3">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-300">
                  HAWK
                </span>
              </div>
              <p className="text-gray-400 mb-6">
                Enterprise-grade security monitoring and vulnerability management solution for modern organizations.
              </p>
              <div className="flex space-x-4">
                {['Twitter', 'LinkedIn', 'GitHub', 'YouTube'].map((social) => (
                  <a 
                    key={social} 
                    href="#" 
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors">
                      {social.charAt(0)}
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:w-2/3">
              <div>
                <h3 className="font-semibold text-lg mb-4">Product</h3>
                <ul className="space-y-3">
                  {[
                    { name: "Features", href: "#" },
                    { name: "Pricing", href: "#" },
                    { name: "Integrations", href: "#" },
                    { name: "Roadmap", href: "#" },
                    { name: "Changelog", href: "#" }
                  ].map((item) => (
                    <li key={item.name}>
                      <a 
                        href={item.href} 
                        className="text-gray-400 hover:text-white transition-colors hover:underline underline-offset-4"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4">Company</h3>
                <ul className="space-y-3">
                  {[
                    { name: "About", href: "#" },
                    { name: "Careers", href: "#" },
                    { name: "Blog", href: "#" },
                    { name: "Press", href: "#" },
                    { name: "Contact", href: "#" }
                  ].map((item) => (
                    <li key={item.name}>
                      <a 
                        href={item.href} 
                        className="text-gray-400 hover:text-white transition-colors hover:underline underline-offset-4"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-4">Resources</h3>
                <ul className="space-y-3">
                  {[
                    { name: "Documentation", href: "#" },
                    { name: "API Reference", href: "#" },
                    { name: "Community", href: "#" },
                    { name: "Security", href: "#" },
                    { name: "Status", href: "#" }
                  ].map((item) => (
                    <li key={item.name}>
                      <a 
                        href={item.href} 
                        className="text-gray-400 hover:text-white transition-colors hover:underline underline-offset-4"
                      >
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 mb-4 md:mb-0">
              © {new Date().getFullYear()} HAWK Security. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">GDPR</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
