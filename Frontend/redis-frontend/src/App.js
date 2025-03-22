import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';

const API_URL = 'http://localhost:5000/students';

function StudentDashboard() {
  const auth = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ id: '', firstName: '', middleName: '', lastName: '', presentAddress: '', provincialAddress: '', lengthStay: '', sex: '', cStatus: '', dob: '', age: '', pob: '', hea: '', religion: '', cNumber: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);

  // ✅ Fetch all students
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
        params: { timestamp: new Date().getTime() } // ✅ Prevents caching
      });
      console.log('Fetched Students:', response.data); // ✅ Debugging
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
    
    console.log('Submitting Student:', formData); // 🔍 Check form data before sending
  
    if (!formData.id || !formData.firstName || !formData.middleName || !formData.lastName || !formData.presentAddress || !formData.provincialAddress || !formData.lengthStay || !formData.sex || !formData.cStatus || !formData.dob || !formData.age || !formData.pob || !formData.hea || !formData.religion || !formData.cNumber || !formData.email) {
      toast.error('Please fill in all fields!');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(API_URL, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      toast.success('Student added successfully!');
      fetchStudents(); // ✅ Refresh student list
      setFormData({ id: '', firstName: '', middleName: '', lastName: '', presentAddress: '', provincialAddress: '', lengthStay: '', sex: '', cStatus: '', dob: '', age: '', pob: '', hea: '', religion: '', cNumber: '', email: '' }); // ✅ Reset form
    } catch (error) {
      console.error('Error adding student:', error.response?.data);
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
      setFormData({ id: '', firstName: '', middleName: '', lastName: '', presentAddress: '', provincialAddress: '', lengthStay: '', sex: '', cStatus: '', dob: '', age: '', pob: '', hea: '', religion: '', cNumber: '', email: '' });
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

      <h2>Barangay Digkilaan Information System</h2>
      {!isEditing ? (
        <form onSubmit={handleAddSubmit}>
          <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required />
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input type="text" name="presentAddress" placeholder="Present Address" value={formData.presentAddress} onChange={handleChange} required />
          <input type="text" name="provincialAddress" placeholder="Provincial Address" value={formData.provincialAddress} onChange={handleChange} required />
          <input type="text" name="lengthStay" placeholder="Length of Stay (year/s)" value={formData.lengthStay} onChange={handleChange} required />
          <select name="sex" value={formData.sex} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
            <option value="Others">Prefer not to say</option>
          </select>
          <select name="cStatus" value={formData.cStatus} onChange={handleChange} required>
            <option value="">Civil Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Divorced">Divorced</option>
            <option value="Remarried">Remarried</option>
          </select>
          <input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <select name="hea" value={formData.hea} onChange={handleChange} required>
            <option value="">Highest Educational Attainment</option>
            <option value="No Grade Completed">No Grade Completed</option>
            <option value="Elementary Graduate">Elementary Graduate</option>
            <option value="Highschool Graduate">Highschool Graduate</option>
            <option value="Technical Vocational Graduate">Technical Vocational Graduate</option>
            <option value="College Graduate">College Graduate</option>
            <option value="Masters Graduate">Masters Graduate</option>
            <option value="Doctorate Graduate">Doctorate Graduate</option>
          </select>
          <input type="text" name="pob" placeholder="Place of Birth" value={formData.pob} onChange={handleChange} required />
          <input type="text" name="religion" placeholder="Religion" value={formData.religion} onChange={handleChange} required />
          <input type="text" name="cNumber" placeholder="Contact Number" value={formData.cNumber} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <button type="submit">Add Student</button>
        </form>      
      ) : (
        <form onSubmit={handleEditSubmit}>
          <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required disabled />
          <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
          <input type="text" name="middleName" placeholder="Middle Name" value={formData.middleName} onChange={handleChange} required />
          <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
          <input type="text" name="presentAddress" placeholder="Present Address" value={formData.presentAddress} onChange={handleChange} required />
          <input type="text" name="provincialAddress" placeholder="Provincial Address" value={formData.provincialAddress} onChange={handleChange} required />
          <input type="text" name="lengthStay" placeholder="Length of Stay (year/s)" value={formData.lengthStay} onChange={handleChange} required />
          <select name="sex" value={formData.sex} onChange={handleChange} required>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Others">Others</option>
            <option value="Others">Prefer not to say</option>
          </select>
          <select name="cStatus" value={formData.cStatus} onChange={handleChange} required>
            <option value="">Civil Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Widowed">Widowed</option>
            <option value="Divorced">Divorced</option>
            <option value="Remarried">Remarried</option>
          </select>
          <input type="date" name="dob" placeholder="Date of Birth" value={formData.dob} onChange={handleChange} required />
          <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
          <input type="text" name="pob" placeholder="Place of Birth" value={formData.pob} onChange={handleChange} required />
          <select name="hea" value={formData.hea} onChange={handleChange} required>
            <option value="">Highest Educational Attainment</option>
            <option value="No Grade Completed">No Grade Completed</option>
            <option value="Elementary Graduate">Elementary Graduate</option>
            <option value="Highschool Graduate">Highschool Graduate</option>
            <option value="Technical Vocational Graduate">Technical Vocational Graduate</option>
            <option value="College Graduate">College Graduate</option>
            <option value="Masters Graduate">Masters Graduate</option>
            <option value="Doctorate Graduate">Doctorate Graduate</option>
          </select>
          <input type="text" name="religion" placeholder="Religion" value={formData.religion} onChange={handleChange} required />
          <input type="text" name="cNumber" placeholder="Contact Number" value={formData.cNumber} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
          <button type="submit">Update Student</button>
        </form>
      )}

      <h2>Masterlist</h2>
      <table border="1" align="center" style={{ width: '80%' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>First Name</th>
          <th>Middle Name</th>
          <th>Last Name</th>
          <th>Present Address</th>
          <th>Provincial Address</th>
          <th>Length of stay (year/s)</th>
          <th>Sex</th>
          <th>Civil Status</th>
          <th>Date of Birth</th>
          <th>Age</th>
          <th>Place of Birth</th>
          <th>Highest Educational Attainment</th>
          <th>Religion</th>
          <th>Contact Number</th>
          <th>Email</th>
          <th>Functions</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.id}>
            <td>{student.id}</td>
            <td>{student.firstName}</td>
            <td>{student.middleName}</td>
            <td>{student.lastName}</td>
            <td>{student.presentAddress}</td>
            <td>{student.provincialAddress}</td>
            <td>{student.lengthStay}</td>
            <td>{student.sex}</td>
            <td>{student.cStatus}</td>
            <td>{student.dob}</td>
            <td>{student.age}</td>
            <td>{student.pob}</td>
            <td>{student.hea}</td>
            <td>{student.religion}</td>
            <td>{student.cNumber}</td>
            <td>{student.email}</td>
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
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/manage-users">Manage Users</Link>
        </nav>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin', 'user']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['admin', 'user']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
export default App;