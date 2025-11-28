import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Components
import HomePage from './components/home/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/AdminDashboard';
import EmployerDashboard from './components/employer/EmployerDashboard';
import ApplicantDashboard from './components/applicant/ApplicantDashboard';
import JobDetails from './components/shared/JobDetails';
import PrivateRoute from './components/shared/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/admin/*" element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/employer/*" element={
            <PrivateRoute role="employer">
              <EmployerDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/applicant/*" element={
            <PrivateRoute role="applicant">
              <ApplicantDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/job/:id" element={
            <PrivateRoute>
              <JobDetails />
            </PrivateRoute>
          } />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;