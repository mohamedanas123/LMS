import React, { useState, useEffect } from 'react';
import { api } from '../api';

export default function UserDirectory() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <section>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">System User Directory</h1>
          <p className="panel-subtitle">Administrative oversight of registered students, instructors, and security roles.</p>
        </div>
      </div>

      {error && <div className="alert alert-danger">Failed to load users: {error}</div>}

      {loading ? (
        <div className="text-muted" style={{ padding: '24px 0' }}>Loading user directory...</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Username</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Account Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="text-mono">#{u.id}</td>
                  <td><strong>{u.fullName}</strong></td>
                  <td className="text-mono">{u.username}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-${u.role.replace('ROLE_', '').toLowerCase()}`}>
                      {u.role.replace('ROLE_', '')}
                    </span>
                  </td>
                  <td className="text-dim text-sm">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
