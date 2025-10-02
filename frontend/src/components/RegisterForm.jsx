import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsError(false);
    setMessage('Registering...');
    try {
      await registerUser(name, email, password, role);
      setMessage('Registration successful! Please log in.');
      setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 secs
    } catch (error) {
      setIsError(true);
      setMessage(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-white">Register</h2>
      <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-4 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="student">Student</option>
        <option value="mentor">Mentor</option>
      </select>
      <button type="submit" className="w-full py-2 font-semibold text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700">Register</button>
      {message && <p className={`text-center ${isError ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
      <p className="text-sm text-center text-gray-400">
        Already have an account? <Link to="/login" className="font-medium text-blue-400 hover:underline">Login</Link>
      </p>
    </form>
  );
}

export default RegisterForm;