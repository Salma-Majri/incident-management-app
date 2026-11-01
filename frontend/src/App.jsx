// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';

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

// Protect Route Guard
const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const AdminDashboard = () => <div><h2>Espace Administrateur</h2><p>Gestion globale et statistiques.</p></div>;
const TechnicianDashboard = () => <div><h2>Espace Technicien</h2><p>Liste des incidents attribués.</p></div>;
const EmployeeDashboard = () => <div><h2>Espace Employé</h2><p>Mes demandes et incidents déclarés.</p></div>;
const ProfilePage = () => <div><h2>Mon Profil</h2><p>Consulter et modifier mes informations.</p></div>;
const Unauthorized = () => <div style={{ padding: '40px', color: '#dc2626' }}><h2>Accès Interdit (403)</h2></div>;

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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

        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } 
        />

        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Direct Redirection */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}