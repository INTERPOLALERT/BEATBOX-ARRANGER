'use client';

/**
 * Live Processing Page
 *
 * Real-time audio processing with microphone input.
 * Features:
 * - Microphone permission handling
 * - Real-time EQ, compression, reverb
 * - Waveform and spectrum visualization
 * - Preset loading and saving
 * - Level meters with clipping detection
 * - <20ms latency target
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LiveAudioProcessor } from '@/lib/audio/processor';
import EQSlider from '@/components/audio/EQSlider';
import Waveform from '@/components/audio/Waveform';
import SpectrumAnalyzer from '@/components/audio/SpectrumAnalyzer';
import LevelMeter from '@/components/audio/LevelMeter';
import CompressorControls, { CompressorSettings } from '@/components/audio/CompressorControls';
import ReverbControls, { ReverbSettings } from '@/components/audio/ReverbControls';
import PresetSaveModal from '@/components/presets/PresetSaveModal';

export default function LivePage() {
  const router = useRouter();
  const processorRef = useRef<LiveAudioProcessor | null>(null);

  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [inputAnalyser, setInputAnalyser] = useState<AnalyserNode | null>(null);
  const [outputAnalyser, setOutputAnalyser] = useState<AnalyserNode | null>(null);

  // EQ Settings (10 bands)
  const [eqGains, setEqGains] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const eqFrequencies = [60, 120, 250, 500, 1000, 2000, 4000, 8000, 12000, 16000];

  // Compressor Settings
  const [compressorSettings, setCompressorSettings] = useState<CompressorSettings>({
    threshold: -24,
    ratio: 4,
    attack: 3,
    release: 250,
    knee: 30
  });

  // Reverb Settings
  const [reverbSettings, setReverbSettings] = useState<ReverbSettings>({
    type: 'room',
    wetDry: 15,
    decay: 0.8,
    roomSize: 30,
    preDelay: 10
  });

  // High-pass filter
  const [highPassEnabled, setHighPassEnabled] = useState(true);
  const [highPassFrequency, setHighPassFrequency] = useState(80);

  // Preset save modal
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // Initialize audio processor
  const initializeProcessor = async () => {
    try {
      setError('');
      const processor = new LiveAudioProcessor();
      await processor.initialize();
      processorRef.current = processor;

      // Get analysers for visualization
      const inputAnalyserNode = processor.getInputAnalyser();
      const outputAnalyserNode = processor.getOutputAnalyser();
      setInputAnalyser(inputAnalyserNode);
      setOutputAnalyser(outputAnalyserNode);

      setIsInitialized(true);
      setIsProcessing(true);
    } catch (err: any) {
      if (err.name === 'NotAllowedError') {
        setError('Microphone permission denied. Please allow microphone access.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.');
      } else {
        setError(err.message || 'Failed to initialize audio processor');
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (processorRef.current) {
        processorRef.current.destroy();
      }
    };
  }, []);

  // Apply EQ changes
  useEffect(() => {
    if (processorRef.current && isProcessing) {
      eqGains.forEach((gain, index) => {
        processorRef.current?.setEQBand(index, gain);
      });
    }
  }, [eqGains, isProcessing]);

  // Apply compressor changes
  useEffect(() => {
    if (processorRef.current && isProcessing) {
      processorRef.current.setCompressor(
        compressorSettings.threshold,
        compressorSettings.ratio,
        compressorSettings.attack / 1000, // Convert to seconds
        compressorSettings.release / 1000,
        compressorSettings.knee
      );
    }
  }, [compressorSettings, isProcessing]);

  // Apply reverb changes
  useEffect(() => {
    if (processorRef.current && isProcessing) {
      processorRef.current.setReverb(
        reverbSettings.type,
        reverbSettings.wetDry / 100,
        reverbSettings.decay,
        reverbSettings.roomSize / 100
      );
    }
  }, [reverbSettings, isProcessing]);

  // Apply high-pass filter
  useEffect(() => {
    if (processorRef.current && isProcessing) {
      processorRef.current.setHighPassFilter(highPassEnabled, highPassFrequency);
    }
  }, [highPassEnabled, highPassFrequency, isProcessing]);

  // Handle EQ band change
  const handleEQChange = (index: number, gain: number) => {
    const newGains = [...eqGains];
    newGains[index] = gain;
    setEqGains(newGains);
  };

  // Reset all settings
  const handleReset = () => {
    setEqGains([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    setCompressorSettings({
      threshold: -24,
      ratio: 4,
      attack: 3,
      release: 250,
      knee: 30
    });
    setReverbSettings({
      type: 'room',
      wetDry: 15,
      decay: 0.8,
      roomSize: 30,
      preDelay: 10
    });
    setHighPassEnabled(true);
    setHighPassFrequency(80);
  };

  // Toggle processing
  const toggleProcessing = () => {
    if (processorRef.current) {
      if (isProcessing) {
        processorRef.current.bypass();
      } else {
        processorRef.current.resume();
      }
      setIsProcessing(!isProcessing);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-color">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🎤 Live Processing</h1>
              <p className="text-text-secondary mt-1">
                Real-time audio processing with &lt;20ms latency
              </p>
            </div>
            {isInitialized && (
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleProcessing}
                  className={`btn-${isProcessing ? 'danger' : 'success'}`}
                >
                  {isProcessing ? '⏸ Bypass' : '▶ Process'}
                </button>
                <button onClick={handleReset} className="btn-secondary">
                  ↻ Reset
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Microphone Permission */}
        {!isInitialized && (
          <div className="max-w-2xl mx-auto">
            <div className="card text-center">
              <div className="text-6xl mb-4">🎤</div>
              <h2 className="text-2xl font-bold mb-2">
                Enable Microphone Access
              </h2>
              <p className="text-text-secondary mb-6">
                Allow microphone access to start processing your audio in real-time.
                Your audio is processed locally in your browser and never sent to any server.
              </p>

              {error && (
                <div className="bg-ui-red/10 border border-ui-red/30 text-ui-red px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              <button
                onClick={initializeProcessor}
                className="btn-success"
              >
                🎤 Enable Microphone
              </button>

              <div className="mt-8 pt-8 border-t border-border-color">
                <h3 className="font-bold mb-2">What you'll get:</h3>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>✅ Professional-grade audio processing</li>
                  <li>✅ 10-band parametric EQ</li>
                  <li>✅ Dynamic compression</li>
                  <li>✅ Studio-quality reverb</li>
                  <li>✅ Real-time waveform and spectrum visualization</li>
                  <li>✅ &lt;20ms ultra-low latency</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Processing UI */}
        {isInitialized && (
          <div className="space-y-6">
            {/* Level Meters */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">📊 Audio Levels</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <LevelMeter
                  analyser={inputAnalyser}
                  label="Input Level"
                  width={400}
                />
                <LevelMeter
                  analyser={outputAnalyser}
                  label="Output Level"
                  width={400}
                />
              </div>
            </div>

            {/* Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Waveform */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4">〜 Waveform</h3>
                <Waveform analyser={outputAnalyser} width={600} height={150} />
              </div>

              {/* Spectrum */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4">📈 Spectrum</h3>
                <SpectrumAnalyzer analyser={outputAnalyser} width={600} height={150} />
              </div>
            </div>

            {/* High-Pass Filter */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">🔊 High-Pass Filter (Rumble Removal)</h3>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={highPassEnabled}
                    onChange={(e) => setHighPassEnabled(e.target.checked)}
                    className="w-5 h-5"
                  />
                  <span className="text-sm font-medium">Enable</span>
                </label>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Cutoff Frequency</span>
                    <span className="text-sm font-mono text-text-secondary">
                      {highPassFrequency}Hz
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="200"
                    step="5"
                    value={highPassFrequency}
                    onChange={(e) => setHighPassFrequency(parseInt(e.target.value))}
                    disabled={!highPassEnabled}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* 10-Band EQ */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">🎛️ 10-Band Parametric EQ</h3>
              <div className="overflow-x-auto">
                <div className="flex gap-4 justify-center min-w-max px-4">
                  {eqFrequencies.map((freq, index) => (
                    <EQSlider
                      key={freq}
                      frequency={freq}
                      gain={eqGains[index]}
                      onChange={(gain) => handleEQChange(index, gain)}
                      disabled={!isProcessing}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Effects */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compressor */}
              <CompressorControls
                settings={compressorSettings}
                onChange={setCompressorSettings}
                disabled={!isProcessing}
              />

              {/* Reverb */}
              <ReverbControls
                settings={reverbSettings}
                onChange={setReverbSettings}
                disabled={!isProcessing}
              />
            </div>

            {/* Actions */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">💾 Save Settings</h3>
              <p className="text-text-secondary text-sm mb-4">
                Save your current settings as a preset to use later or share with others.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  className="btn-success"
                >
                  💾 Save as Preset
                </button>
                <button className="btn-secondary">
                  📂 Load Preset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preset Save Modal */}
      {isInitialized && (
        <PresetSaveModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          audioData={{
            audioFileUrl: '', // TODO: Add recording functionality
            audioFileName: 'live-recording.wav',
            audioDuration: 0,
            sampleRate: 44100,
          }}
          analysisData={{
            eq: {
              bands: eqFrequencies.map((freq, i) => ({
                frequency: freq,
                gain: eqGains[i],
                q: 1.0,
              })),
            },
            compressor: compressorSettings,
            reverb: reverbSettings,
            limiter: {
              enabled: true,
              threshold: -1,
            },
            filter: {
              highPass: {
                enabled: highPassEnabled,
                frequency: highPassFrequency,
              },
            },
          }}
        />
      )}
    </div>
  );
}
