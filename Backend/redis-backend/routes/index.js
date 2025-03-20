const express = require('express');
const authRoutes = require('./auth');         // ✅ Ensure 'auth.js' exists
const studentRoutes = require('./students.js'); // ✅ Ensure 'students.js' exists

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);

module.exports = router;
