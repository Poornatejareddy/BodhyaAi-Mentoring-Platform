import React from 'react';
import { Outlet } from 'react-router-dom';
import logo from '../assets/logo.png'; // Or your logo path

function PublicLayout() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <header className="text-center mb-8">
        <img src={logo} className="h-24 mx-auto" alt="BodhyaAI logo" />
        <h1 className="text-4xl font-bold">BodhyaAI Portal</h1>
      </header>
      <main>
        {/* Outlet is a placeholder where the specific page component will be rendered */}
        <Outlet />
      </main>
    </div>
  );
}

export default PublicLayout;