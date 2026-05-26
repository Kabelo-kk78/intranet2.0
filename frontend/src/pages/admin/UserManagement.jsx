import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiPlus, FiTrash2, FiEdit, FiX } from 'react-icons/fi';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Add user modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'staff', department: '', position: '', status: 'active', password: '' });
  const [adding, setAdding] = useState(false);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/users')
      .then(res => { setUsers(res.data || []); })
      .catch(() => setError('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const startEdit = (user) => {
    setEditingId(user.id);
    setEditForm({ name: user.name, role: user.role, department: user.department, position: user.position, status: user.status });
    setMessage(null); setError(null);
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setMessage(null); setError(null);
    try {
      await api.put(`/users/${id}`, editForm);
      setMessage('User updated successfully');
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user');
    }
  };

  const openAddModal = () => {
    setAddForm({ name: '', email: '', role: 'staff', department: '', position: '', status: 'active', password: '' });
    setShowAddModal(true);
    setMessage(null); setError(null);
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setAdding(true); setMessage(null); setError(null);
    // Basic validation
    if (!addForm.name || !addForm.email || !addForm.password) {
      setError('Name, email and password are required'); setAdding(false); return;
    }
    try {
      await api.post('/users', {
        name: addForm.name,
        email: addForm.email,
        role: addForm.role,
        department: addForm.department,
        position: addForm.position,
        status: addForm.status,
        password: addForm.password,
      });
      setMessage('User added successfully');
      setShowAddModal(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add user');
    } finally {
      setAdding(false);
    }
  };

  const confirmDelete = (id) => {
    setDeletingId(id);
    setMessage(null); setError(null);
  };

  const cancelDelete = () => setDeletingId(null);

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true); setMessage(null); setError(null);
    try {
      await api.delete(`/users/${deletingId}`);
      setMessage('User removed successfully');
      setDeletingId(null);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to remove user');
    } finally {
      setDeleting(false);
    }
  };

  const roleBadge = (role) => {
    const colors = { admin: 'bg-purple-100 text-purple-800', manager: 'bg-blue-100 text-blue-800', staff: 'bg-gray-100 text-gray-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || colors.staff}`}>{role}</span>;
  };

  const statusBadge = (status) => {
    const colors = { active: 'bg-green-100 text-green-800', inactive: 'bg-red-100 text-red-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.active}`}>{status}</span>;
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-gray-500">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center gap-3">
          <button onClick={openAddModal} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
            <FiPlus className="w-4 h-4" /> Add user
          </button>
        </div>
      </div>

      {message && <div className="p-3 bg-green-100 text-green-800 rounded-lg">{message}</div>}
      {error && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                {editingId === user.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <input type="text" value={editForm.department} onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                    </td>
                    <td className="px-6 py-4">
                      <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm">
                        <option value="admin">admin</option>
                        <option value="manager">manager</option>
                        <option value="staff">staff</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm">
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button onClick={() => saveEdit(user.id)} className="text-sm text-blue-600 hover:text-blue-800">Save</button>
                      <button onClick={cancelEdit} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4"><span className="text-sm font-medium text-gray-900">{user.name}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{user.department}</td>
                    <td className="px-6 py-4">{roleBadge(user.role)}</td>
                    <td className="px-6 py-4">{statusBadge(user.status)}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <button onClick={() => startEdit(user)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <FiEdit className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => confirmDelete(user.id)} className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1">
                        <FiTrash2 className="w-4 h-4" /> Remove
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add User</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" value={addForm.email} onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded">
                    <option value="staff">staff</option>
                    <option value="manager">manager</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select value={addForm.status} onChange={e => setAddForm({ ...addForm, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded">
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input value={addForm.department} onChange={e => setAddForm({ ...addForm, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <input value={addForm.position} onChange={e => setAddForm({ ...addForm, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Temporary Password</label>
                <input type="password" value={addForm.password} onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded" />
                <p className="text-xs text-gray-500 mt-1">User will be created with this password and should change it on first login.</p>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded border">Cancel</button>
                <button type="submit" disabled={adding} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  {adding ? 'Adding...' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-3">Confirm removal</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to remove this user? This action cannot be undone.</p>
            <div className="flex items-center justify-end gap-3">
              <button onClick={cancelDelete} className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                {deleting ? 'Removing...' : 'Remove user'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
