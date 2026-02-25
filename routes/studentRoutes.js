const express = require('express');
const router = express.Router();
const {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    searchStudents
} = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, getAllStudents);
router.get('/search', authenticateToken, searchStudents);
router.get('/:id', authenticateToken, getStudentById);
router.post('/', authenticateToken, authorizeRoles('admin', 'secretary'), createStudent);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'secretary'), updateStudent);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteStudent);

module.exports = router;