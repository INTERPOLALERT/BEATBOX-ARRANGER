'use client';

/**
 * EQ Slider Component
 *
 * A vertical slider for controlling EQ band gain.
 * Features:
 * - Vertical orientation
 * - -12dB to +12dB range
 * - Real-time visual feedback
 * - Smooth transitions
 * - Touch and mouse support
 */

import { useState, useRef, useEffect } from 'react';

interface EQSliderProps {
  frequency: number;
  gain: number;
  onChange: (gain: number) => void;
  disabled?: boolean;
}

export default function EQSlider({
  frequency,
  gain,
  onChange,
  disabled = false
}: EQSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const MIN_GAIN = -12;
  const MAX_GAIN = 12;
  const SLIDER_HEIGHT = 200; // pixels

  // Convert gain (-12 to +12) to position (0 to 1)
  const gainToPosition = (g: number): number => {
    return (MAX_GAIN - g) / (MAX_GAIN - MIN_GAIN);
  };

  // Convert position (0 to 1) to gain (-12 to +12)
  const positionToGain = (pos: number): number => {
    const g = MAX_GAIN - pos * (MAX_GAIN - MIN_GAIN);
    return Math.max(MIN_GAIN, Math.min(MAX_GAIN, g));
  };

  // Handle mouse/touch move
  const handleMove = (clientY: number) => {
    if (!sliderRef.current || disabled) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const offsetY = clientY - rect.top;
    const position = Math.max(0, Math.min(1, offsetY / rect.height));
    const newGain = positionToGain(position);

    // Round to 0.5dB increments for smooth control
    const roundedGain = Math.round(newGain * 2) / 2;
    onChange(roundedGain);
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleMove(e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientY);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    handleMove(e.touches[0].clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches.length > 0) {
      handleMove(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add/remove global event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging]);

  // Calculate visual position
  const position = gainToPosition(gain);
  const handleTop = position * SLIDER_HEIGHT;

  // Determine color based on gain
  const getColor = () => {
    if (gain > 3) return 'bg-ui-green';
    if (gain < -3) return 'bg-ui-red';
    return 'bg-ui-blue';
  };

  const getFillColor = () => {
    if (gain > 3) return 'bg-ui-green/30';
    if (gain < -3) return 'bg-ui-red/30';
    return 'bg-ui-blue/30';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Frequency Label */}
      <div className="text-xs text-text-secondary font-mono">
        {frequency >= 1000 ? `${(frequency / 1000).toFixed(1)}k` : frequency}Hz
      </div>

      {/* Slider Track */}
      <div
        ref={sliderRef}
        className={`relative bg-bg-elevated border border-border-color rounded-full ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{ width: '24px', height: `${SLIDER_HEIGHT}px` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Center Line (0dB) */}
        <div
          className="absolute left-0 right-0 border-t border-border-color"
          style={{ top: '50%' }}
        />

        {/* Fill (from center to handle) */}
        <div
          className={`absolute left-0 right-0 rounded-full transition-all ${getFillColor()}`}
          style={{
            top: position <= 0.5 ? `${handleTop}px` : '50%',
            bottom: position > 0.5 ? `${SLIDER_HEIGHT - handleTop}px` : '50%',
          }}
        />

        {/* Handle */}
        <div
          className={`absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full border-2 border-border-color shadow-lg transition-all ${getColor()} ${isDragging ? 'scale-110 shadow-glow-blue' : ''}`}
          style={{
            top: `${handleTop}px`,
            transform: `translate(-50%, -50%)`,
          }}
        />
      </div>

      {/* Gain Value */}
      <div className={`text-sm font-mono font-bold ${gain > 0 ? 'text-ui-green' : gain < 0 ? 'text-ui-red' : 'text-text-disabled'}`}>
        {gain > 0 ? '+' : ''}{gain.toFixed(1)}dB
      </div>
    </div>
  );
}
