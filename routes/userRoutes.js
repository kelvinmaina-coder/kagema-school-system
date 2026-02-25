const express = require('express');
const router = express.Router();
const { getAllUsers, createUser } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRoles('admin'), getAllUsers);
router.post('/', authenticateToken, authorizeRoles('admin'), createUser);

module.exports = router;