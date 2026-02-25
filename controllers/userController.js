const db = require('../config/db');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, username, name, role, professional_id, email, phone, department, status FROM users'
        );
        res.json(rows);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new user
const createUser = async (req, res) => {
    try {
        const { username, password, name, role, professional_id, email, phone, department } = req.body;

        const [existing] = await db.query(
            'SELECT id FROM users WHERE username = ?',
            [username]
        );

        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        await db.query(
            `INSERT INTO users (username, password, name, role, professional_id, email, phone, department) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [username, password, name, role, professional_id, email, phone, department]
        );

        res.status(201).json({ message: 'User created successfully' });

    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    createUser
};