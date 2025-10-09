import React, { useState, useEffect } from 'react';
import { updateMenteeAcademics } from '../../../services/mentorService';

function UpdateMenteeForm({ student, onUpdateSuccess }) {
  const [formData, setFormData] = useState({
    CGPA: '',
    Attendance: '',
    Backlogs: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // Pre-fill the form with the student's current data when the component loads
  useEffect(() => {
    if (student && student.riskInputs) {
      setFormData({
        CGPA: student.riskInputs.CGPA || '',
        Attendance: student.riskInputs.Attendance || '',
        Backlogs: student.riskInputs.Backlogs || '0',
      });
    }
  }, [student]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Updating...');
    setIsError(false);
    try {
      await updateMenteeAcademics(student._id, formData);
      setMessage('Academic details updated successfully!');
      // Notify the parent component that an update occurred
      if(onUpdateSuccess) onUpdateSuccess();
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setIsError(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg space-y-4">
      <h3 className="text-xl font-semibold mb-4">Update Academic Details</h3>
      <div>
        <label htmlFor="CGPA" className="block mb-2 text-sm font-medium">CGPA</label>
        <input type="number" step="0.01" name="CGPA" value={formData.CGPA} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded-md" />
      </div>
      <div>
        <label htmlFor="Attendance" className="block mb-2 text-sm font-medium">Attendance (%)</label>
        <input type="number" name="Attendance" value={formData.Attendance} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded-md" />
      </div>
      <div>
        <label htmlFor="Backlogs" className="block mb-2 text-sm font-medium">Current Backlogs</label>
        <input type="number" name="Backlogs" value={formData.Backlogs} onChange={handleChange} className="w-full p-2 bg-gray-700 rounded-md" />
      </div>
      <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        Save Changes
      </button>
      {message && <p className={`mt-4 text-center ${isError ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
    </form>
  );
}

export default UpdateMenteeForm;