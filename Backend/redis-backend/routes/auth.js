const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const redis = require('redis');
const { authenticateUser, authorizeRole } = require('../middlewares/auth');
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

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // ✅ Check if the user already exists
    const existingUser = await client.hGet(`user:${username}`, 'password');
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Save user to Redis
    await client.hSet(`user:${username}`, 'password', hashedPassword);
    await client.hSet(`user:${username}`, 'role', role);

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration Error:', error);
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

// 🔹 Fetch all users (Only Admins)
router.get('/users', authenticateUser, authorizeRole('admin'), async (req, res) => {
  try {
    const keys = await client.keys('user:*');
    const users = await Promise.all(
      keys.map(async (key) => ({
        username: key.split(':')[1],
        role: await client.hGet(key, 'role')
      }))
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// 🔹 Update a user's role (Only Admins)
router.put('/users/:username', authenticateUser, authorizeRole('admin'), async (req, res) => {
  const { username } = req.params;
  const { role } = req.body;

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const exists = await client.exists(`user:${username}`);
    if (!exists) return res.status(404).json({ message: 'User not found' });

    await client.hSet(`user:${username}`, 'role', role);
    res.json({ message: 'User role updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating role' });
  }
});

// 🔹 Delete a user (Only Admins)
router.delete('/users/:username', authenticateUser, authorizeRole('admin'), async (req, res) => {
  const { username } = req.params;

  try {
    const exists = await client.exists(`user:${username}`);
    if (!exists) return res.status(404).json({ message: 'User not found' });

    await client.del(`user:${username}`);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
});

module.exports = router;
