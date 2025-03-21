const express = require('express');
const redis = require('redis');
const { authenticateUser, authorizeRole } = require('../middlewares/auth');

const router = express.Router();
const client = redis.createClient({ url: 'redis://127.0.0.1:6379' });

client.connect();

// 📌 Create Student (Only Admins)
router.post('/students', async (req, res) => {
  const { id, firstName, middleName, lastName, presentAddress, provincialAddress, lengthStay, sex, cStatus, dob, age, pob, hea, religion, cNumber, email } = req.body;

  if (!id || !firstName || !middleName || !lastName || !presentAddress || !provincialAddress || !lengthStay || !sex || !cStatus || !dob || !age || !pob || !hea || !religion || !cNumber || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    console.log('Saving Student:', req.body); // ✅ Debugging backend request
    await client.hSet(`student:${id}`, { id, firstName, middleName, lastName, presentAddress, provincialAddress, lengthStay, sex, cStatus, dob, age, pob, hea, religion, cNumber, email });
    
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
router.put('/students/:id', authenticateUser, authorizeRole('admin'), async (req, res) => {
  const id = req.params.id;
  const { firstName, middleName, lastName, presentAddress, provincialAddress, lengthStay, sex, cStatus, dob, age, pob, hea, religion, cNumber, email } = req.body;

  try {
    const existingStudent = await client.hGetAll(`student:${id}`);
    if (!existingStudent.name) return res.status(404).json({ message: 'Student not found' });

    if (firstName) await client.hSet(`student:${id}`, 'firstName', firstName);
    if (middleName) await client.hSet(`student:${id}`, 'middleName', middleName);
    if (lastName) await client.hSet(`student:${id}`, 'lastName', lastName);
    if (presentAddress) await client.hSet(`student:${id}`, 'presentAddress', presentAddress);
    if (provincialAddress) await client.hSet(`student:${id}`, 'provincialAddress', provincialAddress);
    if (lengthStay) await client.hSet(`student:${id}`, 'lengthStay', lengthStay);
    if (sex) await client.hSet(`student:${id}`, 'sex', sex);
    if (cStatus) await client.hSet(`student:${id}`, 'cStatus', cStatus);
    if (dob) await client.hSet(`student:${id}`, 'dob', dob);
    if (age) await client.hSet(`student:${id}`, 'age', age);
    if (pob) await client.hSet(`student:${id}`, 'pob', pob);
    if (hea) await client.hSet(`student:${id}`, 'hea', hea);
    if (religion) await client.hSet(`student:${id}`, 'religion', religion);
    if (cNumber) await client.hSet(`student:${id}`, 'cNumber', cNumber);
    if (email) await client.hSet(`student:${id}`, 'email', email);
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
