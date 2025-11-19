'use client';

/**
 * Level Meter Component
 *
 * VU-style audio level meter with peak hold.
 * Features:
 * - Real-time RMS level display
 * - Peak hold indicator
 * - Color zones (green/yellow/red)
 * - Clipping detection
 * - Smooth ballistics
 */

import { useEffect, useRef, useState } from 'react';

interface LevelMeterProps {
  analyser: AnalyserNode | null;
  label?: string;
  width?: number;
  height?: number;
  orientation?: 'horizontal' | 'vertical';
}

export default function LevelMeter({
  analyser,
  label = 'Input',
  width = 300,
  height = 24,
  orientation = 'horizontal'
}: LevelMeterProps) {
  const [level, setLevel] = useState(0);
  const [peak, setPeak] = useState(0);
  const [isClipping, setIsClipping] = useState(false);
  const animationFrameRef = useRef<number>();
  const peakHoldTimeoutRef = useRef<NodeJS.Timeout>();
  const peakDecayTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!analyser) {
      setLevel(0);
      setPeak(0);
      return;
    }

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    // Update level
    const updateLevel = () => {
      analyser.getByteTimeDomainData(dataArray);

      // Calculate RMS
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128;
        sum += normalized * normalized;
      }
      const rms = Math.sqrt(sum / bufferLength);

      // Convert to dB scale (0-100)
      const db = Math.min(100, rms * 100 * 1.5);

      // Smooth level changes (ballistics)
      setLevel(prev => {
        const attack = 0.3;
        const release = 0.1;
        if (db > prev) {
          return prev + (db - prev) * attack;
        } else {
          return prev + (db - prev) * release;
        }
      });

      // Update peak
      if (db > peak) {
        setPeak(db);

        // Clipping detection (>95%)
        if (db > 95) {
          setIsClipping(true);
          setTimeout(() => setIsClipping(false), 1000);
        }

        // Reset peak hold after 2 seconds
        if (peakHoldTimeoutRef.current) {
          clearTimeout(peakHoldTimeoutRef.current);
        }
        peakHoldTimeoutRef.current = setTimeout(() => {
          // Start peak decay
          const decay = () => {
            setPeak(prev => {
              const newPeak = Math.max(0, prev - 0.5);
              if (newPeak > 0) {
                peakDecayTimeoutRef.current = setTimeout(decay, 50);
              }
              return newPeak;
            });
          };
          decay();
        }, 2000);
      }

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (peakHoldTimeoutRef.current) {
        clearTimeout(peakHoldTimeoutRef.current);
      }
      if (peakDecayTimeoutRef.current) {
        clearTimeout(peakDecayTimeoutRef.current);
      }
    };
  }, [analyser, peak]);

  // Get color based on level
  const getColor = (value: number): string => {
    if (value > 85) return '#ff4444'; // Red
    if (value > 70) return '#ffcc00'; // Yellow
    return '#00ff88'; // Green
  };

  if (orientation === 'vertical') {
    return (
      <div className="flex flex-col items-center gap-2">
        {/* Label */}
        <div className="text-xs text-text-secondary font-medium">
          {label}
        </div>

        {/* Vertical Meter */}
        <div
          className="relative bg-bg-elevated border border-border-color rounded-full overflow-hidden"
          style={{ width: `${height}px`, height: `${width}px` }}
        >
          {/* Level Fill */}
          <div
            className="absolute bottom-0 left-0 right-0 transition-all duration-100"
            style={{
              height: `${level}%`,
              backgroundColor: getColor(level)
            }}
          />

          {/* Peak Indicator */}
          {peak > 0 && (
            <div
              className="absolute left-0 right-0 h-1 bg-white"
              style={{ bottom: `${peak}%` }}
            />
          )}

          {/* dB Markers */}
          {[0, 25, 50, 75, 100].map(db => (
            <div
              key={db}
              className="absolute left-0 right-0 border-t border-border-color/30"
              style={{ bottom: `${db}%` }}
            />
          ))}
        </div>

        {/* Peak Value */}
        <div className={`text-xs font-mono ${isClipping ? 'text-ui-red font-bold' : 'text-text-secondary'}`}>
          {isClipping ? 'CLIP!' : `${Math.round(level)}%`}
        </div>
      </div>
    );
  }

  // Horizontal orientation
  return (
    <div className="flex flex-col gap-1">
      {/* Label */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-secondary font-medium">
          {label}
        </div>
        <div className={`text-xs font-mono ${isClipping ? 'text-ui-red font-bold' : 'text-text-secondary'}`}>
          {isClipping ? 'CLIP!' : `${Math.round(level)}%`}
        </div>
      </div>

      {/* Horizontal Meter */}
      <div
        className="relative bg-bg-elevated border border-border-color rounded-full overflow-hidden"
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        {/* Level Fill */}
        <div
          className="absolute left-0 top-0 bottom-0 transition-all duration-100"
          style={{
            width: `${level}%`,
            backgroundColor: getColor(level)
          }}
        />

        {/* Peak Indicator */}
        {peak > 0 && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-white"
            style={{ left: `${peak}%` }}
          />
        )}

        {/* dB Markers */}
        <div className="absolute inset-0 flex">
          {[0, 25, 50, 70, 85, 100].map(db => (
            <div
              key={db}
              className="h-full border-l border-border-color/30"
              style={{ marginLeft: `${db === 0 ? 0 : db}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
