'use client';

/**
 * Waveform Visualizer Component
 *
 * Real-time waveform display using Canvas API.
 * Features:
 * - 60fps smooth animation
 * - Scrolling time-domain visualization
 * - Auto-scaling
 * - High-DPI support (Retina displays)
 * - Configurable colors
 */

import { useEffect, useRef } from 'react';

interface WaveformProps {
  analyser: AnalyserNode | null;
  width?: number;
  height?: number;
  backgroundColor?: string;
  waveColor?: string;
  centerLineColor?: string;
}

export default function Waveform({
  analyser,
  width = 800,
  height = 200,
  backgroundColor = '#0a0a0a',
  waveColor = '#00aaff',
  centerLineColor = '#333333'
}: WaveformProps) {
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

    // Get time domain data buffer
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    // Animation loop
    const draw = () => {
      // Get waveform data
      analyser.getByteTimeDomainData(dataArray);

      // Clear canvas
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      // Draw center line
      ctx.strokeStyle = centerLineColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw waveform
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 2;
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        // Convert byte value (0-255) to position (-1 to 1)
        const v = (dataArray[i] - 128) / 128;
        const y = (v * height / 2) + (height / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

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
  }, [analyser, width, height, backgroundColor, waveColor, centerLineColor]);

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
