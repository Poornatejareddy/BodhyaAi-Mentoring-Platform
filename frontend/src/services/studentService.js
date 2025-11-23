const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return { 'Authorization': `Bearer ${token}` };
};

export const getStudentProfile = async () => {
  const response = await fetch(`${API_URL}/students/my-profile`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data.data;
};

// ... getStudentProfile function

export const updateStudentProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/students/my-profile`, {
    method: 'PUT',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update profile');
  return data.data;
};

export const submitSurvey = async (answers) => {
  const response = await fetch(`${API_URL}/students/my-profile/survey`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to submit survey');
  return data.data;
};

export const getStudentInterventions = async (studentId) => {
  const response = await fetch(`${API_URL}/interventions/student/${studentId}`, {
    headers: getAuthHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch interventions');
  return data.data;
};