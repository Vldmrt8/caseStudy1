import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';

const API_URL = 'http://localhost:5000/students';

function StudentDashboard() {
  const auth = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ id: '', name: '', course: '', age: '', address: '' });
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Fetch all students
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      toast.error('Error fetching students');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ Handle form input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Add new student
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(API_URL, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Student added successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', course: '', age: '', address: '' });
    } catch (error) {
      toast.error('Error adding student!');
    }
  };

  // ✅ Update existing student
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/${formData.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Student updated successfully!');
      fetchStudents();
      setFormData({ id: '', name: '', course: '', age: '', address: '' });
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating student!');
    }
  };

  // ✅ Delete student
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Student deleted!');
      fetchStudents();
    } catch (error) {
      toast.error('Error deleting student!');
    }
  };

  // ✅ Populate form for editing student
  const handleEdit = (student) => {
    setFormData(student);
    setIsEditing(true);
  };

  if (!auth) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <h1>Welcome, {auth.user?.username || 'Guest'}</h1>
      <button onClick={auth.logout}>Logout</button>

      <h2>Student CRUD</h2>
      {!isEditing ? (
        <form onSubmit={handleAddSubmit}>
          <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="course" placeholder="Course" value={formData.course} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <button type="submit">Add Student</button>
        </form>
      ) : (
        <form onSubmit={handleEditSubmit}>
          <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required disabled />
          <input type="text" name="name" placeholder="Name" value={formData.name} onChange={handleChange} required />
          <input type="text" name="course" placeholder="Course" value={formData.course} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
          <button type="submit">Update Student</button>
        </form>
      )}

      <h2>Student List</h2>
      <table border="1" align="center" style={{ width: '80%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Course</th>
            <th>Age</th>
            <th>Address</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.course}</td>
              <td>{student.age}</td>
              <td>{student.address}</td>
              <td>
                <button onClick={() => handleEdit(student)}>Edit</button>
                <button onClick={() => handleDelete(student.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ToastContainer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <nav>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/students">Students</Link>
        </nav>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />  {/* ✅ Add this */}
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['admin', 'user']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;