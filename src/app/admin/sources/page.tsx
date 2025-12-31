"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Radio, Plus, RefreshCw, ExternalLink, Loader2, Check, X } from "lucide-react";

interface Source {
  id: string;
  name: string;
  url: string;
  category: string;
  country: string;
  status: "active" | "inactive" | "error";
  lastSync: string;
  articleCount: number;
}

// Mock data - would come from API
const mockSources: Source[] = [
  { id: "1", name: "The Herald", url: "herald.co.zw", category: "General", country: "Zimbabwe", status: "active", lastSync: "5 min ago", articleCount: 1250 },
  { id: "2", name: "NewsDay", url: "newsday.co.zw", category: "General", country: "Zimbabwe", status: "active", lastSync: "10 min ago", articleCount: 980 },
  { id: "3", name: "ZimLive", url: "zimlive.com", category: "News", country: "Zimbabwe", status: "active", lastSync: "3 min ago", articleCount: 756 },
  { id: "4", name: "Daily Maverick", url: "dailymaverick.co.za", category: "General", country: "South Africa", status: "active", lastSync: "8 min ago", articleCount: 2100 },
  { id: "5", name: "Nation Africa", url: "nation.africa", category: "General", country: "Kenya", status: "error", lastSync: "2 hours ago", articleCount: 1500 },
];

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setSources(mockSources);
      setLoading(false);
    }, 500);
  }, []);

  const getStatusColor = (status: Source["status"]) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "inactive": return "bg-gray-400";
      case "error": return "bg-red-500";
    }
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
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface hover:bg-elevated transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">RSS Sources</h1>
          <p className="text-text-secondary">{sources.length} sources configured</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:opacity-90">
          <Plus className="w-4 h-4" />
          Add Source
        </button>
      </div>

      {/* Sources Table */}
      <div className="bg-surface rounded-xl border border-elevated overflow-hidden">
        <table className="w-full">
          <thead className="bg-elevated/50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-semibold text-text-secondary">Source</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-text-secondary">Country</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-text-secondary">Articles</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-text-secondary">Last Sync</th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-text-secondary">Status</th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-text-secondary">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-elevated">
            {sources.map((source) => (
              <tr key={source.id} className="hover:bg-elevated/30 transition-colors">
                <td className="px-4 py-4">
                  <div>
                    <p className="font-medium text-foreground">{source.name}</p>
                    <p className="text-xs text-text-tertiary">{source.url}</p>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-text-secondary">{source.country}</td>
                <td className="px-4 py-4 text-sm text-foreground">{source.articleCount.toLocaleString()}</td>
                <td className="px-4 py-4 text-sm text-text-secondary">{source.lastSync}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(source.status)}`} />
                    <span className="text-sm capitalize">{source.status}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="p-2 hover:bg-elevated rounded-lg transition-colors">
                    <RefreshCw className="w-4 h-4 text-text-secondary" />
                  </button>
                  <button className="p-2 hover:bg-elevated rounded-lg transition-colors">
                    <ExternalLink className="w-4 h-4 text-text-secondary" />
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
