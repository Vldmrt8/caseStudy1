import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import Profile from './pages/Profile';
import ActivityLogs from './pages/ActivityLogs';
import Form from './pages/Form';
import Masterlist from './pages/Masterlist';

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
        <AuthProvider>
          <Router>
            <nav>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
              <Link to="/form">Form</Link>
              <Link to="/masterlist">Masterlist</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/manage-users">Manage Users</Link>
              <Link to="/profile">Profile</Link>
              <Link to="/logs">Activity Logs</Link>
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
                path="/form"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'user']}>
                    <Form />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/masterlist"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'user']}>
                    <Masterlist />
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
              <Route path="/profile" element={
                  <ProtectedRoute allowedRoles={['admin', 'user']}>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="/logs" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ActivityLogs />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Router>
        </AuthProvider>
      </>
  );
}
export default App;