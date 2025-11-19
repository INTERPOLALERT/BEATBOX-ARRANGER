'use client';

/**
 * User Profile Page
 *
 * Public profile view showing user info, presets, and stats.
 * Features:
 * - User info and bio
 * - Follow/unfollow button
 * - Stats (presets, followers, likes, downloads)
 * - User's public presets grid
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PresetCard from '@/components/presets/PresetCard';

interface User {
  id: string;
  name: string;
  username?: string;
  bio?: string;
  image?: string;
  createdAt: string;
  stats: {
    presetCount: number;
    followerCount: number;
    followingCount: number;
    totalLikes: number;
    totalDownloads: number;
  };
  isFollowing: boolean;
}

interface Preset {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  likeCount: number;
  downloadCount: number;
  viewCount: number;
  createdAt: string;
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [error, setError] = useState('');

  const isOwnProfile = session?.user?.id === params.id;

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      // Fetch user profile
      const userResponse = await fetch(`/api/users/${params.id}`);
      const userData = await userResponse.json();

      if (userResponse.ok) {
        setUser(userData.user);
        setIsFollowing(userData.user.isFollowing);
      } else {
        setError(userData.error || 'Failed to load profile');
      }

      // Fetch user's public presets
      const presetsResponse = await fetch(`/api/presets?userId=${params.id}`);
      const presetsData = await presetsResponse.json();

      if (presetsResponse.ok) {
        setPresets(presetsData.presets);
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!session) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/users/${params.id}/follow`, {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setIsFollowing(data.following);
        // Update follower count
        if (user) {
          setUser({
            ...user,
            stats: {
              ...user.stats,
              followerCount: user.stats.followerCount + (data.following ? 1 : -1),
            },
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ui-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold mb-2">{error || 'User not found'}</h2>
          <button onClick={() => router.back()} className="btn-primary mt-4">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Profile Header */}
      <div className="bg-bg-elevated border-b border-border-color">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-ui-blue/20 flex items-center justify-center text-ui-blue font-bold text-4xl flex-shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  {user.username && (
                    <p className="text-text-secondary mt-1">@{user.username}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {isOwnProfile ? (
                    <>
                      <Link href="/dashboard" className="btn-secondary">
                        📊 Dashboard
                      </Link>
                      <Link href="/settings" className="btn-secondary">
                        ⚙️ Settings
                      </Link>
                    </>
                  ) : (
                    <button
                      onClick={handleFollow}
                      className={isFollowing ? 'btn-secondary' : 'btn-primary'}
                    >
                      {isFollowing ? '✓ Following' : '+ Follow'}
                    </button>
                  )}
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <p className="text-text-primary mb-4">{user.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-bold text-text-primary">{user.stats.presetCount}</span>
                  <span className="text-text-secondary ml-1">Presets</span>
                </div>
                <div>
                  <span className="font-bold text-text-primary">{user.stats.followerCount}</span>
                  <span className="text-text-secondary ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-text-primary">{user.stats.followingCount}</span>
                  <span className="text-text-secondary ml-1">Following</span>
                </div>
                <div>
                  <span className="font-bold text-ui-green">{user.stats.totalLikes}</span>
                  <span className="text-text-secondary ml-1">Likes</span>
                </div>
                <div>
                  <span className="font-bold text-ui-blue">{user.stats.totalDownloads}</span>
                  <span className="text-text-secondary ml-1">Downloads</span>
                </div>
              </div>

              {/* Join Date */}
              <p className="text-text-disabled text-sm mt-4">
                Joined {joinDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-xl font-bold mb-6">
          {isOwnProfile ? 'My' : `${user.name}'s`} Presets
        </h2>

        {presets.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-xl font-bold mb-2">No public presets yet</h3>
            <p className="text-text-secondary">
              {isOwnProfile
                ? 'Upload your first audio file to create a preset'
                : `${user.name} hasn't published any presets yet`}
            </p>
            {isOwnProfile && (
              <Link href="/upload" className="btn-success mt-6">
                ✨ Create Preset
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presets.map((preset) => (
              <PresetCard
                key={preset.id}
                id={preset.id}
                name={preset.name}
                description={preset.description}
                author={{
                  id: user.id,
                  name: user.name,
                  username: user.username,
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
    </div>
  );
}
