import { createBrowserRouter, Navigate } from "react-router-dom";

import Home from "../app/public/Home";
import Login from "../app/public/Login";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import RoleGuard from "../components/guards/RoleGuard";

import Dashboard from "../app/system/dashboard/Dashboard";
import PatientList from "../app/system/patients/PatientList";
import PatientDetail from "../app/system/patients/PatientDetail";
import PatientForm from "../app/system/patients/PatientForm";
import RiskAnalysis from "../app/system/analysis/RiskAnalysis";
import PatientSummary from "../app/system/summary/PatientSummary";
import AdminDashboard from "../app/system/admin/AdminDashboard";
import AdminLayout from "../components/layout/admin/AdminLayout";
import FormList from "../app/system/form/FormList";
import DiagnosticForm from "../app/system/form/DiagnosticForm";
import AdminFormManagement from "../app/system/admin/AdminFormManagement";
import AdminQuestionManagement from "../app/system/admin/AdminQuestionManagement";
import { ROLES } from "../constants/roles";

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  
  // Protected routes - Yêu cầu đăng nhập
  {
    path: "/system",
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "patients",
        element: <PatientList />,
      },
      {
        path: "patients/new",
        element: <PatientForm />,
      },
      {
        path: "patients/:id",
        element: <PatientDetail />,
      },
      {
        path: "forms",
        element: <FormList />,
      },
      {
        path: "diagnostic-form/:patientId/:formId",
        element: <DiagnosticForm />,
      },
      {
        path: "analysis",
        element: <RiskAnalysis />,
      },
      {
        path: "summary",
        element: <PatientSummary />,
      },
    ],
  },

  // Admin only routes
  {
    path: "/system/admin",
    element: (
      <ProtectedRoute>
        <RoleGuard allowRoles={[ROLES.ADMIN]}>
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </RoleGuard>
      </ProtectedRoute>
    ),
  },

  // Fallback - redirect to home
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
