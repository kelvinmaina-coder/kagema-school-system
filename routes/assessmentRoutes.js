const express = require('express');
const router = express.Router();
const { getStudentAssessments, saveAssessment } = require('../controllers/assessmentController');
const { authenticateToken } = require('../middleware/auth');

router.get('/:studentId', authenticateToken, getStudentAssessments);
router.post('/', authenticateToken, saveAssessment);

module.exports = router;