const express = require('express');
const router = express.Router();
const {
    getAllFees,
    getFeeSummary,
    recordPayment,
    getFeeStructure
} = require('../controllers/feeController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, getAllFees);
router.get('/summary', authenticateToken, getFeeSummary);
router.get('/structure', authenticateToken, getFeeStructure);
router.post('/payments', authenticateToken, authorizeRoles('admin', 'bursar'), recordPayment);

module.exports = router;
