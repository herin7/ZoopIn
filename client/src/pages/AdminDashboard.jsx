import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/api/sessions`, {
        title,
        hostId: 'admin-123', // Hardcoded for demo
      });
      if (response.data.success) {
        navigate(`/live/${response.data.data.roomId}`);
      }
    } catch (error) {
      console.error(error);
      alert('Error creating session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-indigo-600">Admin Dashboard</h1>
        <form onSubmit={handleCreateSession}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Session Title</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Live Session'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
