import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const AdminDashboard = () => <div style={{ padding: '20px' }}><h1>Admin Dashboard</h1><button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Déconnexion</button></div>;
const TechnicianDashboard = () => <div style={{ padding: '20px' }}><h1>Technician Dashboard</h1><button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Déconnexion</button></div>;
const EmployeeDashboard = () => <div style={{ padding: '20px' }}><h1>Employee Dashboard (Incidents)</h1><button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Déconnexion</button></div>;
const Unauthorized = () => <div style={{ padding: '20px', color: 'red' }}><h1>Accès Interdit (403)</h1></div>;

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes by Role */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/technician" 
          element={
            <ProtectedRoute allowedRole="TECHNICIAN">
              <TechnicianDashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRole="EMPLOYEE">
              <EmployeeDashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}