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
          <h2 className="text-3xl font-bold text-[var(--ink)]">Settings</h2>
          <p className="text-[var(--ink)] mt-1">Manage your account preferences and profile.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand)] text-[var(--ink)] rounded-lg font-medium transition-colors">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Profile Section */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] shadow-lg overflow-hidden">
        <div className="p-6 border-b border-[var(--line)] flex items-center gap-3">
          <User className="w-5 h-5 text-[var(--brand)]" />
          <h3 className="text-lg font-semibold text-[var(--ink)]">Profile Information</h3>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">Full Name</label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-[var(--ink)] focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">Email Address</label>
              <input
                type="email"
                defaultValue="john.doe@example.com"
                className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-[var(--ink)] focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--ink)] mb-2">Bio</label>
              <textarea
                rows="3"
                defaultValue="Senior Mentor specializing in Full Stack Development."
                className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-lg px-4 py-2.5 text-[var(--ink)] focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] shadow-lg overflow-hidden">
        <div className="p-6 border-b border-[var(--line)] flex items-center gap-3">
          <Bell className="w-5 h-5 text-[var(--brand)]" />
          <h3 className="text-lg font-semibold text-[var(--ink)]">Notifications</h3>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-lg">
            <div>
              <h4 className="text-[var(--ink)] font-medium">Email Notifications</h4>
              <p className="text-sm text-[var(--ink)]">Receive updates about your mentees via email.</p>
            </div>
            <button
              onClick={() => handleToggle('email')}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-[var(--brand)]' : 'bg-[var(--surface)]'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-[var(--surface)] rounded-full transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-lg">
            <div>
              <h4 className="text-[var(--ink)] font-medium">Push Notifications</h4>
              <p className="text-sm text-[var(--ink)]">Get real-time alerts on your dashboard.</p>
            </div>
            <button
              onClick={() => handleToggle('push')}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications.push ? 'bg-[var(--brand)]' : 'bg-[var(--surface)]'}`}
            >
              <span className={`absolute top-1 left-1 w-4 h-4 bg-[var(--surface)] rounded-full transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--line)] shadow-lg overflow-hidden">
        <div className="p-6 border-b border-[var(--line)] flex items-center gap-3">
          <Shield className="w-5 h-5 text-[var(--success)]" />
          <h3 className="text-lg font-semibold text-[var(--ink)]">Security</h3>
        </div>
        <div className="p-6">
          <button className="text-[var(--brand)] hover:text-[var(--brand)] font-medium text-sm transition-colors">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}

export default MentorSettingsPage;