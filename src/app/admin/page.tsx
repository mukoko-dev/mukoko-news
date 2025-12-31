"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Newspaper,
  Radio,
  RefreshCw,
  Settings,
  TrendingUp,
  AlertCircle,
  Loader2,
  ChevronRight,
} from "lucide-react";

// Admin navigation cards
const adminSections = [
  {
    href: "/admin/analytics",
    icon: BarChart3,
    title: "Analytics",
    description: "View platform metrics and usage",
    color: "bg-blue-500",
  },
  {
    href: "/admin/sources",
    icon: Radio,
    title: "Sources",
    description: "Manage RSS feeds and news sources",
    color: "bg-green-500",
  },
  {
    href: "/admin/users",
    icon: Users,
    title: "Users",
    description: "User management and permissions",
    color: "bg-purple-500",
  },
  {
    href: "/admin/system",
    icon: Settings,
    title: "System",
    description: "System settings and configuration",
    color: "bg-orange-500",
  },
];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    articles: number;
    sources: number;
    users: number;
    categories: number;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Simulated stats load - would come from API
    setTimeout(() => {
      setStats({
        articles: 12450,
        sources: 56,
        users: 1234,
        categories: 15,
      });
      setLoading(false);
    }, 500);
  }, []);

  const handleRefreshRSS = async () => {
    setRefreshing(true);
    // API call would go here
    setTimeout(() => setRefreshing(false), 2000);
  };

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-text-secondary">
          Manage your Mukoko News platform
        </p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-surface rounded-xl p-5 border border-elevated">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Newspaper className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stats.articles.toLocaleString()}
              </div>
            </div>
            <p className="text-sm text-text-secondary">Total Articles</p>
          </div>

          <div className="bg-surface rounded-xl p-5 border border-elevated">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Radio className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.sources}</div>
            </div>
            <p className="text-sm text-text-secondary">Active Sources</p>
          </div>

          <div className="bg-surface rounded-xl p-5 border border-elevated">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">
                {stats.users.toLocaleString()}
              </div>
            </div>
            <p className="text-sm text-text-secondary">Registered Users</p>
          </div>

          <div className="bg-surface rounded-xl p-5 border border-elevated">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <div className="text-2xl font-bold text-foreground">{stats.categories}</div>
            </div>
            <p className="text-sm text-text-secondary">Categories</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefreshRSS}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh RSS Feeds"}
          </button>
          <Link
            href="/admin/sources"
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-elevated text-foreground rounded-xl font-medium hover:bg-elevated transition-colors"
          >
            <Radio className="w-4 h-4" />
            Add New Source
          </Link>
        </div>
      </section>

      {/* Admin Sections */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Management</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {adminSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="flex items-center p-5 bg-surface rounded-xl border border-elevated hover:border-primary/50 transition-colors"
            >
              <div
                className={`w-12 h-12 rounded-xl ${section.color} flex items-center justify-center mr-4`}
              >
                <section.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{section.title}</h3>
                <p className="text-sm text-text-secondary">{section.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-text-tertiary" />
            </Link>
          ))}
        </div>
      </section>

      {/* System Status */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">System Status</h2>
        <div className="bg-surface rounded-xl border border-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="font-medium text-foreground">All systems operational</span>
          </div>
          <p className="text-sm text-text-secondary mt-2">
            Last RSS sync: 5 minutes ago
          </p>
        </div>
      </section>
    </div>
  );
}
