import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ViewerRoom from './pages/ViewerRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/buyer"
          element={
            <AdminRoute allowedRoles={['buyer']}>
              <BuyerDashboard />
            </AdminRoute>
          }
        />
        <Route path="/live/:roomId" element={<ViewerRoom />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/studio"
          element={
            <AdminRoute allowedRoles={['shop_owner', 'admin']}>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
