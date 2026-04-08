import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import CartPage from './pages/CartPage';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import StudioDashboard from './pages/StudioDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import LandingPage from './pages/LandingPage';
import LiveFeed from './pages/LiveFeed';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ViewerRoom from './pages/ViewerRoom';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/feed" element={<LiveFeed />} />
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
              <StudioDashboard />
            </AdminRoute>
          }
        />
        <Route path="/cart" element={<CartPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Layout>
    </Router>
  );
}

export default App;
