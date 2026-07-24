import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getMe } from '../services/authService';
import { Mail, Lock, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import logo from '../assets/logo.png';

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsError(false);
    setIsLoading(true);
    setMessage('');

    try {
      const loginData = await loginUser(email, password);
      const userData = await getMe(loginData.token);

      login(userData.data, loginData.token);
      setMessage('Login successful!');

      // Small delay to show success message
      setTimeout(() => {
        switch (userData.data.role) {
          case 'admin':
            navigate('/dashboard/admin/overview');
            break;
          case 'mentor':
            navigate('/dashboard/mentor/mentees');
            break;
          case 'student':
            navigate('/dashboard/student/overview');
            break;
          default:
            navigate('/login');
        }
      }, 500);
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--canvas)] transition-colors duration-200">
      {/* Left Side - Visual Banner */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[var(--surface-muted)]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[var(--surface)]   "></div>

        <div className="relative z-10 flex flex-col justify-between p-16 text-[var(--ink)] h-full">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <img src={logo} alt="BodhyaAI Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold tracking-tight">BodhyaAI</span>
            </div>
            <h1 className="text-4xl font-bold leading-tight mb-4 tracking-tight">
              Predictive support. <br />
              <span className="text-[var(--brand)]">Empowered mentoring.</span>
            </h1>
            <p className="text-sm text-[var(--ink)] max-w-sm leading-relaxed">
              Access your student success portal to schedule study plans, analyze risk indicators, and coordinate intervention.
            </p>
          </div>

          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5 text-xs font-medium text-[var(--ink)]">
              <CheckCircle size={15} className="text-[var(--success)]" />
              <span>Explainable AI Warning Flags</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-[var(--ink)]">
              <CheckCircle size={15} className="text-[var(--success)]" />
              <span>Real-time Chat Coordination</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-[var(--ink)]">
              <CheckCircle size={15} className="text-[var(--success)]" />
              <span>Self-Guided Cognitive Profiles</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--canvas)]">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--ink)]">Sign in to BodhyaAI</h2>
            <p className="mt-2 text-xs text-[var(--ink-muted)]">
              Or <Link to="/register" className="font-semibold text-[var(--brand)] hover:underline">create a new account</Link> to start coordinating.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-[var(--ink-muted)]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-[var(--line)] rounded-lg bg-[var(--surface)] text-[var(--ink)] placeholder-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] transition-all"
                    placeholder="you@university.edu"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-[var(--ink-secondary)] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[var(--ink-muted)]" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-9 pr-3 py-2 text-xs border border-[var(--line)] rounded-lg bg-[var(--surface)] text-[var(--ink)] placeholder-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-3.5 w-3.5 text-[var(--brand)] focus:ring-[var(--brand)] border-[var(--line)] rounded bg-[var(--surface)]"
                />
                <label htmlFor="remember-me" className="ml-2 text-[var(--ink-muted)]">
                  Remember me
                </label>
              </div>

              <div>
                <a href="#" className="font-semibold text-[var(--brand)] hover:underline">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-xs font-bold rounded-lg text-[var(--ink)] bg-[var(--brand)] hover:bg-[color:var(--brand)]/90 focus:outline-none focus:ring-1 focus:ring-[var(--brand)] transition-all disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-3.5 w-3.5 text-[var(--ink)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Sign in
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                )}
              </button>
            </div>

            {message && (
              <div className={`rounded-lg p-3 text-xs font-medium text-center ${
                isError 
                  ? 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20' 
                  : 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'
              }`}>
                {message}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;