import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting registration:', JSON.stringify(formData)); // 🔍 Log request data
  
      const response = await axios.post('http://localhost:5000/auth/register', formData, {
        headers: { 'Content-Type': 'application/json' }
      });
  
      console.log('Response:', response.data); // 🔍 Log response from server
      alert('Registration successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      console.error('Registration error:', err.response?.data); // 🔍 Log exact error
      setError(err.response?.data?.errors[0]?.msg || 'Registration failed');
    }
  };
  
  
  

  return (
    <div className="register-container">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" placeholder="Username" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <select name="role" onChange={handleChange}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
