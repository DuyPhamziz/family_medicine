import { createBrowserRouter, Navigate } from "react-router-dom";

import Home from "../app/public/Home";
import About from "../app/public/About";
import Guideline from "../app/public/Guideline";
import RiskTools from "../app/public/RiskTools";
import Login from "../app/public/Login";
import AppLayout from "../components/layout/AppLayout";
import ProtectedRoute from "../components/guards/ProtectedRoute";
import RoleGuard from "../components/guards/RoleGuard";

import Dashboard from "../app/system/dashboard/Dashboard";
import PatientList from "../app/system/patients/PatientList";
import PatientDetail from "../app/system/patients/PatientDetail";
import PatientForm from "../app/system/patients/PatientForm";
import PatientEdit from "../app/system/patients/PatientEdit";
import PatientTimeline from "../app/system/patients/PatientTimeline";
import CarePlan from "../app/system/care-plan/CarePlan";
import RiskAnalysis from "../app/system/analysis/RiskAnalysis";
import PatientSummary from "../app/system/summary/PatientSummary";
import AdminDashboard from "../app/system/admin/AdminDashboard";
import AdminLayout from "../components/layout/admin/AdminLayout";
import FormList from "../app/system/form/FormList";
import DiagnosticForm from "../app/system/form/DiagnosticForm";
import AdminFormManagement from "../app/system/admin/AdminFormManagement";
import AdminQuestionManagement from "../app/system/admin/AdminQuestionManagement";
import SummaryReport from "../app/system/report/SummaryReport";
import Guidelines from "../app/system/guidelines/Guidelines";
import CdssLogic from "../app/system/logic/CdssLogic";
import AdminUserManagement from "../app/system/admin/AdminUserManagement";
import AdminDebugPage from "../app/system/admin/AdminDebugPage";
import { ROLES } from "../constants/roles";

export const router = createBrowserRouter([
  // Public routes
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/risk-tools",
    element: <RiskTools />,
  },
  {
    path: "/guideline",
    element: <Guideline />,
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
        path: "patients/edit/:id",
        element: <PatientEdit />,
      },
      {
        path: "patients/:id",
        element: <PatientDetail />,
      },
      {
        path: "patients/:id/timeline",
        element: <PatientTimeline />,
      },
      {
        path: "patients/:id/care-plan",
        element: <CarePlan />,
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
        path: "report/summary",
        element: <SummaryReport />,
      },
      {
        path: "guidelines",
        element: <Guidelines />,
      },
      {
        path: "logic",
        element: <CdssLogic />,
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
  {
    path: "/system/admin/forms",
    element: (
      <ProtectedRoute>
        <RoleGuard allowRoles={[ROLES.ADMIN]}>
          <AdminLayout>
            <AdminFormManagement />
          </AdminLayout>
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/system/admin/forms/:formId/questions",
    element: (
      <ProtectedRoute>
        <RoleGuard allowRoles={[ROLES.ADMIN]}>
          <AdminLayout>
            <AdminQuestionManagement />
          </AdminLayout>
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/system/admin/debug",
    element: (
      <ProtectedRoute>
        <RoleGuard allowRoles={[ROLES.ADMIN]}>
          <AdminLayout>
            <AdminDebugPage />
          </AdminLayout>
        </RoleGuard>
      </ProtectedRoute>
    ),
  },
  {
    path: "/system/admin/users",
    element: (
      <ProtectedRoute>
        <RoleGuard allowRoles={[ROLES.ADMIN]}>
          <AdminLayout>
            <AdminUserManagement />
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
