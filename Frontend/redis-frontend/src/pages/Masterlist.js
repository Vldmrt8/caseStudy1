import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const API_URL = 'http://localhost:5000/students';

const Masterlist = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(response.data);
    } catch (error) {
      toast.error('Error fetching students');
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      toast.error('Error deleting student');
    }
  };

  return (
    <div className="container">
      <h1>Welcome, {user?.username || 'Guest'}</h1>
      <button onClick={logout}>Logout</button>

      <h2>Barangay Digkilaan Information System</h2>

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
                <button onClick={() => navigate(`/form?edit=true&id=${student.id}`)}>Edit</button>
                <button onClick={() => handleDelete(student.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Masterlist;
