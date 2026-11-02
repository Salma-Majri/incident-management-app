import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile'; 
import Navbar from './components/Navbar';
import EmployeeDashboard from './pages/EmployeeDashboard'; 
import TechnicianDashboard from './pages/TechnicianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import IncidentDetails from './pages/IncidentDetails';
import Unauthorized from './pages/Unauthorized';

const MainLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />
      <main style={{ padding: '24px' }}>
        {children}
      </main>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Rediriger vers la page d'interdiction si le rôle ne correspond pas
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};


export default function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées par rôle */}
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
        <Route path="/incidents/:id" element={<ProtectedRoute><IncidentDetails /></ProtectedRoute>} />

        {/* Route du profil accessible à tous les utilisateurs authentifiés */}
        <Route path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Redirection par défaut pour les routes introuvables */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}