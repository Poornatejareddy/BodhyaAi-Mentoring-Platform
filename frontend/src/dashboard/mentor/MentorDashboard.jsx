import React from 'react';
import { Outlet } from 'react-router-dom';
import FloatingChatButton from '../../components/FloatingChatButton';
import { Users, UserCheck, AlertCircle, TrendingUp } from 'lucide-react';

function MentorDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section - Matches login/register design */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Mentor Dashboard</h1>
                <p className="text-blue-100 text-sm mt-1">Guide and support your mentees</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden md:flex gap-6">
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-green-200" />
                  <div>
                    <p className="text-xs text-green-200">Total Mentees</p>
                    <p className="text-xl font-bold text-white">12</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-200" />
                  <div>
                    <p className="text-xs text-yellow-200">At Risk</p>
                    <p className="text-xl font-bold text-white">3</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm px-6 py-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-200" />
                  <div>
                    <p className="text-xs text-blue-200">Avg CGPA</p>
                    <p className="text-xl font-bold text-white">7.8</p>
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

export default MentorDashboard;