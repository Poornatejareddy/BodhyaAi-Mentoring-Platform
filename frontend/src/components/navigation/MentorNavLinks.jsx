import React from 'react';
import { NavLink } from 'react-router-dom';

function MentorNavLinks() {
  const baseLinkClass = "flex items-center p-2 space-x-3 rounded-md hover:bg-gray-700";
  const activeLinkClass = "bg-gray-700 font-bold";

  return (
    <>
      <NavLink to="/dashboard/mentor/mentees" className={({isActive}) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}>
        <span>👥</span>
        <span>My Mentees</span>
      </NavLink>
      <NavLink to="/dashboard/mentor/assign-student" className={({isActive}) => `${baseLinkClass} ${isActive ? activeLinkClass : ''}`}>
        <span>➕</span>
        <span>Assign Student</span>
      </NavLink>
      {/* Add other mentor-specific links here */}
    </>
  );
}

export default MentorNavLinks;