'use client';

/**
 * Preset Save Modal Component
 *
 * Modal for saving presets with metadata.
 * Features:
 * - Preset name input
 * - Description textarea
 * - Tags input (comma-separated)
 * - Public/private toggle
 * - Save button with loading state
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PresetSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  audioData: {
    audioFileUrl: string;
    audioFileName: string;
    audioDuration: number;
    sampleRate: number;
  };
  analysisData: {
    eq: any;
    compressor: any;
    reverb: any;
    limiter: any;
    filter: any;
  };
}

export default function PresetSaveModal({
  isOpen,
  onClose,
  audioData,
  analysisData
}: PresetSaveModalProps) {
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a preset name');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/presets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          ...audioData,
          eqSettings: analysisData.eq,
          compressorSettings: analysisData.compressor,
          reverbSettings: analysisData.reverb,
          limiterSettings: analysisData.limiter,
          filterSettings: analysisData.filter,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          isPublic,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Navigate to preset detail page
        router.push(`/presets/${data.preset.id}`);
      } else {
        setError(data.error || 'Failed to save preset');
      }
    } catch (err) {
      setError('Failed to save preset');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">💾 Save Preset</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Preset Name *
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Professional Beatbox 2024"
              className="input"
              maxLength={100}
              disabled={isSaving}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your preset... (e.g., Perfect for live performances, crisp highs, warm bass)"
              className="input resize-none"
              rows={3}
              maxLength={500}
              disabled={isSaving}
            />
            <p className="text-xs text-text-disabled mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium mb-2">
              Tags (optional)
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="beatbox, live, warm, bass-boost (comma-separated)"
              className="input"
              disabled={isSaving}
            />
            <p className="text-xs text-text-disabled mt-1">
              Separate tags with commas. Max 10 tags.
            </p>
          </div>

          {/* Public Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-5 h-5"
                disabled={isSaving}
              />
              <div>
                <div className="font-medium">Make this preset public</div>
                <div className="text-sm text-text-secondary">
                  Public presets can be discovered and used by other beatboxers
                </div>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-ui-red/10 border border-ui-red/30 text-ui-red px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !name.trim()}
              className="btn-success flex-1"
            >
              {isSaving ? 'Saving...' : '💾 Save Preset'}
            </button>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
