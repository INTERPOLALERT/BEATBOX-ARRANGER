'use client';

/**
 * Reverb Controls Component
 *
 * UI controls for reverb effect.
 * Features:
 * - Type selector (Room, Hall, Plate, Spring)
 * - Wet/Dry mix (0-100%)
 * - Decay time (0.1-10s)
 * - Room size (0-100%)
 * - Pre-delay (0-100ms)
 */

import { useState } from 'react';

export interface ReverbSettings {
  type: 'room' | 'hall' | 'plate' | 'spring';
  wetDry: number;
  decay: number;
  roomSize: number;
  preDelay: number;
}

interface ReverbControlsProps {
  settings: ReverbSettings;
  onChange: (settings: ReverbSettings) => void;
  disabled?: boolean;
}

export default function ReverbControls({
  settings,
  onChange,
  disabled = false
}: ReverbControlsProps) {
  const handleChange = (key: keyof ReverbSettings, value: any) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  const reverbTypes = [
    { value: 'room', label: 'Room', icon: '🏠' },
    { value: 'hall', label: 'Hall', icon: '🏛️' },
    { value: 'plate', label: 'Plate', icon: '📡' },
    { value: 'spring', label: 'Spring', icon: '🌀' }
  ] as const;

  return (
    <div className="card">
      <h3 className="text-lg font-bold mb-4">🌊 Reverb</h3>

      <div className="space-y-4">
        {/* Type Selector */}
        <div>
          <label className="text-sm font-medium block mb-2">Type</label>
          <div className="grid grid-cols-4 gap-2">
            {reverbTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => handleChange('type', type.value)}
                disabled={disabled}
                className={`
                  py-3 px-2 rounded-lg border transition-all text-sm
                  ${settings.type === type.value
                    ? 'border-ui-blue bg-ui-blue/20 text-ui-blue font-bold'
                    : 'border-border-color bg-bg-elevated hover:border-ui-blue/50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="text-xs">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Wet/Dry Mix */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Wet/Dry Mix</label>
            <span className="text-sm font-mono text-text-secondary">
              {settings.wetDry.toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={settings.wetDry}
            onChange={(e) => handleChange('wetDry', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-disabled mt-1">
            <span>Dry</span>
            <span>Wet</span>
          </div>
        </div>

        {/* Decay Time */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Decay Time</label>
            <span className="text-sm font-mono text-text-secondary">
              {settings.decay.toFixed(2)}s
            </span>
          </div>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={settings.decay}
            onChange={(e) => handleChange('decay', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-disabled mt-1">
            <span>0.1s</span>
            <span>10s</span>
          </div>
        </div>

        {/* Room Size */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Room Size</label>
            <span className="text-sm font-mono text-text-secondary">
              {settings.roomSize.toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={settings.roomSize}
            onChange={(e) => handleChange('roomSize', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-disabled mt-1">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* Pre-Delay */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">Pre-Delay</label>
            <span className="text-sm font-mono text-text-secondary">
              {settings.preDelay.toFixed(0)}ms
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={settings.preDelay}
            onChange={(e) => handleChange('preDelay', parseFloat(e.target.value))}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-text-disabled mt-1">
            <span>0ms</span>
            <span>100ms</span>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-4 border-t border-border-color">
          <div className="text-xs text-text-secondary mb-2">Quick Presets</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onChange({
                type: 'room',
                wetDry: 15,
                decay: 0.8,
                roomSize: 30,
                preDelay: 10
              })}
              disabled={disabled}
              className="btn-secondary text-sm py-1"
            >
              Booth
            </button>
            <button
              onClick={() => onChange({
                type: 'hall',
                wetDry: 30,
                decay: 2.5,
                roomSize: 70,
                preDelay: 20
              })}
              disabled={disabled}
              className="btn-secondary text-sm py-1"
            >
              Concert
            </button>
            <button
              onClick={() => onChange({
                type: 'plate',
                wetDry: 25,
                decay: 1.2,
                roomSize: 50,
                preDelay: 5
              })}
              disabled={disabled}
              className="btn-secondary text-sm py-1"
            >
              Studio
            </button>
            <button
              onClick={() => onChange({
                type: 'spring',
                wetDry: 20,
                decay: 0.5,
                roomSize: 40,
                preDelay: 0
              })}
              disabled={disabled}
              className="btn-secondary text-sm py-1"
            >
              Vintage
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
