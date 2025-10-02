import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="text-center">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
        Welcome to BodhyaAI
      </h1>
      <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
        An AI-powered mentoring platform to predict academic risks and support student success.
      </p>
      <div className="flex justify-center space-x-4">
        <Link 
          to="/login" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
        >
          Register
        </Link>
      </div>
    </div>
  );
}

export default HomePage;