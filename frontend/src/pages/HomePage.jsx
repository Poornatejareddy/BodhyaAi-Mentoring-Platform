import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  Shield,
  MessageSquare,
  Users,
  Zap,
  CheckCircle,
  TrendingUp,
  BookOpen
} from 'lucide-react';

function HomePage() {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-gray-900 -z-10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl mix-blend-screen animate-blob" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl mix-blend-screen animate-blob animation-delay-2000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800 text-blue-400 text-sm font-semibold mb-8 border border-gray-700 shadow-sm">
                <Zap className="w-4 h-4 fill-blue-500 text-blue-500" />
                <span>AI-Powered Student Success Platform</span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 text-white leading-tight">
                Unlock Every Student's <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Full Potential
                </span>
              </h1>

              <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                BodhyaAI combines advanced predictive analytics with personalized mentoring to ensure no student falls behind. Experience the future of education today.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-bold py-4 px-8 rounded-xl transition-all hover:shadow-md transform hover:-translate-y-1"
                >
                  Mentor Login
                </Link>
              </div>

              <div className="mt-10 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-400 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>94% Accuracy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>24/7 Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Easy Setup</span>
                </div>
              </div>
            </div>

            <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl bg-gray-800 shadow-2xl border border-gray-700 p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl opacity-10 blur-xl -z-10"></div>
                <img
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80"
                  alt="Dashboard Preview"
                  className="rounded-xl w-full h-auto object-cover shadow-inner opacity-90"
                />

                {/* Floating Badge 1 */}
                <div className="absolute -left-8 top-10 bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-700 flex items-center gap-3 animate-bounce-slow">
                  <div className="w-10 h-10 bg-green-900/30 rounded-full flex items-center justify-center text-green-400">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">Student Growth</p>
                    <p className="text-lg font-bold text-white">+15%</p>
                  </div>
                </div>

                {/* Floating Badge 2 */}
                <div className="absolute -right-8 bottom-10 bg-gray-800 p-4 rounded-xl shadow-xl border border-gray-700 flex items-center gap-3 animate-bounce-slow animation-delay-1000">
                  <div className="w-10 h-10 bg-blue-900/30 rounded-full flex items-center justify-center text-blue-400">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">AI Insights</p>
                    <p className="text-lg font-bold text-white">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-blue-400 font-semibold tracking-wide uppercase text-sm mb-3">Features</h2>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Everything you need to succeed</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Our platform provides a comprehensive suite of tools designed to empower educators and students alike.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Predictive Analytics",
                desc: "Identify at-risk students weeks before they fall behind with our advanced machine learning models.",
                color: "text-blue-400",
                bg: "bg-blue-900/30"
              },
              {
                icon: MessageSquare,
                title: "AI Chatbot Support",
                desc: "Provide 24/7 academic and emotional support to students through our empathetic AI assistant.",
                color: "text-purple-400",
                bg: "bg-purple-900/30"
              },
              {
                icon: Users,
                title: "Personalized Mentoring",
                desc: "Connect students with the right mentors and track their progress with detailed, actionable insights.",
                color: "text-green-400",
                bg: "bg-green-900/30"
              },
              {
                icon: Shield,
                title: "Early Intervention",
                desc: "Automated alerts and workflow tools help you step in exactly when it matters most.",
                color: "text-red-400",
                bg: "bg-red-900/30"
              },
              {
                icon: TrendingUp,
                title: "Progress Tracking",
                desc: "Visualize student growth over time with intuitive charts and comprehensive reports.",
                color: "text-orange-400",
                bg: "bg-orange-900/30"
              },
              {
                icon: BookOpen,
                title: "Resource Library",
                desc: "Automatically suggest relevant study materials based on individual learning gaps.",
                color: "text-teal-400",
                bg: "bg-teal-900/30"
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-gray-800 border border-gray-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group">
                <div className={`w-14 h-14 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-gray-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">How BodhyaAI Works</h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              A simple, streamlined process to transform your institution's student support system.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -translate-y-1/2 hidden md:block z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              {[
                {
                  step: "01",
                  title: "Connect Data",
                  desc: "Integrate seamlessly with your existing LMS and SIS to gather academic and behavioral data."
                },
                {
                  step: "02",
                  title: "AI Analysis",
                  desc: "Our models analyze the data in real-time to identify patterns, risks, and opportunities."
                },
                {
                  step: "03",
                  title: "Actionable Insights",
                  desc: "Mentors receive alerts and recommendations to provide timely, personalized support."
                }
              ].map((item, idx) => (
                <div key={idx} className="text-center bg-gray-900 p-6">
                  <div className="w-16 h-16 mx-auto bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg mb-6 transform rotate-3 hover:rotate-0 transition-transform">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-900/50 py-20 relative overflow-hidden border-y border-gray-800">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Students Supported", value: "10k+" },
              { label: "Mentors Active", value: "500+" },
              { label: "Risk Accuracy", value: "94%" },
              { label: "Partner Unis", value: "50+" }
            ].map((stat, idx) => (
              <div key={idx} className="p-4">
                <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">{stat.value}</div>
                <div className="text-blue-200 font-medium text-lg">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden border border-gray-700">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>

            <h2 className="text-3xl md:text-4xl font-bold mb-6 relative z-10">Ready to transform your student support?</h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto relative z-10">
              Join leading institutions using BodhyaAI to improve retention and student success rates.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 font-bold py-4 px-8 rounded-xl transition-all hover:bg-blue-50 hover:shadow-lg transform hover:-translate-y-1"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-blue-800/50 text-white border border-blue-400/50 font-bold py-4 px-8 rounded-xl transition-all hover:bg-blue-800 transform hover:-translate-y-1"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 pt-16 pb-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">B</div>
                <h3 className="text-2xl font-bold text-white">BodhyaAI</h3>
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed">
                Transforming education through artificial intelligence and human connection. We believe every student deserves the chance to succeed.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Platform</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">For Universities</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4 uppercase text-sm tracking-wider">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} BodhyaAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;