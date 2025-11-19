'use client';

/**
 * Admin Panel Page
 *
 * Platform administration and moderation dashboard.
 * Features:
 * - Platform statistics
 * - Top creators
 * - Popular presets
 * - Moderation tools (delete content, ban users)
 * - User management
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Stats {
  users: {
    total: number;
    recent: number;
  };
  presets: {
    total: number;
    public: number;
    deleted: number;
  };
  engagement: {
    comments: number;
    likes: number;
  };
}

interface TopCreator {
  id: string;
  name: string;
  username?: string;
  _count: {
    presets: number;
  };
}

interface PopularPreset {
  id: string;
  name: string;
  likeCount: number;
  downloadCount: number;
  viewCount: number;
  user: {
    name: string;
    username?: string;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<Stats | null>(null);
  const [topCreators, setTopCreators] = useState<TopCreator[]>([]);
  const [popularPresets, setPopularPresets] = useState<PopularPreset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MODERATOR') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN' || session?.user?.role === 'MODERATOR') {
      fetchStats();
    }
  }, [session]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
        setTopCreators(data.topCreators);
        setPopularPresets(data.popularPresets);
      } else {
        setError(data.error || 'Failed to load stats');
      }
    } catch (err) {
      setError('Failed to load stats');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ui-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MODERATOR')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-color">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🛡️ Admin Panel</h1>
              <p className="text-text-secondary mt-1">
                Platform administration and moderation
              </p>
            </div>
            <Link href="/dashboard" className="btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-ui-red/10 border border-ui-red/30 text-ui-red px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Users */}
            <div className="card">
              <div className="text-sm text-text-secondary mb-2">Total Users</div>
              <div className="text-3xl font-bold text-ui-blue">{stats.users.total.toLocaleString()}</div>
              <div className="text-xs text-ui-green mt-2">
                +{stats.users.recent} in last 30 days
              </div>
            </div>

            {/* Presets */}
            <div className="card">
              <div className="text-sm text-text-secondary mb-2">Total Presets</div>
              <div className="text-3xl font-bold text-ui-green">{stats.presets.total.toLocaleString()}</div>
              <div className="text-xs text-text-secondary mt-2">
                {stats.presets.public} public | {stats.presets.deleted} deleted
              </div>
            </div>

            {/* Comments */}
            <div className="card">
              <div className="text-sm text-text-secondary mb-2">Total Comments</div>
              <div className="text-3xl font-bold text-ui-yellow">{stats.engagement.comments.toLocaleString()}</div>
            </div>

            {/* Likes */}
            <div className="card">
              <div className="text-sm text-text-secondary mb-2">Total Likes</div>
              <div className="text-3xl font-bold text-ui-red">{stats.engagement.likes.toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Creators */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">🏆 Top Creators</h2>
            <div className="space-y-3">
              {topCreators.map((creator, index) => (
                <div key={creator.id} className="flex items-center justify-between py-2 border-b border-border-color last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="text-text-disabled font-mono text-sm w-6">
                      #{index + 1}
                    </div>
                    <Link
                      href={`/users/${creator.id}`}
                      className="hover:text-ui-blue"
                    >
                      <div className="font-medium">{creator.name}</div>
                      {creator.username && (
                        <div className="text-sm text-text-secondary">@{creator.username}</div>
                      )}
                    </Link>
                  </div>
                  <div className="text-ui-blue font-bold">
                    {creator._count.presets} presets
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Presets */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">🔥 Most Popular Presets</h2>
            <div className="space-y-3">
              {popularPresets.map((preset, index) => (
                <div key={preset.id} className="py-2 border-b border-border-color last:border-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-text-disabled font-mono text-sm">#{index + 1}</span>
                        <Link
                          href={`/presets/${preset.id}`}
                          className="font-medium hover:text-ui-blue"
                        >
                          {preset.name}
                        </Link>
                      </div>
                      <div className="text-sm text-text-secondary">
                        by {preset.user.username || preset.user.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs text-text-secondary">
                    <span>❤️ {preset.likeCount}</span>
                    <span>⬇️ {preset.downloadCount}</span>
                    <span>👁️ {preset.viewCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Moderation Tools */}
        <div className="card mt-8">
          <h2 className="text-xl font-bold mb-4">🛠️ Moderation Tools</h2>
          <p className="text-text-secondary mb-6">
            Moderation actions are available on individual preset and user pages.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/presets" className="btn-secondary">
              Browse Presets
            </Link>
            <button className="btn-secondary" disabled>
              User Management (Soon)
            </button>
            <button className="btn-secondary" disabled>
              Reported Content (Soon)
            </button>
            <button className="btn-secondary" disabled>
              Moderation Log (Soon)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
