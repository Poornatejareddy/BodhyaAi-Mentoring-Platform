import { getMe } from "./authService"; // We can reuse this logic if we want

import { API_BASE_URL } from '../utils/api';

const API_URL = API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};


export const getMyMentees = async () => {
  const response = await fetch(`${API_URL}/mentors/me`, { headers: getAuthHeaders() });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch mentees');
  
  // --- THIS IS THE FIX ---
  // Instead of returning the whole object (data.data),
  // return ONLY the 'mentees' array inside it.
  return data.data.mentees; 
};


export const getMenteeDetails = async (studentId) => {
  const response = await fetch(`${API_URL}/mentors/mentees/${studentId}`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch mentee details');
  const data = await response.json();
  return data.data;
};

export const triggerRiskCalculation = async (studentId) => {
    const response = await fetch(`${API_URL}/mentors/mentees/${studentId}/calculate-risk`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to calculate risk');
    const data = await response.json();
    return data.data;
}



export const getUnassignedStudents = async () => {
  const response = await fetch(`${API_URL}/students/unassigned`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to fetch unassigned students');
  const data = await response.json();
  return data.data;
};

export const assignStudentToSelf = async (studentId) => {
  const response = await fetch(`${API_URL}/mentors/me/assign-mentee`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ studentId }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to assign student');
  }
  return response.json();
};


export const updateMenteeAcademics = async (studentId, academicData) => {
  const response = await fetch(`${API_URL}/mentors/mentees/${studentId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(academicData), // { CGPA, Attendance, Backlogs }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update academics');
  return data.data;
};