import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import * as XLSX from 'xlsx';


const API_URL = 'http://localhost:5000/students';

const Masterlist = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState(''); // Sorting option
  const [currentPage, setCurrentPage] = useState(1);

 // Filter students based on search query
 const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName} ${student.presentAddress} ${student.provincialAddress} ${student.sex} ${student.cStatus} ${student.age} ${student.pob} ${student.hea} ${student.religion}`.toLowerCase().includes(search.toLowerCase())
  );

// Apply sorting BEFORE pagination
const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortBy === 'id-desc') {
      return b.id - a.id; // Newest first
    } else if (sortBy === 'id-asc') {
      return a.id - b.id; // Oldest first
    } else if (sortBy === 'name-asc') {
      return a.firstName.localeCompare(b.firstName);
    } else if (sortBy === 'name-desc') {
      return b.firstName.localeCompare(a.firstName);
    } else if (sortBy === 'age-asc') {
      return a.age - b.age;
    } else if (sortBy === 'age-desc') {
      return b.age - a.age;
    } else if (sortBy === 'lengthStay-asc') {
      return a.lengthStay - b.lengthStay;
    } else if (sortBy === 'lengthStay-desc') {
      return b.lengthStay - a.lengthStay;
    } else if (sortBy === 'cStatus') {
      return a.cStatus.localeCompare(b.cStatus);
    }
    return 0;
  });
  

  // Get current students for pagination
  const studentsPerPage = 8;
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = sortedStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  // Change page
  const nextPage = () => setCurrentPage(currentPage + 1);
  const prevPage = () => setCurrentPage(currentPage - 1);

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
      toast.error('Unauthorized access. Only admins can delete a profile.');
    }
  };
  
  // Export to Excel
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(students);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Masterlist');
    XLSX.writeFile(workbook, 'masterlist.xlsx');
  };

  return (
    <div className="container">
      <h1>Welcome, {user?.username || 'Guest'}</h1>
      <button onClick={logout}>Logout</button>

      <h2>Barangay Digkilaan Information System</h2>

      <h2>Masterlist</h2>
      <button onClick={exportToExcel}>Export to Excel</button>    

        {/* 🔍 Search Bar */}
        <input
        type="text"
        placeholder="Search by name, age, etc."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

         {/* 📌 Sorting Dropdown */}
      <select onChange={(e) => setSortBy(e.target.value)}>
        <option value="">Sort By</option>
        <option value="id-desc">ID (Recently added)</option>
        <option value="id-asc">ID (Oldest added)</option>
        <option value="name-asc">Name (A-Z)</option>
        <option value="name-desc">Name (Z-A)</option>
        <option value="age-asc">Age (Youngest First)</option>
        <option value="age-desc">Age (Oldest First)</option>
        <option value="lengthStay-asc">Length of Stay (Shortest First)</option>
        <option value="lengthStay-desc">Length of Stay (Longest First)</option>
        <option value="cStatus">Civil Status</option>
      </select>

      <table border="1" align="center" style={{ width: '80%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
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
             {/* 🛑 Show Edit/Delete Buttons ONLY for Admins */}
            {user.role === 'admin' && (
            <>
            <th>Functions</th>
            </>
            )}
          </tr>
        </thead>
        <tbody>
        {currentStudents.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{`${student.firstName} ${student.middleName} ${student.lastName}`}</td>
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
                 {/* 🛑 Show Edit/Delete Buttons ONLY for Admins */}
                {user.role === 'admin' && (
                <>
                    <td>
                    <button onClick={() => navigate(`/form?edit=true&id=${student.id}`)}>Edit</button>
                    <button onClick={() => handleDelete(student.id)}>Delete</button>
                    </td>
                </>
                )}
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination Buttons */}
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <span> Page {currentPage} </span>
        <button onClick={nextPage} disabled={indexOfLastStudent >= filteredStudents.length}>Next</button>
    </div>
  );
};

export default Masterlist;
