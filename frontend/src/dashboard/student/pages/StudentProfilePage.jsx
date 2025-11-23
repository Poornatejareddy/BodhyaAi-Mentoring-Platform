import React, { useState, useEffect } from 'react';
import {
  getStudentProfile,
  updateStudentProfile
} from '../../../services/studentService';
import { UserCircle, Camera, Save, Loader } from 'lucide-react';

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
    profilePicture: "", // New field

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
          profilePicture: data.user?.profilePicture || "", // Load profile picture

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
      // Reload page to refresh sidebar image if changed
      setTimeout(() => window.location.reload(), 1000);
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
      <div className="flex justify-center items-center h-screen bg-transparent text-white">
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
      <label className="block text-sm mb-1 text-gray-400 font-medium">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name] ?? ''}
        onChange={handleChange}
        className="w-full p-3 bg-gray-900/50 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        {...props}
      />
    </div>
  );

  const renderNestedField = (group, key, label) => (
    <div className="mb-4" key={key}>
      <label className="block text-sm mb-1 text-gray-400 font-medium">{label}</label>
      <input
        type="number"
        name={key}
        value={formData[group]?.[key] ?? ''}
        onChange={handleChange}
        className="w-full p-3 bg-gray-900/50 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        step="0.1"
      />
    </div>
  );

  const renderSelectField = (name, label, options) => (
    <div className="mb-4" key={name}>
      <label className="block text-sm mb-1 text-gray-400 font-medium">{label}</label>
      <select
        name={name}
        value={formData[name]}
        onChange={handleChange}
        className="w-full p-3 bg-gray-900/50 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
    <div className="w-full max-w-6xl mx-auto space-y-8">

      {/* Header Section */}
      <div className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600 to-purple-600 opacity-20"></div>

        <div className="relative flex flex-col md:flex-row items-center gap-8 mt-4">
          {/* Profile Picture */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl">
              <div className="w-full h-full rounded-full bg-gray-900 overflow-hidden flex items-center justify-center">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="w-20 h-20 text-gray-500" />
                )}
              </div>
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full shadow-lg border-2 border-gray-900 cursor-pointer hover:bg-blue-500 transition-colors">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-bold text-white">{formData.name || 'Student Name'}</h1>
            <p className="text-blue-400 font-medium text-lg">{formData.usn || 'USN'}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-sm">
                {formData.department || 'Department'}
              </span>
              <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-sm">
                Section: {formData.section || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl">

        {message && (
          <div className={`p-4 mb-6 rounded-xl flex items-center gap-3 ${isError ? 'bg-red-500/10 text-red-300 border border-red-500/20' : 'bg-green-500/10 text-green-300 border border-green-500/20'}`}>
            {isError ? <div className="w-2 h-2 rounded-full bg-red-500"></div> : <div className="w-2 h-2 rounded-full bg-green-500"></div>}
            {message}
          </div>
        )}

        {/* ------------------ Basic Info ------------------ */}
        <section className="border-b border-gray-700/50 pb-8 mb-8">
          <h2 className="text-xl mb-6 font-semibold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
            Basic Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderInputField('name', 'Full Name', 'text')}
            {renderInputField('usn', 'USN', 'text')}
            {renderInputField('department', 'Department', 'text')}
            {renderInputField('section', 'Section', 'text')}
            {renderInputField('profilePicture', 'Profile Picture URL', 'text', { placeholder: 'https://example.com/photo.jpg' })}
          </div>
        </section>

        {/* ------------------ Academic ------------------ */}
        <section className="border-b border-gray-700/50 pb-8 mb-8">
          <h2 className="text-xl mb-6 font-semibold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            Academic Data
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderInputField('CGPA', 'Cumulative GPA')}
            {renderInputField('Attendance', 'Attendance (%)', "number", { max: 100 })}
          </div>

          <h3 className="text-lg mt-8 mb-4 font-medium text-gray-300">Semester SGPA</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {SEMESTER_KEYS.map(k => renderNestedField('sgpa', k, k))}
          </div>

          <h3 className="text-lg mt-8 mb-4 font-medium text-gray-300">IAT Scores</h3>
          <div className="grid grid-cols-3 gap-4">
            {IAT_KEYS.map(k => renderNestedField('iat', k, k))}
          </div>
        </section>

        {/* ------------------ Lifestyle ------------------ */}
        <section className="border-b border-gray-700/50 pb-8 mb-8">
          <h2 className="text-xl mb-6 font-semibold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-green-500 rounded-full"></span>
            Lifestyle & Socio-Economic
          </h2>

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
        <section className="border-b border-gray-700/50 pb-8 mb-8">
          <h2 className="text-xl mb-6 font-semibold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-orange-500 rounded-full"></span>
            Engagement
          </h2>

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
          <h2 className="text-xl mb-6 font-semibold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
            Family
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {renderSelectField('HasSiblings', 'Have Siblings?', [['0', 'No'], ['1', 'Yes']])}
            {formData.HasSiblings === '1' &&
              renderInputField('SiblingCount', 'Number of Siblings')
            }
          </div>
        </section>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 py-4 rounded-xl mt-8 font-bold text-lg text-white transition-all hover:shadow-2xl hover:scale-[1.01] flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          Save Profile Changes
        </button>

      </form>
    </div>
  );
}

export default StudentProfilePage;
