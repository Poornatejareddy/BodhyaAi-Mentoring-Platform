import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getMe } from '../services/authService';
import { Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
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
            navigate('/dashboard/admin');
            break;
          case 'mentor':
            navigate('/dashboard/mentor/mentees');
            break;
          case 'student':
            navigate('/dashboard/student');
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
    <div className="min-h-screen flex bg-gray-900">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-blue-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 to-purple-900/90"></div>

        <div className="relative z-10 flex flex-col justify-between p-16 text-white h-full">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <img src={logo} alt="BodhyaAI" className="h-10 w-auto" />
              <span className="text-2xl font-bold tracking-tight">BodhyaAI</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Welcome back to <br />
              <span className="text-blue-300">Smart Mentoring</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-md">
              Log in to access your personalized dashboard, track progress, and connect with your mentors.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-blue-100">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Secure & Private Access</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Real-time Analytics</span>
            </div>
            <div className="flex items-center gap-3 text-blue-100">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>24/7 AI Support</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-900">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-white">Sign in to your account</h2>
            <p className="mt-2 text-gray-400">
              Or <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 hover:underline">create a new account</Link> if you don't have one.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl leading-5 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl leading-5 bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>

            {message && (
              <div className={`rounded-lg p-4 text-sm font-medium text-center ${isError ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-green-900/30 text-green-400 border border-green-800'}`}>
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