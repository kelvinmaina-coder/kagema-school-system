const db = require('../config/db');

// Get all fees
const getAllFees = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT f.*, s.name as student_name, s.grade, s.stream 
            FROM fees f
            JOIN students s ON f.student_id = s.id
            WHERE s.status = 'active'
            ORDER BY f.balance DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Get fees error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get fee summary
const getFeeSummary = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                SUM(total_fee) as total_expected,
                SUM(paid) as total_collected,
                SUM(balance) as total_outstanding,
                COUNT(*) as total_students
            FROM fees f
            JOIN students s ON f.student_id = s.id
            WHERE s.status = 'active'
        `);

        const summary = rows[0];
        if (summary.total_expected > 0) {
            summary.collection_rate = Math.round((summary.total_collected / summary.total_expected) * 100);
        } else {
            summary.collection_rate = 0;
        }

        res.json(summary);

    } catch (error) {
        console.error('Get fee summary error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Record payment
const recordPayment = async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        const { student_id, amount, payment_method, reference_number, payment_date } = req.body;
        const receipt_number = 'RCP' + Date.now().toString().slice(-8);

        await connection.beginTransaction();

        await connection.query(
            `INSERT INTO payments (student_id, amount, payment_method, reference_number, payment_date, receipt_number) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [student_id, amount, payment_method, reference_number, payment_date, receipt_number]
        );

        await connection.query(
            'UPDATE fees SET paid = paid + ? WHERE student_id = ?',
            [amount, student_id]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Payment recorded successfully',
            receipt_number
        });

    } catch (error) {
        await connection.rollback();
        console.error('Record payment error:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        connection.release();
    }
};

// Get fee structure
const getFeeStructure = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM fee_structure ORDER BY grade');
        res.json(rows);
    } catch (error) {
        console.error('Get fee structure error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllFees,
    getFeeSummary,
    recordPayment,
    getFeeStructure
};