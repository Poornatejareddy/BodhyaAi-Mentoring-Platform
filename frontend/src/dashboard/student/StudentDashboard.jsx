import React from 'react';
import { Outlet } from 'react-router-dom';
import FloatingChatButton from '../../components/FloatingChatButton';
import { GraduationCap, BookOpen, TrendingUp, MessageSquare } from 'lucide-react';

function StudentDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section - Matches login/register design */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
                <p className="text-blue-100 text-sm mt-1">Your academic success journey</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex gap-6">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-200" />
                  <div>
                    <p className="text-xs text-blue-200">Study Hours</p>
                    <p className="text-xl font-bold text-white">24/week</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-200" />
                  <div>
                    <p className="text-xs text-green-200">CGPA</p>
                    <p className="text-xl font-bold text-white">8.2</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* AI Chat Bot */}
      <FloatingChatButton />
    </div>
  );
}

export default StudentDashboard;