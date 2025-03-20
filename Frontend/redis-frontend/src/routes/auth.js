const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const redis = require('redis');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const client = redis.createClient({ url: 'redis://127.0.0.1:6379' });

client.connect();

// 📝 Register User (Admin or Non-Admin)
router.post('/register', [
  body('username').isString(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['admin', 'user'])
], async (req, res) => {
  const { username, password, role } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await client.hSet(`user:${username}`, 'password', hashedPassword);
    await client.hSet(`user:${username}`, 'role', role);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});

// 🔑 Login User
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const storedPassword = await client.hGet(`user:${username}`, 'password');
    const role = await client.hGet(`user:${username}`, 'role');

    if (!storedPassword) return res.status(401).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, storedPassword);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ username, role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Login error' });
  }
});

module.exports = router;
