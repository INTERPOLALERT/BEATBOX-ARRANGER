'use client';

/**
 * User Dashboard Page
 *
 * Personal dashboard showing user's presets, stats, and activity.
 * Features:
 * - User stats (presets, followers, likes, downloads)
 * - My presets grid
 * - Quick actions
 * - Recent activity
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PresetCard from '@/components/presets/PresetCard';

interface UserStats {
  presetCount: number;
  followerCount: number;
  followingCount: number;
  totalLikes: number;
  totalDownloads: number;
}

interface Preset {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  likeCount: number;
  downloadCount: number;
  viewCount: number;
  isPublic: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    if (!session?.user?.id) return;

    try {
      // Fetch user profile with stats
      const userResponse = await fetch(`/api/users/${session.user.id}`);
      const userData = await userResponse.json();

      if (userResponse.ok) {
        setStats(userData.user.stats);
      }

      // Fetch user's presets
      const presetsResponse = await fetch(`/api/presets?userId=${session.user.id}`);
      const presetsData = await presetsResponse.json();

      if (presetsResponse.ok) {
        setPresets(presetsData.presets);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ui-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-color">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-text-secondary mt-1">
                Welcome back, {session.user.name}!
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/upload" className="btn-success">
                ✨ Create Preset
              </Link>
              <Link href="/settings" className="btn-secondary">
                ⚙️ Settings
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="card text-center">
              <div className="text-3xl font-bold text-ui-blue">{stats.presetCount}</div>
              <div className="text-sm text-text-secondary mt-1">Presets</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-ui-green">{stats.totalLikes}</div>
              <div className="text-sm text-text-secondary mt-1">Total Likes</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-ui-yellow">{stats.totalDownloads}</div>
              <div className="text-sm text-text-secondary mt-1">Downloads</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-text-primary">{stats.followerCount}</div>
              <div className="text-sm text-text-secondary mt-1">Followers</div>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-text-primary">{stats.followingCount}</div>
              <div className="text-sm text-text-secondary mt-1">Following</div>
            </div>
          </div>
        )}

        {/* My Presets */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">My Presets</h2>
            {presets.length > 0 && (
              <Link href={`/users/${session.user.id}`} className="text-ui-blue hover:underline text-sm">
                View All →
              </Link>
            )}
          </div>

          {presets.length === 0 ? (
            <div className="card text-center py-16">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-xl font-bold mb-2">No presets yet</h3>
              <p className="text-text-secondary mb-6">
                Upload your first audio file or create a custom preset
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/upload" className="btn-success">
                  📤 Upload Audio
                </Link>
                <Link href="/live" className="btn-primary">
                  🎤 Create from Live
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {presets.slice(0, 6).map((preset) => (
                <PresetCard
                  key={preset.id}
                  id={preset.id}
                  name={preset.name}
                  description={preset.description}
                  author={{
                    id: session.user.id,
                    name: session.user.name || '',
                    username: session.user.username,
                  }}
                  tags={preset.tags}
                  likeCount={preset.likeCount}
                  downloadCount={preset.downloadCount}
                  viewCount={preset.viewCount}
                  createdAt={new Date(preset.createdAt)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/upload" className="btn-secondary">
              📤 Upload Audio
            </Link>
            <Link href="/live" className="btn-secondary">
              🎤 Live Processing
            </Link>
            <Link href="/presets" className="btn-secondary">
              📚 Browse Library
            </Link>
            <Link href="/settings" className="btn-secondary">
              ⚙️ Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
