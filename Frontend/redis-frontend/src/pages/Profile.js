import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: user?.username || '',
    newPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:5000/auth/profile',
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Password updated successfully! 🎉 Please re-login.');
      setFormData({ ...formData, newPassword: '' }); // Clear input field
      // ✅ Remove token and logout user
      localStorage.removeItem('token'); // Remove token
      logout(); // Call logout function
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating password ❌');
    }
  };

  return (
    <div className="container">
      <h2>My Profile</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="username" value={formData.username} disabled />
        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          value={formData.newPassword}
          onChange={handleChange}
          required
        />
        <button type="submit">Update Password</button>
      </form>
    </div>
  );
};

export default Profile;
