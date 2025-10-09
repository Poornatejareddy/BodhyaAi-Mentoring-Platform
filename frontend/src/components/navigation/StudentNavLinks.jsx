import React from 'react';
import { NavLink } from 'react-router-dom';

function StudentNavLinks() {
    const baseLinkClass = "flex items-center p-2 space-x-3 rounded-md hover:bg-gray-700";
    const activeLinkClass = "bg-gray-700 font-bold";

  return (
    <>
      <NavLink to="/dashboard/student/overview" className={({isActive}) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}>
        <span>👤</span>
        <span>Overview</span>
      </NavLink>
      <NavLink to="/dashboard/student/survey" className={({isActive}) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}>
        <span>📝</span>
        <span>Take Survey</span>
      </NavLink>
      <NavLink to="/dashboard/student/profile" className={({isActive}) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}>
        <span>⚙️</span>
        <span>Profile</span>
      </NavLink>
    </>
  );
}

export default StudentNavLinks;