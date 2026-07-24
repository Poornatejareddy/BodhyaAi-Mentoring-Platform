import React, { useState } from 'react';
import { API_BASE_URL } from '../../../utils/api';

const MentorAIReport = () => {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [focusArea, setFocusArea] = useState('general');

    const generateReport = async () => {
        setLoading(true);
        setError(null);
        setReport(null);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_BASE_URL}/llm/class-report`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ focusArea })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to generate report');
            }

            // The report text lives at data.data.report
            const reportText = data.data?.report;
            if (reportText) {
                setReport(reportText);
            } else {
                throw new Error('Report was generated but contained no content. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'Failed to generate report. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[var(--surface)] bg-[var(--surface)] p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4 text-[var(--ink)] text-[var(--ink)]">AI Class Performance Report</h2>

            <div className="flex gap-4 mb-4">
                <select
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="p-2 border rounded bg-[var(--surface)] text-[var(--ink)] border-[var(--line)]"
                >
                    <option value="general">General Overview</option>
                    <option value="risk">Risk Analysis</option>
                    <option value="attendance">Attendance Focus</option>
                    <option value="academic">Academic Performance</option>
                </select>

                <button
                    onClick={generateReport}
                    disabled={loading}
                    className="px-4 py-2 bg-[var(--brand)] text-[var(--ink)] rounded hover:bg-[var(--brand)] disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Generating...' : 'Generate Report'}
                </button>
            </div>

            {error && <div className="text-[var(--danger)] mb-4">{error}</div>}

            {report && (
                <div className="mt-4 p-4 bg-[var(--surface)] bg-[var(--surface)] rounded border border-[var(--line)]">
                    <h3 className="font-semibold mb-2 text-[var(--ink)] text-[var(--ink)]">Report Insights:</h3>
                    <div className="prose prose-invert max-w-none whitespace-pre-wrap text-[var(--ink)] text-[var(--ink)]">
                        {report}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentorAIReport;
