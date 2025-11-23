import React, { useState } from 'react';

const MentorAIReport = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [focusArea, setFocusArea] = useState('general');

    const generateReport = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('authToken');
            // Using relative path if proxy is set up, otherwise full URL
            // Assuming backend is on port 5000 based on previous files
            const response = await fetch('http://localhost:5000/api/llm/class-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ focusArea })
            });

            const data = await response.json();

            if (data.success) {
                setReport(data.report);
            } else {
                throw new Error(data.message || 'Failed to generate report');
            }
        } catch (err) {
            setError(err.message || 'Failed to generate report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">AI Class Performance Report</h2>

            <div className="flex gap-4 mb-4">
                <select
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                    <option value="general">General Overview</option>
                    <option value="risk">Risk Analysis</option>
                    <option value="attendance">Attendance Focus</option>
                    <option value="academic">Academic Performance</option>
                </select>

                <button
                    onClick={generateReport}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>

            {error && <div className="text-red-500 mb-4">{error}</div>}

            {report && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600">
                    <h3 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">Report Insights:</h3>
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-gray-600 dark:text-gray-300">
                        {report}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorAIReport;
