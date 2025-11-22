import React, { useState } from 'react';
import { User, Bell, Shield, Save } from 'lucide-react';

function MentorSettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    weeklyReport: true
  });

  const handleToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Settings</h2>
          <p className="text-gray-400 mt-1">Manage your account preferences and profile.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Profile Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <User className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Profile Information</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <input
                type="email"
                defaultValue="john.doe@example.com"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
              <textarea
                rows="3"
                defaultValue="Senior Mentor specializing in Full Stack Development."
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <Bell className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-400">Receive updates about your mentees via email.</p>
            </div>
            <button
              onClick={() => handleToggle('email')}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div>
              <h4 className="text-white font-medium">Push Notifications</h4>
              <p className="text-sm text-gray-400">Get real-time alerts on your dashboard.</p>
            </div>
            <button
              onClick={() => handleToggle('push')}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications.push ? 'bg-blue-600' : 'bg-gray-600'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <Shield className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">Security</h3>
        </div>
        <div className="p-6">
          <button className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}

export default MentorSettingsPage;