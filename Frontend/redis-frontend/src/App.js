import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
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
  const auth = useContext(AuthContext); // ✅ Get AuthContext safely
  const user = auth?.user || null; // ✅ Prevents destructuring error

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <nav>
          {/* Show Login & Register only if the user is NOT logged in */}
          {!user && (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}

          {/* Show other links only if user is logged in */}
          {user && (
            <>
              <Link to="/form">Form</Link>
              <Link to="/masterlist">Masterlist</Link>
              <Link to="/dashboard">Dashboard</Link>
              {user.role === 'admin' && <Link to="/manage-users">Manage Users</Link>}
              <Link to="/profile">Profile</Link>
              {user.role === 'admin' && <Link to="/logs">Activity Logs</Link>}
            </>
          )}
        </nav>

        <Routes>
          {/* Show Login & Register pages only when no user is logged in */}
          {!user && (
            <>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </>
          )}

          {/* Protect Routes */}
          {user && (
            <>
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
              {user.role === 'admin' && (
                <Route
                  path="/manage-users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageUsers />
                    </ProtectedRoute>
                  }
                />
              )}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'user']}>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              {user.role === 'admin' && (
                <Route
                  path="/logs"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ActivityLogs />
                    </ProtectedRoute>
                  }
                />
              )}
            </>
          )}
        </Routes>
      </Router>
    </>
  );
}

export default App;
