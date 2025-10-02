import React, { useState, useEffect } from 'react';
import { getStudentProfile, updateStudentProfile } from '../../../services/studentService';

function StudentProfilePage() {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    getStudentProfile()
      .then(data => {
        // Set form data from the riskInputs object, or an empty object if it doesn't exist
        setFormData(data.riskInputs || {});
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setMessage("Failed to load profile data.");
        setIsError(true);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Updating...');
    setIsError(false);
    try {
      await updateStudentProfile(formData);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setIsError(true);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  // Helper for input fields to reduce repetition
  const renderInputField = (name, label, type = 'number', props = {}) => (
    <div>
      <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
      <input 
        id={name}
        type={type}
        name={name}
        value={formData[name] || ''}
        onChange={handleChange}
        className="w-full p-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Edit Your Profile</h2>
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Column 1 */}
          <div className="space-y-4">
            {renderInputField("StressScore", "Stress Score (1-5)", "number", { min: 1, max: 5 })}
            {renderInputField("SleepHours", "Average Sleep Hours per Night")}
            {renderInputField("StudyHoursPerDay", "Average Study Hours per Day")}
            {renderInputField("ExerciseHours", "Weekly Exercise Hours")}
            {renderInputField("ScreenTime", "Daily Screen Time (hours)")}
          </div>

          {/* Column 2 */}
          <div className="space-y-4">
            {renderInputField("MentalHealthIndex", "Mental Health Index (0-100)", "number", { min: 0, max: 100 })}
            {renderInputField("FatherIncome", "Father's Annual Income (INR)")}
            {renderInputField("MotherIncome", "Mother's Annual Income (INR)")}
            <div>
              <label htmlFor="HasSiblings" className="block mb-2 text-sm font-medium text-gray-300">Do you have siblings?</label>
              <select name="HasSiblings" value={formData.HasSiblings || '0'} onChange={handleChange} className="w-full p-2 text-white bg-gray-700 border border-gray-600 rounded-md">
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            
            {/* Conditionally render SiblingCount only if HasSiblings is '1' */}
            {formData.HasSiblings == '1' && (
              renderInputField("SiblingCount", "Number of Siblings")
            )}
          </div>
        </div>

        <div className="mt-6">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Save Changes
          </button>
          {message && <p className={`mt-4 ${isError ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}
        </div>
      </form>
    </div>
  );
}

export default StudentProfilePage;