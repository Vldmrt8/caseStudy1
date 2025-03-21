const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const routes = require('./routes'); // Import routes from /routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', routes);
app.use('/auth', authRoutes);
app.use('/students', studentRoutes);

// Connect to Redis
const client = redis.createClient({
  url: 'redis://@127.0.0.1:6379'  // Default Redis connection
});

client.connect()
  .then(() => console.log('Connected to Redis'))
  .catch(err => console.error('Redis connection error:', err));

// CRUD Operations

// Route to save student data
app.post('/students', async (req, res) => {
  const { id, firstName, middleName, lastName, presentAddress, provincialAddress, lengthStay, sex, cStatus, dob, age, pob, hea, religion, cNumber, email } = req.body;

  // Validate input fields
  if (!id || !firstName || !middleName || !lastName || !presentAddress || !provincialAddress || !lengthStay || !sex || !cStatus || !dob || !age || !pob || !hea || !religion || !cNumber || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Set student data in Redis (using object syntax for Redis v4 and above)
    const studentData = { id, firstName, middleName, lastName, presentAddress, provincialAddress, lengthStay, sex, cStatus, dob, age, pob, hea, religion, cNumber, email };

    // Save student data in Redis hash
    await client.hSet(`student:${id}`, 'firstName', studentData.firstName);
    await client.hSet(`student:${id}`, 'middleName', studentData.middleName);
    await client.hSet(`student:${id}`, 'lastName', studentData.lastName);
    await client.hSet(`student:${id}`, 'presentAddress', studentData.presentAddress);
    await client.hSet(`student:${id}`, 'provincialAddress', studentData.provincialAddress);
    await client.hSet(`student:${id}`, 'lengthStay', studentData.lengthStay);
    await client.hSet(`student:${id}`, 'sex', studentData.sex);
    await client.hSet(`student:${id}`, 'cStatus', studentData.cStatus);
    await client.hSet(`student:${id}`, 'dob', studentData.dob);
    await client.hSet(`student:${id}`, 'age', studentData.age);
    await client.hSet(`student:${id}`, 'pob', studentData.pob);
    await client.hSet(`student:${id}`, 'hea', studentData.hea);
    await client.hSet(`student:${id}`, 'religion', studentData.religion);
    await client.hSet(`student:${id}`, 'cNumber', studentData.cNumber);
    await client.hSet(`student:${id}`, 'email', studentData.email);

    // Respond with success message
    res.status(201).json({ message: 'Student saved successfully' });
  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).json({ message: 'Failed to save student' });
  }
});

// Read (R)
app.get('/students/:id', async (req, res) => {
  const id = req.params.id;
  const student = await client.hGetAll(`student:${id}`);
  if (Object.keys(student).length === 0) {
    return res.status(404).json({ message: 'Student not found' });
  }
  res.json(student);
});

// Read all students
app.get('/students', async (req, res) => {
  const keys = await client.keys('student:*');
  const students = await Promise.all(keys.map(async (key) => {
    return { id: key.split(':')[1], ...(await client.hGetAll(key)) };
  }));
  res.json(students);
});

// Update (U)
app.put('/students/:id', async (req, res) => {
  const id = req.params.id;
  const { firstName, middleName, lastName, presentAddress, provincialAddress, lengthStay, sex, cStatus, dob, age, pob, hea, religion, cNumber, email } = req.body;

  if (!firstName && !middleName && !lastName && !presentAddress && !provincialAddress && !lengthStay && !sex && !cStatus && !dob && !age && !pob && !hea && !religion && !cNumber && !email) {
    return res.status(400).json({ message: 'At least one field is required to update' });
  }

  try {
    const existingStudent = await client.hGetAll(`student:${id}`);
    if (Object.keys(existingStudent).length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update student data in Redis
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
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Failed to update student' });
  }
});

// Delete (D)
app.delete('/students/:id', async (req, res) => {
  const id = req.params.id;
  await client.del(`student:${id}`);
  res.status(200).json({ message: 'Student deleted successfully' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});