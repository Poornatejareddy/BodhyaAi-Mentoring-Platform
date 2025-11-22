import React, { useState, useEffect } from 'react';
import {
  getStudentProfile,
  updateStudentProfile
} from '../../../services/studentService';

// Convert mongoose Map/objects safely
const mapToObject = (data) => {
  if (!data) return {};
  if (typeof data === 'object') return data;
  return {};
};

const SEMESTER_KEYS = ['Sem1', 'Sem2', 'Sem3', 'Sem4', 'Sem5', 'Sem6', 'Sem7', 'Sem8'];
const IAT_KEYS = ['IAT1', 'IAT2', 'IAT3'];

function StudentProfilePage() {
  const [formData, setFormData] = useState({
    name: "",
    usn: "",
    department: "",
    section: "",

    sgpa: {},
    iat: {},

    HasSiblings: '0',
    InternetAccess: '0',
    PartTimeJob: '0',
  });

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  // -------------------------
  // Load Real Data From API
  // -------------------------
  useEffect(() => {
    getStudentProfile()
      .then(data => {
        const baseData = data.riskInputs || {};
        const academic = data.academicHistory || {};
        const support = data.supportEngagement || {};

        setFormData({
          // new core fields
          name: data.name || data.user?.name || "",
          usn: data.usn || "",
          department: data.department || "",
          section: data.section || "",

          // risk inputs
          ...baseData,

          // academic maps
          sgpa: mapToObject(academic.sgpa),
          iat: mapToObject(academic.internalAssessments),

          parentEducation: academic.parentEducation || "",

          // engagement
          clubParticipation: support.clubParticipation || 0,
          mentorMeetings: support.mentorMeetings || 0,
          counselingSessions: support.counselingSessions || 0,

          // convert int → select-friendly strings
          HasSiblings: String(baseData.HasSiblings ?? '0'),
          InternetAccess: String(baseData.InternetAccess ?? '0'),
          PartTimeJob: String(baseData.PartTimeJob ?? '0'),
        });

        setLoading(false);
      })
      .catch(() => {
        setMessage('Failed to load profile data.');
        setIsError(true);
        setLoading(false);
      });
  }, []);

  // -------------------------
  // Input Handler
  // -------------------------
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let finalValue = value;
    if (type === 'number' || SEMESTER_KEYS.includes(name) || IAT_KEYS.includes(name)) {
      finalValue = value === '' ? '' : parseFloat(value);
    }

    setFormData(prev => {
      if (SEMESTER_KEYS.includes(name)) {
        return { ...prev, sgpa: { ...prev.sgpa, [name]: finalValue } };
      }
      if (IAT_KEYS.includes(name)) {
        return { ...prev, iat: { ...prev.iat, [name]: finalValue } };
      }
      return { ...prev, [name]: finalValue };
    });
  };

  // -------------------------
  // Submit Handler
  // -------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Updating...');
    setIsError(false);

    try {
      const payload = {
        ...formData,

        sgpa: formData.sgpa,
        iat: formData.iat,

        // convert select values
        HasSiblings: parseInt(formData.HasSiblings),
        InternetAccess: parseInt(formData.InternetAccess),
        PartTimeJob: parseInt(formData.PartTimeJob),
      };

      await updateStudentProfile(payload);

      setMessage('Profile updated successfully!');
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Failed to update profile');
    }
  };

  // -------------------------
  // UI Loading Screen
  // -------------------------
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
        <div className="animate-spin h-10 w-10 rounded-full border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3">Loading profile...</p>
      </div>
    );
  }

  // -------------------------
  // Helper Components
  // -------------------------
  const renderInputField = (name, label, type = "number", props = {}) => (
    <div className="mb-4" key={name}>
      <label className="block text-sm mb-1 text-gray-300">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name] ?? ''}
        onChange={handleChange}
        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 ring-blue-500"
        {...props}
      />
    </div>
  );

  const renderNestedField = (group, key, label) => (
    <div className="mb-4" key={key}>
      <label className="block text-sm mb-1 text-gray-300">{label}</label>
      <input
        type="number"
        name={key}
        value={formData[group]?.[key] ?? ''}
        onChange={handleChange}
        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 ring-blue-500"
        step="0.1"
      />
    </div>
  );

  const renderSelectField = (name, label, options) => (
    <div className="mb-4" key={name}>
      <label className="block text-sm mb-1 text-gray-300">{label}</label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:ring-2 ring-blue-500"
      >
        {options.map(([val, text]) => (
          <option key={val} value={val}>{text}</option>
        ))}
      </select>
    </div>
  );

  // -------------------------
  // MAIN UI
  // -------------------------
  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold mb-8 text-blue-400">Update Your Profile</h1>

        <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-xl shadow-lg">

          {message && (
            <p className={`p-4 mb-6 rounded-lg ${isError ? 'bg-red-900/50 text-red-300' : 'bg-green-900/50 text-green-300'}`}>
              {message}
            </p>
          )}

          {/* ------------------ Basic Info ------------------ */}
          <section className="border-b border-gray-700 pb-8 mb-8">
            <h2 className="text-2xl mb-4 font-semibold">Basic Details</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {renderInputField('name', 'Full Name', 'text')}
              {renderInputField('usn', 'USN', 'text')}
              {renderInputField('department', 'Department', 'text')}
              {renderInputField('section', 'Section', 'text')}
            </div>
          </section>

          {/* ------------------ Academic ------------------ */}
          <section className="border-b border-gray-700 pb-8 mb-8">
            <h2 className="text-2xl mb-4 font-semibold">Academic Data</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {renderInputField('CGPA', 'Cumulative GPA')}
              {renderInputField('Attendance', 'Attendance (%)', "number", { max: 100 })}
            </div>

            <h3 className="text-lg mt-6 mb-3 font-medium">Semester SGPA</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SEMESTER_KEYS.map(k => renderNestedField('sgpa', k, k))}
            </div>

            <h3 className="text-lg mt-6 mb-3 font-medium">IAT Scores</h3>
            <div className="grid grid-cols-3 gap-4">
              {IAT_KEYS.map(k => renderNestedField('iat', k, k))}
            </div>
          </section>

          {/* ------------------ Lifestyle ------------------ */}
          <section className="border-b border-gray-700 pb-8 mb-8">
            <h2 className="text-2xl mb-4 font-semibold">Lifestyle & Socio-Economic</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {renderInputField('StressScore', 'Stress Score')}
              {renderInputField('SleepHours', 'Sleep Hours')}
              {renderInputField('StudyHoursPerDay', 'Study Hours')}
              {renderInputField('FatherIncome', "Father's Income")}
              {renderInputField('MotherIncome', "Mother's Income")}
              {renderInputField('MentalHealthIndex', 'Mental Health Index')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              {renderSelectField('InternetAccess', 'Internet Access?', [['1', 'Yes'], ['0', 'No']])}
              {renderSelectField('PartTimeJob', 'Part Time Job?', [['1', 'Yes'], ['0', 'No']])}
              {renderInputField('SocialHours', 'Weekly Social Hours')}
            </div>
          </section>

          {/* ------------------ Engagement ------------------ */}
          <section className="border-b border-gray-700 pb-8 mb-8">
            <h2 className="text-2xl mb-4 font-semibold">Engagement</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {renderInputField('ExerciseHours', 'Exercise Hours')}
              {renderInputField('ScreenTime', 'Daily Screen Time')}
              {renderInputField('parentEducation', 'Parent Education', 'text')}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              {renderInputField('clubParticipation', 'Club Participation')}
              {renderInputField('mentorMeetings', 'Mentor Meetings')}
              {renderInputField('counselingSessions', 'Counseling Sessions')}
            </div>
          </section>

          {/* ------------------ Family ------------------ */}
          <section className="pb-6 mb-6">
            <h2 className="text-2xl mb-4 font-semibold">Family</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {renderSelectField('HasSiblings', 'Have Siblings?', [['0', 'No'], ['1', 'Yes']])}
              {formData.HasSiblings === '1' &&
                renderInputField('SiblingCount', 'Number of Siblings')
              }
            </div>
          </section>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 py-4 rounded-lg mt-8 font-bold text-lg transition-all hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Save Profile
          </button>

        </form>
      </div>
    </div>
  );
}

export default StudentProfilePage;
