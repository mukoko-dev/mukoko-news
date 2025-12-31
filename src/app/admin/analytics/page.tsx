"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BarChart3, TrendingUp, Users, Eye, Clock, Loader2 } from "lucide-react";

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-text-secondary">Platform metrics and insights</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-surface rounded-xl p-5 border border-elevated">
          <Eye className="w-6 h-6 text-blue-500 mb-3" />
          <div className="text-2xl font-bold text-foreground">24.5K</div>
          <p className="text-sm text-text-secondary">Page Views Today</p>
          <div className="flex items-center gap-1 mt-2 text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span className="text-xs font-medium">+12%</span>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-5 border border-elevated">
          <Users className="w-6 h-6 text-purple-500 mb-3" />
          <div className="text-2xl font-bold text-foreground">1,234</div>
          <p className="text-sm text-text-secondary">Active Users</p>
          <div className="flex items-center gap-1 mt-2 text-green-600">
            <TrendingUp className="w-3 h-3" />
            <span className="text-xs font-medium">+5%</span>
          </div>
        </div>

        <div className="bg-surface rounded-xl p-5 border border-elevated">
          <Clock className="w-6 h-6 text-orange-500 mb-3" />
          <div className="text-2xl font-bold text-foreground">4:32</div>
          <p className="text-sm text-text-secondary">Avg. Session</p>
        </div>

        <div className="bg-surface rounded-xl p-5 border border-elevated">
          <BarChart3 className="w-6 h-6 text-green-500 mb-3" />
          <div className="text-2xl font-bold text-foreground">68%</div>
          <p className="text-sm text-text-secondary">Engagement Rate</p>
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface rounded-xl border border-elevated p-6">
          <h3 className="font-semibold text-foreground mb-4">Traffic Over Time</h3>
          <div className="h-48 flex items-center justify-center text-text-tertiary">
            <BarChart3 className="w-12 h-12" />
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-elevated p-6">
          <h3 className="font-semibold text-foreground mb-4">Top Categories</h3>
          <div className="space-y-3">
            {["Politics", "Business", "Sports", "Technology", "Entertainment"].map((cat, i) => (
              <div key={cat} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{cat}</span>
                    <span className="text-text-secondary">{100 - i * 15}%</span>
                  </div>
                  <div className="h-2 bg-elevated rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${100 - i * 15}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
