'use client';

/**
 * Preset Detail Page
 *
 * Display full preset information with settings visualization.
 * Features:
 * - Preset name, description, author
 * - EQ curve visualization
 * - Compressor settings display
 * - Reverb settings display
 * - Download/Apply buttons
 * - Like button
 * - Share button
 * - Comments section (TODO)
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Comments from '@/components/social/Comments';

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
  user: {
    id: string;
    name: string;
    username?: string;
  };
  eqSettings: {
    bands: Array<{
      frequency: number;
      gain: number;
      q: number;
    }>;
  };
  compressorSettings: {
    threshold: number;
    ratio: number;
    attack: number;
    release: number;
    knee: number;
  };
  reverbSettings: {
    type: 'room' | 'hall' | 'plate' | 'spring' | 'none';
    wetDry: number;
    decay: number;
    roomSize: number;
  };
  limiterSettings: {
    enabled: boolean;
    threshold: number;
  };
  filterSettings: {
    highPass: {
      enabled: boolean;
      frequency: number;
    };
  };
}

export default function PresetDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [preset, setPreset] = useState<Preset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPreset();
  }, [params.id]);

  const fetchPreset = async () => {
    try {
      const response = await fetch(`/api/presets/${params.id}`);
      const data = await response.json();

      if (response.ok) {
        setPreset(data.preset);
      } else {
        setError(data.error || 'Failed to load preset');
      }
    } catch (err) {
      setError('Failed to load preset');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Download preset:', preset);
  };

  const handleApplyToLive = () => {
    // TODO: Navigate to live page with preset data
    router.push(`/live?preset=${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-ui-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary">Loading preset...</p>
        </div>
      </div>
    );
  }

  if (error || !preset) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-bold mb-2">{error || 'Preset not found'}</h2>
          <button onClick={() => router.push('/presets')} className="btn-primary mt-4">
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-color">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="text-text-secondary hover:text-text-primary mb-4 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{preset.name}</h1>
              {preset.description && (
                <p className="text-text-secondary text-lg mb-4">{preset.description}</p>
              )}

              {/* Author */}
              <Link
                href={`/users/${preset.user.id}`}
                className="flex items-center gap-2 text-sm hover:text-ui-blue"
              >
                <div className="w-8 h-8 rounded-full bg-ui-blue/20 flex items-center justify-center text-ui-blue font-bold">
                  {preset.user.name.charAt(0).toUpperCase()}
                </div>
                <span>{preset.user.username || preset.user.name}</span>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleApplyToLive}
                className="btn-success"
              >
                🎤 Apply to Live
              </button>
              <button
                onClick={handleDownload}
                className="btn-primary"
              >
                ⬇️ Download
              </button>
            </div>
          </div>

          {/* Tags & Stats */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border-color">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {preset.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/presets?tags=${tag}`}
                  className="text-sm px-3 py-1 bg-bg-elevated rounded-full hover:bg-ui-blue hover:text-white transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-text-secondary">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{preset.likeCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>{preset.downloadCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{preset.viewCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* EQ Settings */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">📊 EQ Settings</h2>
            <div className="grid grid-cols-5 gap-4">
              {preset.eqSettings.bands.map((band, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs text-text-secondary mb-1">
                    {band.frequency >= 1000
                      ? `${(band.frequency / 1000).toFixed(1)}k`
                      : band.frequency}Hz
                  </div>
                  <div
                    className={`font-bold ${
                      band.gain > 0
                        ? 'text-ui-green'
                        : band.gain < 0
                        ? 'text-ui-red'
                        : 'text-text-disabled'
                    }`}
                  >
                    {band.gain > 0 ? '+' : ''}
                    {band.gain.toFixed(1)}dB
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compressor Settings */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">🎚️ Compressor</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-text-secondary">Threshold</div>
                <div className="font-mono font-bold">{preset.compressorSettings.threshold}dB</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Ratio</div>
                <div className="font-mono font-bold">{preset.compressorSettings.ratio}:1</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Attack</div>
                <div className="font-mono font-bold">{preset.compressorSettings.attack}ms</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Release</div>
                <div className="font-mono font-bold">{preset.compressorSettings.release}ms</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Knee</div>
                <div className="font-mono font-bold">{preset.compressorSettings.knee}dB</div>
              </div>
            </div>
          </div>

          {/* Reverb Settings */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">🌊 Reverb</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-text-secondary">Type</div>
                <div className="font-bold capitalize">{preset.reverbSettings.type}</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Wet/Dry</div>
                <div className="font-mono font-bold">{preset.reverbSettings.wetDry}%</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Decay</div>
                <div className="font-mono font-bold">{preset.reverbSettings.decay.toFixed(2)}s</div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Room Size</div>
                <div className="font-mono font-bold">{(preset.reverbSettings.roomSize * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>

          {/* High-Pass Filter */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">🔊 High-Pass Filter</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-text-secondary">Status</div>
                <div className="font-bold">
                  {preset.filterSettings.highPass.enabled ? (
                    <span className="text-ui-green">✓ Enabled</span>
                  ) : (
                    <span className="text-text-disabled">✗ Disabled</span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-text-secondary">Cutoff</div>
                <div className="font-mono font-bold">{preset.filterSettings.highPass.frequency}Hz</div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">💬 Comments</h2>
          <Comments presetId={params.id} />
        </div>
      </div>
    </div>
  );
}
