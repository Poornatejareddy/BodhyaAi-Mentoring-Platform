import React from 'react';

function TopNav() {
  return (
    <header className="w-full p-4 bg-gray-800 rounded-lg mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Welcome Back!</h1>
        </div>
        <div>
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            {/* User Avatar/Icon */}
            <span>U</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopNav;