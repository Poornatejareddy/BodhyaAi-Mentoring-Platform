import React, { useState } from 'react';
import { Moon, Sun, Bell, Lock, Shield, Smartphone, Globe, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSocket } from '../../context/SocketContext';

const SettingsPage = () => {
    const [notifications, setNotifications] = useState({
        email: true,
        push: typeof Notification !== 'undefined' && Notification.permission === 'granted',
        updates: false,
    });

    const { theme, setTheme } = useTheme();
    const { requestNotificationPermission } = useSocket();

    const handleNotificationChange = async (key) => {
        if (key === 'push' && !notifications.push) {
            const permission = await requestNotificationPermission();
            if (permission !== 'granted') return;
        }

        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold text-[var(--ink)] mb-8">Settings</h1>

            {/* Appearance */}
            <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--line)] rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-[var(--brand)]" />
                    Appearance
                </h2>
                <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                    <div>
                        <p className="text-[var(--ink)] font-medium">Theme Mode</p>
                        <p className="text-sm text-[var(--ink)]">Select your preferred interface theme</p>
                    </div>
                    <div className="flex bg-[var(--surface-hover)] rounded-lg p-1 border border-[var(--line)]">
                        <button
                            onClick={() => setTheme('light')}
                            aria-label="Use light theme"
                            className={`p-2 rounded-md transition-all ${theme === 'light' ? 'bg-[var(--surface)] text-[var(--brand)] shadow-sm' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`}
                        >
                            <Sun className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setTheme('dark')}
                            aria-label="Use dark theme"
                            className={`p-2 rounded-md transition-all ${theme === 'dark' ? 'bg-[var(--surface)] text-[var(--brand)] shadow-sm' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`}
                        >
                            <Moon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setTheme('system')}
                            aria-label="Use system theme"
                            className={`p-2 rounded-md transition-all ${theme === 'system' ? 'bg-[var(--surface)] text-[var(--brand)] shadow-sm' : 'text-[var(--ink-muted)] hover:text-[var(--ink)]'}`}
                        >
                            <Monitor className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Notifications */}
            <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--line)] rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[var(--brand)]" />
                    Notifications
                </h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--brand)] rounded-lg">
                                <Globe className="w-5 h-5 text-[var(--brand)]" />
                            </div>
                            <div>
                                <p className="text-[var(--ink)] font-medium">Email Notifications</p>
                                <p className="text-sm text-[var(--ink)]">Receive updates via email</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.email}
                                onChange={() => handleNotificationChange('email')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-[var(--surface)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--brand)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--line)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--surface)] after:border-[var(--line)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand)]"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[var(--brand)] rounded-lg">
                                <Smartphone className="w-5 h-5 text-[var(--brand)]" />
                            </div>
                            <div>
                                <p className="text-[var(--ink)] font-medium">Push Notifications</p>
                                <p className="text-sm text-[var(--ink)]">Receive alerts on your device</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifications.push}
                                onChange={() => handleNotificationChange('push')}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-[var(--surface)] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[var(--brand)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-[var(--line)] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--surface)] after:border-[var(--line)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand)]"></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-[var(--surface)] backdrop-blur-xl border border-[var(--line)] rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-[var(--ink)] mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--success)]" />
                    Security
                </h2>
                <div className="p-4 bg-[var(--surface)] rounded-xl border border-[var(--line)]">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[var(--ink)] font-medium">Password</p>
                            <p className="text-sm text-[var(--ink)]">Last changed 3 months ago</p>
                        </div>
                        <button className="px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface)] text-[var(--ink)] rounded-lg transition-colors text-sm font-medium">
                            Change Password
                        </button>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[var(--ink)] font-medium">Two-Factor Authentication</p>
                            <p className="text-sm text-[var(--ink)]">Add an extra layer of security</p>
                        </div>
                        <button className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand)] text-[var(--ink)] rounded-lg transition-colors text-sm font-medium">
                            Enable 2FA
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
