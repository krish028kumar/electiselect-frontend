import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import OpenElective from './pages/OpenElective'
import OpenElectiveAdmin from './pages/OpenElectiveAdmin'
import DeptElective from './pages/DeptElective'
import DeptElectiveAdmin from './pages/DeptElectiveAdmin'
import SuperAdmin from './pages/SuperAdmin'
import Notifications from './pages/Notifications'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/open-elective" element={<ProtectedRoute><OpenElective /></ProtectedRoute>} />
          <Route path="/open-elective/admin" element={<ProtectedRoute><OpenElectiveAdmin /></ProtectedRoute>} />
          <Route path="/dept-elective" element={<ProtectedRoute><DeptElective /></ProtectedRoute>} />
          <Route path="/dept-elective/admin" element={<ProtectedRoute><DeptElectiveAdmin /></ProtectedRoute>} />
          <Route path="/super-admin" element={<ProtectedRoute><SuperAdmin /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
