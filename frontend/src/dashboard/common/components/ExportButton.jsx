import React, { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { API_BASE_URL } from '../../../utils/api';

const ExportButton = ({ studentId, studentName, type = 'button' }) => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleExportPDF = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/mentors/report/pdf/${studentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${studentName || 'student'}_report_${new Date().toISOString().split('T')[0]}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('PDF export error:', error);
            alert('Failed to generate PDF');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/mentors/report/csv/${studentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${studentName || 'student'}_data_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('CSV export error:', error);
            alert('Failed to export CSV');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateAIReport = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/mentors/report`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ focus_area: 'general' })
            });

            const data = await response.json();
            if (data.success) {
                // Display report in a modal or download
                const blob = new Blob([data.report], { type: 'text/plain' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `class_report_${new Date().toISOString().split('T')[0]}.txt`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('AI report error:', error);
            alert('Failed to generate AI report');
        } finally {
            setLoading(false);
        }
    };

    if (type === 'dropdown') {
        return (
            <div className="relative group">
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] hover:bg-[var(--surface)] text-[var(--ink)] rounded-lg font-medium transition-colors"
                    disabled={loading}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    Export
                </button>

                <div className="absolute right-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--line)] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <button
                        onClick={handleExportPDF}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface)] text-[var(--ink)] text-left transition-colors"
                        disabled={loading}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Export as PDF</span>
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface)] text-[var(--ink)] text-left transition-colors"
                        disabled={loading}
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Export as CSV</span>
                    </button>
                    {!studentId && (
                        <button
                            onClick={handleGenerateAIReport}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--surface)] text-[var(--ink)] text-left transition-colors border-t border-[var(--line)]"
                            disabled={loading}
                        >
                            <FileText className="w-4 h-4 text-[var(--brand)]" />
                            <span>AI Class Report</span>
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--danger-muted)] hover:bg-[var(--danger-muted)] text-[var(--ink)] rounded-lg font-medium transition-colors"
                disabled={loading}
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                PDF
            </button>
            <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--success-muted)] hover:bg-[var(--success-muted)] text-[var(--ink)] rounded-lg font-medium transition-colors"
                disabled={loading}
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                CSV
            </button>
        </div>
    );
};

export default ExportButton;
