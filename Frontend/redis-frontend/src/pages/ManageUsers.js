import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const ManageUsers = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      toast.error('Error fetching users');
    }
  };

  const updateUserRole = async (username, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/auth/users/${username}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Updated ${username} to ${newRole}`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Error updating user role');
    }
  };

  const deleteUser = async (username) => {
    if (!window.confirm(`Are you sure you want to delete ${username}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/auth/users/${username}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Deleted ${username}`);
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error('Error deleting user');
    }
  };

  if (!user || user.role !== 'admin') {
    return <h2>Access Denied</h2>;
  }

  return (
    <div className="container">
      <h2>Manage Users</h2>
      <table border="1" align="center">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((usr) => (
            <tr key={usr.username}>
              <td>{usr.username}</td>
              <td>
                <select
                  value={usr.role}
                  onChange={(e) => updateUserRole(usr.username, e.target.value)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>
                <button onClick={() => deleteUser(usr.username)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
