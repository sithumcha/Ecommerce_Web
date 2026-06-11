import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { AuthContext } from '../../context/AuthContext';
import { CheckCircle2, ShieldAlert, Trash2, ShieldCheck, UserMinus, Briefcase } from 'lucide-react';

const ManageUsers = () => {
  const { userInfo } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (user) => {
    if (user._id === userInfo._id) {
      alert('You cannot modify your own role.');
      return;
    }
    const confirmMsg = `Are you sure you want to ${
      user.isAdmin ? 'revoke admin permissions from' : 'grant admin permissions to'
    } ${user.name}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const { data } = await api.put(`/admin/users/${user._id}/role`);
      setUsers(users.map((u) => (u._id === user._id ? { ...u, isAdmin: data.user.isAdmin } : u)));
    } catch (err) {
      alert('Failed to change user role: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAgentToggle = async (user) => {
    if (user._id === userInfo._id) {
      alert('You cannot modify your own agent status.');
      return;
    }
    const confirmMsg = `Are you sure you want to ${
      user.isAgent ? 'revoke agent permissions from' : 'grant agent permissions to'
    } ${user.name}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const { data } = await api.put(`/admin/users/${user._id}/agent`);
      setUsers(users.map((u) => (u._id === user._id ? { ...u, isAgent: data.user.isAgent } : u)));
    } catch (err) {
      alert('Failed to change user agent status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (id === userInfo._id) {
      alert('You cannot delete your own account.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This action is permanent.')) return;

    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 flex-grow pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Manage Users</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          Review accounts, edit clearance levels, and remove profiles.
        </p>
      </div>

      {loading ? (
        <Loader message="Fetching users directory..." />
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-200/60 dark:border-dark-800/80 overflow-hidden shadow-xl transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-dark-900 border-b border-slate-100 dark:border-dark-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">
                  <th className="py-4 px-5">ID</th>
                  <th className="py-4 px-5">Name</th>
                  <th className="py-4 px-5">Email</th>
                  <th className="py-4 px-5">Admin clearance</th>
                  <th className="py-4 px-5">Agent status</th>
                  <th className="py-4 px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-900 text-sm">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-900/30 transition-colors">
                    <td className="py-4 px-5 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {user._id.substring(0, 10)}...
                    </td>
                    <td className="py-4 px-5 text-slate-800 dark:text-slate-200 font-semibold">
                      {user.name} {user._id === userInfo._id && '(You)'}
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-slate-400 font-semibold">{user.email}</td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-extrabold uppercase px-2 py-0.5 rounded border ${
                          user.isAdmin
                            ? 'bg-primary-50 dark:bg-primary-600/15 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-500/20'
                            : 'bg-slate-100 dark:bg-dark-950 text-slate-550 dark:text-slate-505 border-slate-200 dark:border-dark-800'
                        }`}
                      >
                        {user.isAdmin ? 'Authorized' : 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-extrabold uppercase px-2 py-0.5 rounded border ${
                          user.isAgent
                            ? 'bg-emerald-50 dark:bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                            : 'bg-slate-100 dark:bg-dark-950 text-slate-550 dark:text-slate-550 border-slate-200 dark:border-dark-800'
                        }`}
                      >
                        {user.isAgent ? 'Agent' : 'Client'}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex gap-2">
                        {user._id !== userInfo._id && (
                          <>
                            <button
                              onClick={() => handleRoleToggle(user)}
                              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-all"
                              title={user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                            >
                              {user.isAdmin ? <UserMinus size={14} /> : <ShieldCheck size={14} />}
                            </button>
                            <button
                              onClick={() => handleAgentToggle(user)}
                              className="p-2 text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-all"
                              title={user.isAgent ? 'Revoke Agent' : 'Make Agent'}
                            >
                              <Briefcase size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="p-2 text-slate-500 hover:text-red-650 dark:hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                              title="Delete Account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
