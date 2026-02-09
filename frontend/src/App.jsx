import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./components/layout/admin/AdminLayout";
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/guards/ProtectedRoute'
import RoleGuard from './components/guards/RoleGuard'

// Pages
import Home from './app/public/Home'
import Login from './app/public/Login'
import Dashboard from './app/system/dashboard/Dashboard'
import AdminDashboard from './app/system/admin/AdminDashboard'
import RiskAnalysis from './app/system/analysis/RiskAnalysis'
import FormBuilder from './app/system/form/FormBuilder'
import PatientFormSubmission from './app/system/form/PatientFormSubmission'

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleGuard requiredRole="ADMIN">
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </RoleGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analysis"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <RiskAnalysis />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/forms"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <PatientFormSubmission />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App
