"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Search, MoreVertical, Shield, Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "moderator";
  status: "active" | "inactive";
  joinedAt: string;
}

const mockUsers: User[] = [
  { id: "1", name: "Admin User", email: "admin@mukoko.com", role: "admin", status: "active", joinedAt: "Jan 2024" },
  { id: "2", name: "John Doe", email: "john@example.com", role: "user", status: "active", joinedAt: "Mar 2024" },
  { id: "3", name: "Jane Smith", email: "jane@example.com", role: "moderator", status: "active", joinedAt: "Feb 2024" },
  { id: "4", name: "Bob Wilson", email: "bob@example.com", role: "user", status: "inactive", joinedAt: "Dec 2023" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 500);
  }, []);

  const getRoleBadgeColor = (role: User["role"]) => {
    switch (role) {
      case "admin": return "bg-red-500/10 text-red-500";
      case "moderator": return "bg-blue-500/10 text-blue-500";
      default: return "bg-gray-500/10 text-gray-500";
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-elevated transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Users</h1>
          <p className="text-text-secondary">{users.length} registered users</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search users..."
          className="w-full pl-12 pr-4 py-3 bg-surface rounded-xl border border-elevated text-foreground placeholder:text-text-tertiary focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
        />
      </div>

      {/* Users Table */}
      <div className="bg-surface rounded-xl border border-elevated overflow-hidden">
        <table className="w-full">
          <thead className="bg-elevated/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-text-secondary">User</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-text-secondary">Role</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-text-secondary">Status</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-text-secondary">Joined</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-elevated">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-elevated/30 transition-colors">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs text-text-tertiary">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadgeColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${user.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                    <span className="text-sm capitalize">{user.status}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-text-secondary">{user.joinedAt}</td>
                <td className="px-4 py-4 text-right">
                  <button className="p-2 hover:bg-elevated rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4 text-text-secondary" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
