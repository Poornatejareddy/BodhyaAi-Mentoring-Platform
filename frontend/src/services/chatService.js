import { API_BASE_URL } from '../utils/api';

const API_URL = API_BASE_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

export const sendMessage = async (message) => {
  const response = await fetch(`${API_URL}/chat/ai-chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to get a response');
  // The backend returns data.data.content for AI messages
  return data.data?.content || data.reply || data.message || 'No response received';
};