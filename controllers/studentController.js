const db = require('../config/db');

// Get all students
const getAllStudents = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT s.*, f.total_fee, f.paid, f.balance, f.status as fee_status
            FROM students s 
            LEFT JOIN fees f ON s.id = f.student_id 
            WHERE s.status = 'active'
            ORDER BY s.grade, s.stream, s.name
        `);
        res.json(rows);
    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get student by ID
const getStudentById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [rows] = await db.query(
            'SELECT * FROM students WHERE id = ?',
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const [feeRows] = await db.query(
            'SELECT * FROM fees WHERE student_id = ?',
            [id]
        );

        const [assessmentRows] = await db.query(
            'SELECT * FROM assessments WHERE student_id = ? ORDER BY subject, type',
            [id]
        );

        const student = rows[0];
        student.fee = feeRows[0] || null;
        student.assessments = assessmentRows;

        res.json(student);

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new student
const createStudent = async (req, res) => {
    try {
        const {
            id, name, dob, upi, grade, stream, birth_cert, birth_place,
            county, sub_county, religion, blood_group, father_name, father_phone,
            mother_name, mother_phone, emergency_phone, medical_notes, prev_school
        } = req.body;

        const [existing] = await db.query(
            'SELECT id FROM students WHERE id = ? OR upi = ?',
            [id, upi]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Student with this ID or UPI already exists' });
        }

        await db.query(
            `INSERT INTO students (
                id, name, dob, upi, grade, stream, birth_cert, birth_place,
                county, sub_county, religion, blood_group, father_name, father_phone,
                mother_name, mother_phone, emergency_phone, medical_notes, prev_school,
                admission_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE(), 'active')`,
            [id, name, dob, upi, grade, stream, birth_cert, birth_place,
             county, sub_county, religion, blood_group, father_name, father_phone,
             mother_name, mother_phone, emergency_phone, medical_notes, prev_school]
        );

        const [feeStructure] = await db.query(
            'SELECT total FROM fee_structure WHERE grade = ?',
            [grade]
        );

        const totalFee = feeStructure.length > 0 ? feeStructure[0].total : 55000;

        await db.query(
            'INSERT INTO fees (student_id, total_fee, paid, balance, status) VALUES (?, ?, 0, ?, "partial")',
            [id, totalFee, totalFee]
        );

        res.status(201).json({ 
            message: 'Student created successfully',
            studentId: id 
        });

    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update student
const updateStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const [result] = await db.query(
            `UPDATE students SET 
                name = ?, dob = ?, grade = ?, stream = ?,
                father_name = ?, father_phone = ?,
                mother_name = ?, mother_phone = ?,
                emergency_phone = ?, medical_notes = ?
            WHERE id = ?`,
            [updates.name, updates.dob, updates.grade, updates.stream,
             updates.father_name, updates.father_phone,
             updates.mother_name, updates.mother_phone,
             updates.emergency_phone, updates.medical_notes, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student updated successfully' });

    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete student (move to alumni)
const deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const [student] = await db.query('SELECT * FROM students WHERE id = ?', [id]);

        if (student.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await db.query(
            `INSERT INTO alumni (student_id, name, last_grade, last_stream, year_left, reason) 
             VALUES (?, ?, ?, ?, YEAR(CURDATE()), ?)`,
            [id, student[0].name, student[0].grade, student[0].stream, reason || 'Transferred']
        );

        await db.query('DELETE FROM students WHERE id = ?', [id]);

        res.json({ message: 'Student moved to alumni successfully' });

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Search students
const searchStudents = async (req, res) => {
    try {
        const { q } = req.query;
        
        const [rows] = await db.query(
            `SELECT * FROM students 
             WHERE (name LIKE ? OR id LIKE ? OR upi LIKE ?)
             AND status = 'active'
             LIMIT 20`,
            [`%${q}%`, `%${q}%`, `%${q}%`]
        );

        res.json(rows);

    } catch (error) {
        console.error('Search students error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    searchStudents
};