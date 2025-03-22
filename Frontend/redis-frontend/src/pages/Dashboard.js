import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:5000/students'; // ✅ Same API as StudentDashboard

const Dashboard = () => {
  const auth = useContext(AuthContext);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  // ✅ Fetch students from the backend
  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // ✅ Total number of students
  const totalStudents = students.length;

  // ✅ Count number of Male, Female, and Others
  const genderData = [
    { name: 'Male', value: students.filter(student => student.sex === 'Male').length || 0 },
    { name: 'Female', value: students.filter(student => student.sex === 'Female').length || 0 },
    { name: 'Others', value: students.filter(student => student.sex === 'Others').length || 0 },
    { name: 'Prefer not to say', value: students.filter(student => student.sex === 'Prefer not to say').length || 0 }
  ];
  
  const COLORS = ['#0088FE', '#FF6384', '#FFBB28', '#32CD32'];

  // ✅ Calculate years stayed in residence
  const yearsStayedData = students.reduce((acc, student) => {
    const years = student.lengthStay;
    acc[years] = (acc[years] || 0) + 1;
    return acc;
  }, {});
  const barChartData = Object.entries(yearsStayedData).map(([years, count]) => ({
    years: `${years} years`,
    count
  }));

  // ✅ Age distribution categories
  const ageGroups = [
    { range: '0-18', min: 0, max: 18 },
    { range: '19-35', min: 19, max: 35 },
    { range: '36-50', min: 36, max: 50 },
    { range: '51+', min: 51, max: 120 }
  ];
  const ageData = ageGroups.map(group => ({
    name: group.range,
    value: students.filter(student => student.age >= group.min && student.age <= group.max).length
  }));

  // ✅ Educational Attainment Distribution Based on Age Groups
  const educationLevels = [
    'No Grade Completed',
    'Elementary Graduate',
    'Highschool Graduate',
    'Technical Vocational Graduate',
    'College Graduate',
    'Masters Graduate',
    'Doctorate Graduate'
  ];

  // Count each education level within age groups
  const educationByAge = ageGroups.map(group => {
    const groupStudents = students.filter(student => student.age >= group.min && student.age <= group.max);
    
    const counts = educationLevels.reduce((acc, level) => {
      acc[level] = groupStudents.filter(student => student.hea === level).length;
      return acc;
    }, {});

    return { ageRange: group.range, ...counts };
  });

  return (
    <div>
      <h1>Welcome, {auth.user?.username || 'Guest'}</h1>
      <h2>Total Residents: {totalStudents}</h2>

      {/* ✅ Gender Pie Chart */}
      <h3>Gender Distribution</h3>
      <ResponsiveContainer width="50%" height={300}>
        <PieChart>
          <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8">
            {genderData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* ✅ Years Stayed Bar Chart */}
      <h3>Years Stayed in Residence</h3>
      <ResponsiveContainer width="70%" height={300}>
        <BarChart data={barChartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="years" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      {/* ✅ Age Distribution Pie Chart */}
      <h3>Age Distribution</h3>
      <ResponsiveContainer width="50%" height={300}>
        <PieChart>
          <Pie data={ageData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#ffbb33">
            {ageData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* ✅ Educational Attainment by Age Group (Bar Chart) */}
      <h3>Educational Attainment Distribution by Age Group</h3>
      <ResponsiveContainer width="80%" height={400}>
        <BarChart data={educationByAge}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="ageRange" />
          <YAxis />
          <Tooltip />
          <Legend />
          {educationLevels.map((level, index) => (
            <Bar key={level} dataKey={level} fill={COLORS[index % COLORS.length]} stackId="a" />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Dashboard;
