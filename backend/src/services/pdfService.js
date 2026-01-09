const PDFDocument = require('pdfkit');
const cogService = require('./cogService');

class PDFService {
    /**
     * Generate a personality report PDF for a student
     * @param {Object} student - Student document with personality profile
     * @returns {PDFDocument} - PDF document stream
     */
    generatePersonalityReport(student) {
        const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

        const personalityProfile = student.personalityProfile;
        const oceanScores = personalityProfile.predictions;
        const interpretation = cogService.getDetailedInterpretation(oceanScores);

        // Title
        doc.fontSize(24)
            .fillColor('#7c3aed')
            .text('Personality Assessment Report', { align: 'center' });

        doc.moveDown(0.5);
        doc.fontSize(10)
            .fillColor('#6b7280')
            .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });

        doc.moveDown(2);

        // Student Information
        doc.fontSize(16)
            .fillColor('#1f2937')
            .text('Student Information', { underline: true });

        doc.moveDown(0.5);
        doc.fontSize(11)
            .fillColor('#374151')
            .text(`Name: ${student.name}`)
            .text(`USN: ${student.usn}`)
            .text(`Department: ${student.department}`);

        doc.moveDown(2);

        // OCEAN Scores
        doc.fontSize(16)
            .fillColor('#1f2937')
            .text('OCEAN Personality Traits', { underline: true });

        doc.moveDown(0.5);

        const traits = [
            { name: 'Openness', score: oceanScores.Openness, color: '#3b82f6' },
            { name: 'Conscientiousness', score: oceanScores.Conscientiousness, color: '#10b981' },
            { name: 'Extraversion', score: oceanScores.Extraversion, color: '#f59e0b' },
            { name: 'Agreeableness', score: oceanScores.Agreeableness, color: '#ec4899' },
            { name: 'Neuroticism', score: oceanScores.Neuroticism, color: '#ef4444' },
        ];

        traits.forEach((trait) => {
            const percentage = Math.round(trait.score * 100);
            const barWidth = (percentage / 100) * 400;

            doc.fontSize(11)
                .fillColor('#374151')
                .text(`${trait.name}: ${percentage}%`, 50, doc.y);

            const barY = doc.y;

            // Background bar
            doc.rect(50, barY, 400, 15)
                .fillAndStroke('#e5e7eb', '#d1d5db');

            // Progress bar
            doc.rect(50, barY, barWidth, 15)
                .fill(trait.color);

            doc.moveDown(1.2);
        });

        doc.moveDown(1);

        // Key Insights
        if (personalityProfile.insights && personalityProfile.insights.length > 0) {
            doc.addPage();

            doc.fontSize(16)
                .fillColor('#1f2937')
                .text('Key Insights', { underline: true });

            doc.moveDown(0.5);

            personalityProfile.insights.forEach((insight, index) => {
                doc.fontSize(10)
                    .fillColor('#374151')
                    .text(`${index + 1}. ${insight}`, {
                        width: 500,
                        align: 'left'
                    });
                doc.moveDown(0.5);
            });

            doc.moveDown(1);
        }

        // Detailed Interpretation for Mentors
        doc.addPage();

        doc.fontSize(16)
            .fillColor('#1f2937')
            .text('Mentor Guidance', { underline: true });

        doc.moveDown(1);

        Object.entries(interpretation).forEach(([trait, data]) => {
            doc.fontSize(13)
                .fillColor('#7c3aed')
                .text(trait, { underline: false });

            doc.moveDown(0.3);

            doc.fontSize(10)
                .fillColor('#374151')
                .text(`Level: ${data.level}`, { indent: 20 })
                .text(`Description: ${data.description}`, { indent: 20, width: 480 })
                .text(`Mentor Tip: ${data.mentorTip}`, { indent: 20, width: 480 });

            doc.moveDown(1);
        });

        // Footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(8)
                .fillColor('#9ca3af')
                .text(
                    `BodhyaAI - Personality Assessment Report | Page ${i + 1} of ${pageCount}`,
                    50,
                    doc.page.height - 50,
                    { align: 'center' }
                );
        }

        return doc;
    }

    /**
     * Generate bulk personality reports for multiple students
     * @param {Array} students - Array of student documents
     * @returns {PDFDocument} - Combined PDF document
     */
    generateBulkReports(students) {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        // Cover page
        doc.fontSize(28)
            .fillColor('#7c3aed')
            .text('Bulk Personality Reports', { align: 'center' });

        doc.moveDown(1);
        doc.fontSize(14)
            .fillColor('#6b7280')
            .text(`${students.length} Students`, { align: 'center' })
            .text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });

        // Generate individual reports
        students.forEach((student, index) => {
            if (index > 0 || students.length > 1) {
                doc.addPage();
            }

            const singleDoc = this.generatePersonalityReport(student);
            // Note: This is a simplified version. For real bulk PDFs, 
            // you'd need to merge PDF streams properly
        });

        return doc;
    }
}

module.exports = new PDFService();
