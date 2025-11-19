'use client';

/**
 * Compressor Controls Component
 *
 * UI controls for dynamic range compression.
 * Features:
 * - Threshold slider (-100dB to 0dB)
 * - Ratio knob (1:1 to 20:1)
 * - Attack slider (0-1000ms)
 * - Release slider (0-3000ms)
 * - Knee slider (0-40dB)
 * - Gain reduction meter
 */

import { useState } from 'react';

export interface CompressorSettings {
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  knee: number;
}

interface CompressorControlsProps {
  settings: CompressorSettings;
  onChange: (settings: CompressorSettings) => void;
  disabled?: boolean;
}

export default function CompressorControls({
  settings,
  onChange,
  disabled = false
}: CompressorControlsProps) {
  const handleChange = (key: keyof CompressorSettings, value: number) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4">🎚️ Compressor</h3>

      <div className="space-y-4">
        {/* Threshold */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Threshold</label>
            <span className="text-sm font-mono text-text-secondary">
              {settings.threshold.toFixed(0)}dB
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="0"
            step="1"
            value={settings.threshold}
            onChange={(e) => handleChange('threshold', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-disabled mt-1">
            <span>-100dB</span>
            <span>0dB</span>
          </div>
        </div>

        {/* Ratio */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Ratio</label>
            <span className="text-sm font-mono text-text-secondary">
              {settings.ratio.toFixed(1)}:1
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="0.1"
            value={settings.ratio}
            onChange={(e) => handleChange('ratio', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-disabled mt-1">
            <span>1:1</span>
            <span>20:1</span>
          </div>
        </div>

        {/* Attack */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Attack</label>
            <span className="text-sm font-mono text-text-secondary">
              {settings.attack < 1000 ? `${settings.attack.toFixed(0)}ms` : `${(settings.attack / 1000).toFixed(2)}s`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1000"
            step="1"
            value={settings.attack}
            onChange={(e) => handleChange('attack', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-disabled mt-1">
            <span>0ms</span>
            <span>1s</span>
          </div>
        </div>

        {/* Release */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Release</label>
            <span className="text-sm font-mono text-text-secondary">
              {settings.release < 1000 ? `${settings.release.toFixed(0)}ms` : `${(settings.release / 1000).toFixed(2)}s`}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="3000"
            step="10"
            value={settings.release}
            onChange={(e) => handleChange('release', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-disabled mt-1">
            <span>0ms</span>
            <span>3s</span>
          </div>
        </div>

        {/* Knee */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Knee</label>
            <span className="text-sm font-mono text-text-secondary">
              {settings.knee.toFixed(0)}dB
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="1"
            value={settings.knee}
            onChange={(e) => handleChange('knee', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-disabled mt-1">
            <span>Hard</span>
            <span>Soft</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-4 border-t border-border-color">
          <div className="text-xs text-text-secondary mb-2">Quick Presets</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChange({
                threshold: -24,
                ratio: 4,
                attack: 3,
                release: 250,
                knee: 30
              })}
              disabled={disabled}
              className="btn-secondary text-sm py-1"
            >
              Vocal
            </button>
            <button
              onClick={() => onChange({
                threshold: -30,
                ratio: 6,
                attack: 1,
                release: 100,
                knee: 10
              })}
              disabled={disabled}
              className="btn-secondary text-sm py-1"
            >
              Beatbox
            </button>
            <button
              onClick={() => onChange({
                threshold: -12,
                ratio: 10,
                attack: 0.5,
                release: 50,
                knee: 5
              })}
              disabled={disabled}
              className="btn-secondary text-sm py-1"
            >
              Limiter
            </button>
            <button
              onClick={() => onChange({
                threshold: -40,
                ratio: 2,
                attack: 10,
                release: 500,
                knee: 40
              })}
              disabled={disabled}
              className="btn-secondary text-sm py-1"
            >
              Gentle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
