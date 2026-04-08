import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import api from '../services/api';
import DashboardHeader from '../components/admin/DashboardHeader';

const AdminDashboard = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('buyer');
  const [password, setPassword] = useState('');

  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/auth/users');
      setUsers(res.data.data);
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to fetch users.', tone: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (targetUser) => {
    setEditingUser(targetUser);
    setName(targetUser.name);
    setEmail(targetUser.email);
    setRole(targetUser.role);
    setPassword('');
  };

  const closeEditModal = () => {
    setEditingUser(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/auth/users/${editingUser._id}`, { name, email, role, password });
      addToast({ title: 'Success', message: 'User updated successfully.', tone: 'success' });
      closeEditModal();
      fetchUsers();
    } catch (err) {
      addToast({ title: 'Error', message: err.response?.data?.message || 'Update failed', tone: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you confirm you want to delete this user? This action cannot be undone.')) return;
    try {
      await api.delete(`/api/auth/users/${id}`);
      addToast({ title: 'Success', message: 'User deleted successfully.', tone: 'success' });
      fetchUsers();
    } catch (err) {
      addToast({ title: 'Error', message: 'Failed to delete user.', tone: 'error' });
    }
  };

  const filteredUsers = users.filter(u => {
    const searchLower = (searchQuery || '').toLowerCase();
    const nameMatch = (u.name || '').toLowerCase().includes(searchLower);
    const emailMatch = (u.email || '').toLowerCase().includes(searchLower);
    const matchesSearch = nameMatch || emailMatch;
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 text-black md:px-8">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          roleLabel="Super Admin"
          onLogout={handleLogout}
        />

        <div className="mt-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-black uppercase tracking-tight">User Management</h1>
            <button onClick={() => navigate('/studio')} className="bg-black text-white px-4 py-2 font-bold hover:bg-zinc-800 transition">
              Go to Live Studio 🎥
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="flex-1 border-4 border-black p-3 font-medium focus:outline-none focus:ring-2 focus:ring-zoop-yellow bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            />
            <select 
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="border-4 border-black p-3 font-black uppercase focus:outline-none focus:ring-2 focus:ring-zoop-yellow bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <option value="all">All Roles</option>
              <option value="buyer">Buyer</option>
              <option value="shop_owner">Shop Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 overflow-x-auto">
            {loading ? (
              <p className="text-center font-bold">Loading users...</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-4 border-black">
                    <th className="p-3 font-black uppercase tracking-wider">Name</th>
                    <th className="p-3 font-black uppercase tracking-wider">Email</th>
                    <th className="p-3 font-black uppercase tracking-wider">Role</th>
                    <th className="p-3 font-black uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id} className="border-b-2 border-zinc-200 hover:bg-zoop-yellow/10 transition">
                      <td className="p-3 font-medium">{u.name}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-1 text-xs font-bold uppercase rounded border-2 border-black ${
                          u.role === 'admin' ? 'bg-zoop-yellow text-black' : 
                          u.role === 'shop_owner' ? 'bg-black text-white' : 
                          'bg-zinc-200 text-black'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3 flex gap-2">
                        <button
                          onClick={() => openEditModal(u)}
                          className="px-3 py-1 bg-zinc-100 border-2 border-black font-bold hover:bg-black hover:text-white transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="px-3 py-1 bg-red-100/50 border-2 border-red-600 text-red-600 font-bold hover:bg-red-600 hover:text-white transition"
                          disabled={u._id === user?.id} // Prevent self-delete
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan="4" className="text-center p-8 font-bold">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative">
            <button
              onClick={closeEditModal}
              className="absolute top-4 right-4 text-black hover:text-red-600 font-black text-xl"
            >
              &times;
            </button>
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4 border-b-4 border-black pb-2">Edit User</h2>
            
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-black uppercase mb-1">Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border-2 border-black p-2 font-medium focus:outline-none focus:ring-2 focus:ring-zoop-yellow bg-zinc-50"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border-2 border-black p-2 font-medium focus:outline-none focus:ring-2 focus:ring-zoop-yellow bg-zinc-50"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-1">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full border-2 border-black p-2 font-medium focus:outline-none focus:ring-2 focus:ring-zoop-yellow bg-zinc-50 uppercase"
                >
                  <option value="buyer">Buyer</option>
                  <option value="shop_owner">Shop Owner</option>
                  <option value="admin">Admin / Moderator</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-black uppercase mb-1">New Password <span className="text-xs text-zinc-500 normal-case font-normal">(Leave blank to keep current)</span></label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border-2 border-black p-2 font-medium focus:outline-none focus:ring-2 focus:ring-zoop-yellow bg-zinc-50"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 py-3 px-4 bg-zinc-200 text-black border-2 border-black font-black uppercase hover:bg-zinc-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-zoop-yellow text-black border-2 border-black font-black uppercase hover:bg-yellow-400 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;