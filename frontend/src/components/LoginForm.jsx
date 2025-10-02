import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getMe } from '../services/authService';

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsError(false);
    setMessage('Logging in...');

    try {
      const loginData = await loginUser(email, password);
      const userData = await getMe(loginData.token);

      login(userData.data, loginData.token);
      setMessage('Login successful!');

      switch (userData.data.role) {
        case 'admin':
          navigate('/dashboard/admin');
          break;
        case 'mentor':
          navigate('/dashboard/mentor/mentees'); // Corrected full path
          break;
        case 'student':
          navigate('/dashboard/student');
          break;
        default:
          navigate('/login');
      }
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-white">Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button type="submit" className="w-full py-2 font-semibold text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700">
        Login
      </button>
      {message && (
        <p className={`text-center ${isError ? 'text-red-400' : 'text-green-400'}`}>{message}</p>
      )}
      <p className="text-sm text-center text-gray-400">
        Don't have an account? <Link to="/register" className="font-medium text-blue-400 hover:underline">Register</Link>
      </p>
    </form>
  );
}

export default LoginForm;