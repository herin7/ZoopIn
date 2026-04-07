import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import ViewerRoom from './pages/ViewerRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ViewerRoom />} />
        <Route path="/live/:roomId" element={<ViewerRoom />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
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
