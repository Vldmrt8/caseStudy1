const express = require('express');
const redis = require('redis');
const { authenticateUser, authorizeRole } = require('../middlewares/auth');

const router = express.Router();
const client = redis.createClient({ url: 'redis://127.0.0.1:6379' });

client.connect();

// 📌 Create Student (Only Admins)
router.post('/students', async (req, res) => {
  const { id, name, course, age, address } = req.body;

  if (!id || !name || !course || !age || !address) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    console.log('Saving Student:', req.body); // ✅ Debugging backend request
    await client.hSet(`student:${id}`, { name, course, age, address });
    
    const savedStudent = await client.hGetAll(`student:${id}`);
    console.log('Saved Student:', savedStudent); // ✅ Confirm data is stored correctly

    res.status(201).json({ message: 'Student added successfully', student: savedStudent });
  } catch (error) {
    res.status(500).json({ message: 'Error adding student' });
  }
});


// 📌 Get All Students (Accessible to Admin & Users)
router.get('/', authenticateUser, async (req, res) => {
  try {
    const keys = await client.keys('student:*');
    const students = await Promise.all(keys.map(async (key) => {
      return { id: key.split(':')[1], ...(await client.hGetAll(key)) };
    }));
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// 📌 Update Student (Only Admins)
router.put('/:id', authenticateUser, authorizeRole('admin'), async (req, res) => {
  const id = req.params.id;
  const { name, course, age, address } = req.body;

  try {
    const existingStudent = await client.hGetAll(`student:${id}`);
    if (!existingStudent.name) return res.status(404).json({ message: 'Student not found' });

    if (name) await client.hSet(`student:${id}`, 'name', name);
    if (course) await client.hSet(`student:${id}`, 'course', course);
    if (age) await client.hSet(`student:${id}`, 'age', age);
    if (address) await client.hSet(`student:${id}`, 'address', address);

    res.status(200).json({ message: 'Student updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update student' });
  }
});

// 📌 Delete Student (Only Admins)
router.delete('/:id', authenticateUser, authorizeRole('admin'), async (req, res) => {
  const id = req.params.id;
  try {
    await client.del(`student:${id}`);
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

module.exports = router;
