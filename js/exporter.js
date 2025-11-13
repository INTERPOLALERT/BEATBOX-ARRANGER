/**
 * exporter.js - Audio export using OfflineAudioContext
 * Supports WAV and MP3 encoding
 */

const Exporter = {
    /**
     * Export pattern as WAV
     * @param {Object} pattern - Pattern to export
     * @param {number} bpm - Tempo
     * @param {number} duration - Duration in bars (default 4)
     * @returns {Promise<Blob>}
     */
    async exportWAV(pattern, bpm, duration = 4) {
        console.log('Starting WAV export...', { pattern, bpm, duration });

        try {
            // Render audio using OfflineAudioContext
            const audioBuffer = await this.renderPattern(pattern, bpm, duration);

            // Encode to WAV
            const wavBlob = this.encodeWAV(audioBuffer);

            console.log('WAV export complete:', {
                size: (wavBlob.size / 1024).toFixed(2) + ' KB',
                duration: audioBuffer.duration.toFixed(2) + 's'
            });

            return wavBlob;
        } catch (error) {
            console.error('WAV export failed:', error);
            throw error;
        }
    },

    /**
     * Export pattern as MP3
     * @param {Object} pattern - Pattern to export
     * @param {number} bpm - Tempo
     * @param {number} duration - Duration in bars (default 4)
     * @returns {Promise<Blob>}
     */
    async exportMP3(pattern, bpm, duration = 4) {
        console.log('Starting MP3 export...', { pattern, bpm, duration });

        try {
            // Render audio using OfflineAudioContext
            const audioBuffer = await this.renderPattern(pattern, bpm, duration);

            // Encode to MP3
            const mp3Blob = await this.encodeMP3(audioBuffer);

            console.log('MP3 export complete:', {
                size: (mp3Blob.size / 1024).toFixed(2) + ' KB',
                duration: audioBuffer.duration.toFixed(2) + 's'
            });

            return mp3Blob;
        } catch (error) {
            console.error('MP3 export failed:', error);
            throw error;
        }
    },

    /**
     * Render pattern using OfflineAudioContext
     * @param {Object} pattern - Pattern to render
     * @param {number} bpm - Tempo
     * @param {number} duration - Duration in bars
     * @returns {Promise<AudioBuffer>}
     */
    async renderPattern(pattern, bpm, duration) {
        // Calculate total duration in seconds
        const secondsPerBeat = 60.0 / bpm;
        const secondsPerBar = secondsPerBeat * 4; // 4 beats per bar
        const totalDuration = secondsPerBar * duration;

        // Create OfflineAudioContext
        const sampleRate = AudioManager.context.sampleRate;
        const offlineContext = new OfflineAudioContext(2, sampleRate * totalDuration, sampleRate);

        console.log('Rendering with OfflineAudioContext:', {
            sampleRate,
            duration: totalDuration.toFixed(2) + 's',
            channels: 2
        });

        // Schedule all notes
        const secondsPerStep = secondsPerBeat / 4; // 16th notes
        const totalSteps = pattern.steps * duration;

        for (let step = 0; step < totalSteps; step++) {
            const patternStep = step % pattern.steps;
            const time = step * secondsPerStep;

            // Schedule each track
            Object.keys(pattern.tracks).forEach(category => {
                const trackPattern = pattern.tracks[category];

                // Check if this step should trigger
                if (trackPattern[patternStep] === 1) {
                    // Find sound in category
                    const sounds = AudioManager.getSoundsByCategory(category);

                    if (sounds.length > 0) {
                        const soundId = sounds[0].id;
                        const buffer = AudioManager.buffers[soundId];

                        if (buffer) {
                            // Create source node
                            const source = offlineContext.createBufferSource();
                            source.buffer = buffer;

                            // Connect to destination
                            source.connect(offlineContext.destination);

                            // Schedule playback
                            source.start(time);
                        }
                    }
                }
            });
        }

        // Render
        const renderedBuffer = await offlineContext.startRendering();

        console.log('Rendering complete');

        return renderedBuffer;
    },

    /**
     * Encode AudioBuffer to WAV
     * @param {AudioBuffer} audioBuffer - Buffer to encode
     * @returns {Blob}
     */
    encodeWAV(audioBuffer) {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length;
        const bitsPerSample = 16;

        // Interleave channels
        const interleaved = this.interleaveChannels(audioBuffer);

        // Convert to 16-bit PCM
        const pcmData = this.floatTo16BitPCM(interleaved);

        // Create WAV header
        const header = this.createWAVHeader(pcmData.length, sampleRate, numberOfChannels, bitsPerSample);

        // Combine header and data
        const wavData = new Uint8Array(header.byteLength + pcmData.byteLength);
        wavData.set(new Uint8Array(header), 0);
        wavData.set(new Uint8Array(pcmData), header.byteLength);

        return new Blob([wavData], { type: 'audio/wav' });
    },

    /**
     * Encode AudioBuffer to MP3 using lamejs
     * @param {AudioBuffer} audioBuffer - Buffer to encode
     * @returns {Promise<Blob>}
     */
    async encodeMP3(audioBuffer) {
        if (typeof lamejs === 'undefined') {
            throw new Error('lamejs library not loaded');
        }

        const numberOfChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const kbps = 128;

        // Get channel data
        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = numberOfChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

        // Convert to 16-bit PCM
        const leftPCM = this.floatTo16BitPCMArray(leftChannel);
        const rightPCM = this.floatTo16BitPCMArray(rightChannel);

        // Initialize MP3 encoder
        const mp3encoder = new lamejs.Mp3Encoder(numberOfChannels, sampleRate, kbps);

        // Encode in chunks
        const mp3Data = [];
        const sampleBlockSize = 1152; // Standard MP3 frame size

        for (let i = 0; i < leftPCM.length; i += sampleBlockSize) {
            const leftChunk = leftPCM.subarray(i, i + sampleBlockSize);
            const rightChunk = rightPCM.subarray(i, i + sampleBlockSize);

            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);

            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
        }

        // Flush remaining data
        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }

        // Create blob
        return new Blob(mp3Data, { type: 'audio/mp3' });
    },

    /**
     * Interleave stereo channels
     * @param {AudioBuffer} audioBuffer
     * @returns {Float32Array}
     */
    interleaveChannels(audioBuffer) {
        const numberOfChannels = audioBuffer.numberOfChannels;
        const length = audioBuffer.length;

        if (numberOfChannels === 1) {
            return audioBuffer.getChannelData(0);
        }

        // Interleave left and right channels
        const result = new Float32Array(length * numberOfChannels);
        const left = audioBuffer.getChannelData(0);
        const right = audioBuffer.getChannelData(1);

        for (let i = 0; i < length; i++) {
            result[i * 2] = left[i];
            result[i * 2 + 1] = right[i];
        }

        return result;
    },

    /**
     * Convert Float32Array to 16-bit PCM ArrayBuffer
     * @param {Float32Array} float32Array
     * @returns {ArrayBuffer}
     */
    floatTo16BitPCM(float32Array) {
        const buffer = new ArrayBuffer(float32Array.length * 2);
        const view = new DataView(buffer);

        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        return buffer;
    },

    /**
     * Convert Float32Array to 16-bit PCM Int16Array (for lamejs)
     * @param {Float32Array} float32Array
     * @returns {Int16Array}
     */
    floatTo16BitPCMArray(float32Array) {
        const int16Array = new Int16Array(float32Array.length);

        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        return int16Array;
    },

    /**
     * Create WAV file header
     * @param {number} dataLength - Length of PCM data
     * @param {number} sampleRate - Sample rate
     * @param {number} numberOfChannels - Number of channels
     * @param {number} bitsPerSample - Bits per sample
     * @returns {ArrayBuffer}
     */
    createWAVHeader(dataLength, sampleRate, numberOfChannels, bitsPerSample) {
        const buffer = new ArrayBuffer(44);
        const view = new DataView(buffer);

        // RIFF identifier
        this.writeString(view, 0, 'RIFF');
        // File length
        view.setUint32(4, 36 + dataLength, true);
        // RIFF type
        this.writeString(view, 8, 'WAVE');
        // Format chunk identifier
        this.writeString(view, 12, 'fmt ');
        // Format chunk length
        view.setUint32(16, 16, true);
        // Sample format (PCM)
        view.setUint16(20, 1, true);
        // Channel count
        view.setUint16(22, numberOfChannels, true);
        // Sample rate
        view.setUint32(24, sampleRate, true);
        // Byte rate
        view.setUint32(28, sampleRate * numberOfChannels * bitsPerSample / 8, true);
        // Block align
        view.setUint16(32, numberOfChannels * bitsPerSample / 8, true);
        // Bits per sample
        view.setUint16(34, bitsPerSample, true);
        // Data chunk identifier
        this.writeString(view, 36, 'data');
        // Data chunk length
        view.setUint32(40, dataLength, true);

        return buffer;
    },

    /**
     * Write string to DataView
     * @param {DataView} view
     * @param {number} offset
     * @param {string} string
     */
    writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    },

    /**
     * Download blob as file
     * @param {Blob} blob - Blob to download
     * @param {string} filename - Filename
     */
    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};
