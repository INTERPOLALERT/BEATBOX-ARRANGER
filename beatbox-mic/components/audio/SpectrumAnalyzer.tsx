'use client';

/**
 * Spectrum Analyzer Component
 *
 * Real-time frequency spectrum display using Canvas API.
 * Features:
 * - 60fps smooth animation
 * - Logarithmic frequency scale
 * - Color gradient based on amplitude
 * - High-DPI support
 * - Configurable bar count
 */

import { useEffect, useRef } from 'react';

interface SpectrumAnalyzerProps {
  analyser: AnalyserNode | null;
  width?: number;
  height?: number;
  barCount?: number;
  backgroundColor?: string;
  lowColor?: string;
  midColor?: string;
  highColor?: string;
}

export default function SpectrumAnalyzer({
  analyser,
  width = 800,
  height = 200,
  barCount = 64,
  backgroundColor = '#0a0a0a',
  lowColor = '#00ff88',
  midColor = '#ffcc00',
  highColor = '#ff4444'
}: SpectrumAnalyzerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Setup high-DPI canvas
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Get frequency data buffer
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    // Calculate bar width and spacing
    const barWidth = (width / barCount) * 0.8;
    const barSpacing = (width / barCount) * 0.2;

    // Helper function to interpolate colors
    const interpolateColor = (ratio: number): string => {
      if (ratio < 0.5) {
        // Low to mid (green to yellow)
        const r = Math.floor(ratio * 2 * 255);
        return `rgb(${r}, 255, ${136 - r})`;
      } else {
        // Mid to high (yellow to red)
        const r = Math.floor((ratio - 0.5) * 2 * 255);
        return `rgb(255, ${204 - r}, 0)`;
      }
    };

    // Animation loop
    const draw = () => {
      // Get frequency data
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Draw bars
      for (let i = 0; i < barCount; i++) {
        // Use logarithmic mapping for frequency bins
        const binIndex = Math.floor(Math.pow(i / barCount, 2) * bufferLength);
        const value = dataArray[binIndex] / 255; // Normalize to 0-1

        // Calculate bar height
        const barHeight = value * height;

        // Calculate position
        const x = i * (barWidth + barSpacing);
        const y = height - barHeight;

        // Set color based on amplitude
        ctx.fillStyle = interpolateColor(value);

        // Draw bar
        ctx.fillRect(x, y, barWidth, barHeight);

        // Add glow effect for high values
        if (value > 0.7) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = interpolateColor(value);
          ctx.fillRect(x, y, barWidth, barHeight);
          ctx.shadowBlur = 0;
        }
      }

      // Draw frequency labels
      ctx.fillStyle = '#666666';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';

      const labels = [
        { freq: '60Hz', pos: 0.05 },
        { freq: '250Hz', pos: 0.2 },
        { freq: '1kHz', pos: 0.4 },
        { freq: '4kHz', pos: 0.6 },
        { freq: '16kHz', pos: 0.9 }
      ];

      labels.forEach(label => {
        ctx.fillText(label.freq, width * label.pos, height - 5);
      });

      // Continue animation
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    // Start animation
    draw();

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, width, height, barCount, backgroundColor, lowColor, midColor, highColor]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="rounded-lg border border-border-color"
      />
      {!analyser && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-elevated/80 rounded-lg">
          <p className="text-text-secondary text-sm">No audio input</p>
        </div>
      )}
    </div>
  );
}
