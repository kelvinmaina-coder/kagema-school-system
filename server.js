const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const userRoutes = require('./routes/userRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
require('./config/db');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assessments', assessmentRoutes);

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Kagema School API is working!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Kagema School Backend Server`);
    console.log(`=================================`);
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🔗 Test API: http://localhost:${PORT}/api/test`);
    console.log(`🔗 Auth API: http://localhost:${PORT}/api/auth/login`);
    console.log(`🔗 Students API: http://localhost:${PORT}/api/students`);
    console.log(`🔗 Fees API: http://localhost:${PORT}/api/fees`);
    console.log(`=================================\n`);
});