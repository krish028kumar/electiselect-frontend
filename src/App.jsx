import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import OpenElective from './pages/OpenElective'
import OpenElectiveAdmin from './pages/OpenElectiveAdmin'
import DeptElective from './pages/DeptElective'
import DeptElectiveAdmin from './pages/DeptElectiveAdmin'
import SuperAdmin from './pages/SuperAdmin'
import SystemAdmin from './pages/SystemAdmin'
import SuperAdminStudents from './pages/SuperAdminStudents'
import SuperAdminSettings from './pages/SuperAdminSettings'
import Notifications from './pages/Notifications'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import ProtectedRoute from './components/ProtectedRoute'
import CompleteProfile from './pages/CompleteProfile'

const FallbackRoute = () => {
  const pathname = window.location.pathname;
  if (pathname.startsWith('/login-success')) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Authenticating...</div>;
  }
  return <Navigate to="/login" />;
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/complete-profile" element={<CompleteProfile />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><Dashboard /></ProtectedRoute>} />
          <Route path="/open-elective" element={<ProtectedRoute allowedRoles={['STUDENT']}><OpenElective /></ProtectedRoute>} />
          <Route path="/open-elective/admin" element={<ProtectedRoute allowedRoles={['ISE_ADMIN', 'SUPER_ADMIN']}><OpenElectiveAdmin /></ProtectedRoute>} />
          <Route path="/dept-elective" element={<ProtectedRoute allowedRoles={['STUDENT']}><DeptElective /></ProtectedRoute>} />
          <Route path="/dept-elective/admin" element={<ProtectedRoute allowedRoles={['ISE_ADMIN', 'SUPER_ADMIN']}><DeptElectiveAdmin /></ProtectedRoute>} />
          
          <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SuperAdmin /></ProtectedRoute>} />
          <Route path="/super-admin/settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SuperAdminSettings /></ProtectedRoute>} />
          <Route path="/super-admin/students" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SuperAdminStudents /></ProtectedRoute>} />
          <Route path="/super-admin/system" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SystemAdmin /></ProtectedRoute>} />
          
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          
          <Route path="/login-success" element={<div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Authenticating...</div>} />
          <Route path="*" element={<FallbackRoute />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
