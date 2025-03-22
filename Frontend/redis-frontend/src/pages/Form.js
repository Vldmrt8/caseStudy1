import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const API_URL = 'http://localhost:5000/students';

const Form = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Extract query params (edit mode)
  const searchParams = new URLSearchParams(location.search);
  const editMode = searchParams.get('edit') === 'true';
  const studentId = searchParams.get('id');

  // ✅ State for student data
  const [formData, setFormData] = useState({
    id: '', firstName: '', middleName: '', lastName: '', presentAddress: '',
    provincialAddress: '', lengthStay: '', sex: '', cStatus: '', dob: '',
    age: '', pob: '', hea: '', religion: '', cNumber: '', email: ''
  });

  // ✅ Fetch student data for editing
  useEffect(() => {
    if (editMode && studentId) {
      fetchStudentData(studentId);
    }
  }, [editMode, studentId]);

  const fetchStudentData = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData(response.data);
    } catch (error) {
      toast.error('Error fetching student data');
      console.error('Fetch error:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Submit form (add or update student)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editMode) {
        // ✅ Update existing student
        await axios.put(`${API_URL}/${studentId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Student updated successfully!');
      } else {
        // ✅ Add new student
        await axios.post(API_URL, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Student added successfully!');
      }
      navigate('/masterlist'); // ✅ Redirect after submission
    } catch (error) {
      toast.error('Error saving student data');
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="container">
      <h2>{editMode ? 'Edit Student' : 'Add Student'}</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="id" placeholder="ID" value={formData.id} onChange={handleChange} required disabled={editMode} />
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
          <option value="Prefer not to say">Prefer not to say</option>
        </select>
        <select name="cStatus" value={formData.cStatus} onChange={handleChange} required>
          <option value="">Civil Status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
          <option value="Widowed">Widowed</option>
          <option value="Divorced">Divorced</option>
        </select>
        <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
        <input type="number" name="age" placeholder="Age" value={formData.age} onChange={handleChange} required />
        <input type="text" name="pob" placeholder="Place of Birth" value={formData.pob} onChange={handleChange} required />
        <input type="text" name="hea" placeholder="Highest Education" value={formData.hea} onChange={handleChange} required />
        <input type="text" name="religion" placeholder="Religion" value={formData.religion} onChange={handleChange} required />
        <input type="text" name="cNumber" placeholder="Contact Number" value={formData.cNumber} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
        <button type="submit">{editMode ? 'Update Student' : 'Add Student'}</button>
      </form>
    </div>
  );
};

export default Form;
