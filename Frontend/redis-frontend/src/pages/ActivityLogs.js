import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const ActivityLogs = () => {
  const { user } = useContext(AuthContext);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/auth/logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLogs(response.data);
      console.log('Logs fetched:', response.data); // ✅ Debugging
    } catch (error) {
      toast.error('Error fetching logs');
    }
  };

  if (!user || user.role !== 'admin') {
    return <h2>Access Denied</h2>;
  }

  return (
    <div className="container">
      <h2>Activity Logs</h2>
      <table border="1" align="center">
        <thead>
          <tr>
            <th>Action</th>
            <th>Username</th>
            <th>Performed By</th>
            <th>Timestamp</th>
          </tr>
        </thead>
        <tbody>
        {logs.map((log, index) => (
            <tr key={index}>
            <td>{log.action}</td>
            <td>{log.studentId ? `Student ${log.studentId}` : log.targetUser}</td> {/* ✅ Show Student ID if applicable */}
            <td>{log.performedBy}</td>
            <td>{new Date(log.timestamp).toLocaleString()}</td>
            </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLogs;
