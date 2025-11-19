'use client';

/**
 * User Settings Page
 *
 * Edit profile, change password, manage preferences.
 * Features:
 * - Profile editing (name, username, bio)
 * - Password change
 * - Email update
 * - Account deletion (TODO)
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Load current user data
  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setUsername(session.user.username || '');
      setBio(session.user.bio || '');
      setEmail(session.user.email || '');
    }
  }, [session]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          username,
          bio,
          email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        // Update session
        await update({
          name: data.user.name,
          username: data.user.username,
          email: data.user.email,
        });
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ui-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading settings...</p>
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
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-text-secondary mt-1">
                Manage your account settings and preferences
              </p>
            </div>
            <Link href="/dashboard" className="btn-secondary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success/Error Messages */}
        {success && (
          <div className="bg-ui-green/10 border border-ui-green/30 text-ui-green px-4 py-3 rounded-lg mb-6">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-ui-red/10 border border-ui-red/30 text-ui-red px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Profile Settings */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-6">Profile Settings</h2>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Display Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                maxLength={100}
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input"
                maxLength={30}
                pattern="[a-zA-Z0-9_]+"
                placeholder="Only letters, numbers, and underscores"
              />
              <p className="text-xs text-text-disabled mt-1">
                Your public profile URL will be /users/{username || 'username'}
              </p>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="input resize-none"
                rows={4}
                maxLength={500}
                placeholder="Tell us about yourself..."
              />
              <p className="text-xs text-text-disabled mt-1">
                {bio.length}/500 characters
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-success"
            >
              {isSaving ? 'Saving...' : '💾 Save Changes'}
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-6">Change Password</h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                minLength={8}
                required
              />
              <p className="text-xs text-text-disabled mt-1">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                minLength={8}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn-primary"
            >
              {isChangingPassword ? 'Changing...' : '🔒 Change Password'}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="card border-ui-red/30">
          <h2 className="text-xl font-bold text-ui-red mb-4">Danger Zone</h2>
          <p className="text-text-secondary mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="btn-danger" disabled>
            🗑️ Delete Account (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
