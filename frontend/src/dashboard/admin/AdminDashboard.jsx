import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

function AdminDashboard() {
  return (
    <div className="w-full text-white">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
      </header>
      <main>
        <p>Welcome to the admin control panel!</p>
      </main>
    </div>
  );
}

export default AdminDashboard;