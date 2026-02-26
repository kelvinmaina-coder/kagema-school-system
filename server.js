const express = require('express');
const cors = require('cors');
const app = express();

// Allow everyone to access your API
app.use(cors());
app.use(express.json());

// Welcome message - this is what you'll see at your main URL
app.get('/', (req, res) => {
    res.json({
        message: '🎓 Kagema School API is working!',
        howToUse: 'Add /api/students or /api/users to the URL',
        example: 'https://your-app.vercel.app/api/students'
    });
});

// Health check - to make sure server is running
app.get('/health', (req, res) => {
    res.json({ status: 'OK', time: new Date().toLocaleString() });
});

// ========================================
// YOUR API ROUTES
// ========================================

// Import your route files
try {
    const authRoutes = require('./routes/authRoutes');
    app.use('/api/auth', authRoutes);
} catch (e) { console.log('Auth routes not loaded yet'); }

try {
    const studentRoutes = require('./routes/studentRoutes');
    app.use('/api/students', studentRoutes);
} catch (e) { console.log('Student routes not loaded yet'); }

try {
    const userRoutes = require('./routes/userRoutes');
    app.use('/api/users', userRoutes);
} catch (e) { console.log('User routes not loaded yet'); }

// If someone tries a wrong URL
app.use('*', (req, res) => {
    res.status(404).json({ 
        message: 'Route not found - try /api/students or /health',
        availableEndpoints: ['/', '/health', '/api/students', '/api/users', '/api/auth/login']
    });
});

// Export for Vercel
module.exports = app;

// For local testing only
if (require.main === module) {
    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`✅ Server running at http://localhost:${PORT}`);
    });
}