import React, { useState } from 'react';
import { Moon, Sun, Bell, Lock, Shield, Smartphone, Globe } from 'lucide-react';

const SettingsPage = () => {
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        updates: false,
    });

    const [theme, setTheme] = useState('dark');

    const handleNotificationChange = (key) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

            {/* Appearance */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-blue-400" />
                    Appearance
                </h2>
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                    <div>
                        <p className="text-white font-medium">Theme Mode</p>
                        <p className="text-sm text-gray-400">Select your preferred interface theme</p>
                    </div>
                    <div className="flex bg-gray-800 rounded-lg p-1 border border-gray-700">
                        <button
                            onClick={() => setTheme('light')}
                            className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Sun className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Moon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-purple-400" />
                    Notifications
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Globe className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Email Notifications</p>
                                <p className="text-sm text-gray-400">Receive updates via email</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.email}
                                onChange={() => handleNotificationChange('email')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Smartphone className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-white font-medium">Push Notifications</p>
                                <p className="text-sm text-gray-400">Receive alerts on your device</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.push}
                                onChange={() => handleNotificationChange('push')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-400" />
                    Security
                </h2>
                <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-white font-medium">Password</p>
                            <p className="text-sm text-gray-400">Last changed 3 months ago</p>
                        </div>
                        <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium">
                            Change Password
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-gray-400">Add an extra layer of security</p>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
                            Enable 2FA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
