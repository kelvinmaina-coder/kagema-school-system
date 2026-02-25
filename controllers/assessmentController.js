const db = require('../config/db');

// Get assessments for a student
const getStudentAssessments = async (req, res) => {
    try {
        const { studentId } = req.params;
        
        const [rows] = await db.query(
            'SELECT * FROM assessments WHERE student_id = ? ORDER BY subject, type',
            [studentId]
        );

        res.json(rows);

    } catch (error) {
        console.error('Get assessments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Save or update assessment
const saveAssessment = async (req, res) => {
    try {
        const { student_id, subject, type, term, score } = req.body;

        await db.query(
            `INSERT INTO assessments (student_id, subject, type, term, score) 
             VALUES (?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE score = ?`,
            [student_id, subject, type, term, score, score]
        );

        res.json({ message: 'Assessment saved successfully' });

    } catch (error) {
        console.error('Save assessment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getStudentAssessments,
    saveAssessment
};