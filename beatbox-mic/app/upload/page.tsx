'use client';

/**
 * Audio Upload Page
 *
 * Features:
 * - Drag-and-drop audio file upload
 * - File validation (format, size, duration)
 * - Progress indicator
 * - Automatic analysis after upload
 * - Preview detected settings
 */

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { analyzeAudioBuffer } from '@/lib/audio/analysis';
import PresetSaveModal from '@/components/presets/PresetSaveModal';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  // File validation
  const validateFile = (file: File): string | null => {
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload MP3, WAV, OGG, or M4A files.';
    }

    if (file.size > MAX_SIZE) {
      return 'File is too large. Maximum size is 50MB.';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      setError(error);
      return;
    }

    setFile(selectedFile);
    setError('');
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // File input click handler
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Analyze audio file
  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError('');
    setUploadProgress(0);

    try {
      // Read file as array buffer
      const arrayBuffer = await file.arrayBuffer();
      setUploadProgress(30);

      // Decode audio data
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      setUploadProgress(60);

      // Validate duration
      if (audioBuffer.duration < 2) {
        throw new Error('Audio file is too short (minimum 2 seconds)');
      }
      if (audioBuffer.duration > 300) {
        throw new Error('Audio file is too long (maximum 5 minutes)');
      }

      // Run analysis
      const analysis = await analyzeAudioBuffer(audioBuffer);
      setUploadProgress(100);
      setAnalysisResult(analysis);

      console.log('Analysis complete:', analysis);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze audio file');
      setUploadProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save preset and continue
  const handleSavePreset = () => {
    setIsSaveModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="border-b border-border-color">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Upload Audio for Analysis</h1>
          <p className="text-text-secondary mt-1">
            Upload a professional beatbox recording to extract EQ, compression, and reverb settings
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Upload Zone */}
        {!file && (
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              border-2 border-dashed rounded-lg p-16 text-center cursor-pointer
              transition-all duration-200
              ${
                isDragging
                  ? 'border-ui-green bg-ui-green/5 shadow-glow-green'
                  : 'border-border-color hover:border-ui-blue hover:bg-ui-blue/5'
              }
            `}
          >
            <div className="text-6xl mb-4">📁</div>
            <h2 className="text-2xl font-bold mb-2">
              {isDragging ? 'Drop file here' : 'Drop audio file or click to browse'}
            </h2>
            <p className="text-text-secondary mb-4">
              Supported formats: MP3, WAV, OGG, M4A (max 50MB)
            </p>
            <p className="text-sm text-text-disabled">
              Duration: 2 seconds - 5 minutes
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/x-m4a"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* File Selected */}
        {file && !analysisResult && (
          <div className="card">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🎵</div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">{file.name}</h3>
                <p className="text-text-secondary text-sm">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              {!isAnalyzing && (
                <button
                  onClick={() => setFile(null)}
                  className="text-ui-red hover:underline text-sm"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Progress Bar */}
            {isAnalyzing && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-text-secondary">
                    Analyzing audio...
                  </span>
                  <span className="text-sm font-mono text-text-primary">
                    {uploadProgress}%
                  </span>
                </div>
                <div className="level-meter">
                  <div
                    className="level-meter-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mt-4 bg-ui-red/10 border border-ui-red/30 text-ui-red px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Analyze Button */}
            {!isAnalyzing && !error && (
              <button
                onClick={handleAnalyze}
                className="btn-success w-full mt-6"
                disabled={isAnalyzing}
              >
                🔬 Analyze Audio
              </button>
            )}
          </div>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-2xl font-bold mb-4">✅ Analysis Complete!</h2>
              <p className="text-text-secondary">
                We've detected the following audio settings from your recording:
              </p>
            </div>

            {/* EQ Settings */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">📊 EQ Settings</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {analysisResult.eq.bands.slice(0, 10).map((band: any, i: number) => (
                  <div key={i} className="text-center">
                    <div className="font-mono text-sm text-text-secondary mb-1">
                      {band.frequency}Hz
                    </div>
                    <div
                      className={`font-bold ${
                        band.gain > 0 ? 'text-ui-green' : band.gain < 0 ? 'text-ui-red' : 'text-text-disabled'
                      }`}
                    >
                      {band.gain > 0 ? '+' : ''}
                      {band.gain.toFixed(1)}dB
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compression */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">🎚️ Compression</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-text-secondary text-sm">Threshold</div>
                  <div className="font-mono font-bold">{analysisResult.compressor.threshold}dB</div>
                </div>
                <div>
                  <div className="text-text-secondary text-sm">Ratio</div>
                  <div className="font-mono font-bold">{analysisResult.compressor.ratio}:1</div>
                </div>
                <div>
                  <div className="text-text-secondary text-sm">Attack</div>
                  <div className="font-mono font-bold">{analysisResult.compressor.attack}ms</div>
                </div>
                <div>
                  <div className="text-text-secondary text-sm">Release</div>
                  <div className="font-mono font-bold">{analysisResult.compressor.release}ms</div>
                </div>
              </div>
            </div>

            {/* Reverb */}
            <div className="card">
              <h3 className="text-xl font-bold mb-4">🌊 Reverb</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-text-secondary text-sm">Type</div>
                  <div className="font-bold capitalize">{analysisResult.reverb.type}</div>
                </div>
                <div>
                  <div className="text-text-secondary text-sm">Wet/Dry Mix</div>
                  <div className="font-mono font-bold">{analysisResult.reverb.wetDry.toFixed(0)}%</div>
                </div>
                <div>
                  <div className="text-text-secondary text-sm">Decay</div>
                  <div className="font-mono font-bold">{analysisResult.reverb.decay.toFixed(2)}s</div>
                </div>
                <div>
                  <div className="text-text-secondary text-sm">Room Size</div>
                  <div className="font-mono font-bold">{(analysisResult.reverb.roomSize * 100).toFixed(0)}%</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button onClick={handleSavePreset} className="btn-success flex-1">
                💾 Save as Preset
              </button>
              <button onClick={() => setFile(null)} className="btn-secondary flex-1">
                ↻ Upload Another File
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preset Save Modal */}
      {analysisResult && file && (
        <PresetSaveModal
          isOpen={isSaveModalOpen}
          onClose={() => setIsSaveModalOpen(false)}
          audioData={{
            audioFileUrl: URL.createObjectURL(file),
            audioFileName: file.name,
            audioDuration: analysisResult.metadata?.duration || 0,
            sampleRate: analysisResult.metadata?.sampleRate || 44100,
          }}
          analysisData={analysisResult}
        />
      )}
    </div>
  );
}
