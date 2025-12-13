import React, { useState, useEffect, useCallback } from 'react';
import { users as usersAPI, type User } from '../api/client';
import { PageLoader } from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

const ROLES = ['creator', 'business-creator', 'moderator', 'admin', 'super_admin'];
const STATUSES = ['active', 'suspended', 'deleted'];

export default function UsersPage() {
  const [userList, setUserList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const { showToast } = useToast();

  const LIMIT = 20;

  const loadUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await usersAPI.list({
        limit: LIMIT,
        offset: page * LIMIT,
        search: searchQuery || undefined,
        role: selectedRole || undefined,
        status: selectedStatus || undefined,
      });

      if (result.data) {
        setUserList(result.data.users || []);
        setTotal(result.data.total || 0);
      } else if (result.error) {
        showToast(result.error, 'error');
      }
    } catch (error) {
      showToast('Failed to load users', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, selectedRole, selectedStatus, showToast]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      loadUsers();
    }, 300);
    return () => clearTimeout(debounce);
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const result = await usersAPI.updateRole(userId, newRole);
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Role updated successfully', 'success');
        loadUsers();
      }
    } catch (error) {
      showToast('Failed to update role', 'error');
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const result = await usersAPI.updateStatus(userId, newStatus);
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('Status updated successfully', 'success');
        loadUsers();
      }
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await usersAPI.delete(userId);
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast('User deleted successfully', 'success');
        loadUsers();
      }
    } catch (error) {
      showToast('Failed to delete user', 'error');
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'moderator':
        return 'bg-blue-100 text-blue-800';
      case 'business-creator':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'suspended':
        return 'badge-warning';
      case 'deleted':
        return 'badge-danger';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading && userList.length === 0) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500">{total.toLocaleString()} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by email or username..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(0);
              }}
              className="input"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setPage(0);
            }}
            className="input md:w-40"
          >
            <option value="">All Roles</option>
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role.replace('_', ' ')}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(0);
            }}
            className="input md:w-40"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="card p-0">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Logins</th>
                <th>Last Login</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {userList.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {user.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.display_name || user.username || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 cursor-pointer ${getRoleBadgeColor(user.role)}`}
                    >
                      {ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={user.status}
                      onChange={(e) => handleStatusChange(user.id, e.target.value)}
                      className={`badge cursor-pointer border-0 ${getStatusBadgeColor(user.status)}`}
                    >
                      {STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className="text-sm text-gray-600">
                      {user.login_count || 0}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-500">
                      {formatDate(user.last_login_at)}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(user.id, user.email)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Showing {page * LIMIT + 1} to {Math.min((page + 1) * LIMIT, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn btn-secondary"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * LIMIT >= total}
              className="btn btn-secondary"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
