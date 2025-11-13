// exporter.js - Export to WAV/MP3 using OfflineAudioContext
const Exporter = {
    async exportWAV(pattern, bpm, bars = 4) {
        console.log('Exporting WAV...');
        try {
            const audioBuffer = await this.render(pattern, bpm, bars);
            const wavBlob = this.encodeWAV(audioBuffer);
            console.log('✓ WAV ready:', (wavBlob.size / 1024).toFixed(1) + 'KB');
            return wavBlob;
        } catch (error) {
            console.error('WAV export failed:', error);
            throw error;
        }
    },

    async exportMP3(pattern, bpm, bars = 4) {
        console.log('Exporting MP3...');
        try {
            if (typeof lamejs === 'undefined') {
                throw new Error('lamejs library not loaded');
            }

            const audioBuffer = await this.render(pattern, bpm, bars);
            const mp3Blob = this.encodeMP3(audioBuffer);
            console.log('✓ MP3 ready:', (mp3Blob.size / 1024).toFixed(1) + 'KB');
            return mp3Blob;
        } catch (error) {
            console.error('MP3 export failed:', error);
            throw error;
        }
    },

    async render(pattern, bpm, bars) {
        const secondsPerBeat = 60.0 / bpm;
        const secondsPerBar = secondsPerBeat * 4;
        const totalDuration = secondsPerBar * bars;

        const sampleRate = AudioManager.context.sampleRate;
        const offlineContext = new OfflineAudioContext(2, sampleRate * totalDuration, sampleRate);

        console.log('Rendering:', totalDuration.toFixed(1) + 's');

        const secondsPerStep = secondsPerBeat / 4;
        const totalSteps = pattern.steps * bars;

        for (let step = 0; step < totalSteps; step++) {
            const patternStep = step % pattern.steps;
            const time = step * secondsPerStep;

            Object.keys(pattern.tracks).forEach(category => {
                const trackPattern = pattern.tracks[category];

                if (trackPattern[patternStep] === 1) {
                    const sounds = AudioManager.getSoundsByCategory(category);

                    if (sounds.length > 0) {
                        const buffer = AudioManager.buffers[sounds[0].id];

                        if (buffer) {
                            const source = offlineContext.createBufferSource();
                            source.buffer = buffer;
                            source.connect(offlineContext.destination);
                            source.start(time);
                        }
                    }
                }
            });
        }

        const rendered = await offlineContext.startRendering();
        console.log('✓ Rendered');
        return rendered;
    },

    encodeWAV(audioBuffer) {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const length = audioBuffer.length;

        // Interleave channels
        const interleaved = new Float32Array(length * numChannels);
        for (let ch = 0; ch < numChannels; ch++) {
            const channelData = audioBuffer.getChannelData(ch);
            for (let i = 0; i < length; i++) {
                interleaved[i * numChannels + ch] = channelData[i];
            }
        }

        // Convert to 16-bit PCM
        const pcmData = new Int16Array(interleaved.length);
        for (let i = 0; i < interleaved.length; i++) {
            const s = Math.max(-1, Math.min(1, interleaved[i]));
            pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        // Create WAV file
        const buffer = new ArrayBuffer(44 + pcmData.length * 2);
        const view = new DataView(buffer);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + pcmData.length * 2, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(36, 'data');
        view.setUint32(40, pcmData.length * 2, true);

        // Copy PCM data
        const dataView = new Int16Array(buffer, 44);
        dataView.set(pcmData);

        return new Blob([buffer], { type: 'audio/wav' });
    },

    encodeMP3(audioBuffer) {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, 128);

        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = numChannels > 1 ? audioBuffer.getChannelData(1) : leftChannel;

        // Convert to 16-bit PCM
        const left = new Int16Array(leftChannel.length);
        const right = new Int16Array(rightChannel.length);

        for (let i = 0; i < leftChannel.length; i++) {
            const s1 = Math.max(-1, Math.min(1, leftChannel[i]));
            left[i] = s1 < 0 ? s1 * 0x8000 : s1 * 0x7FFF;

            const s2 = Math.max(-1, Math.min(1, rightChannel[i]));
            right[i] = s2 < 0 ? s2 * 0x8000 : s2 * 0x7FFF;
        }

        // Encode
        const mp3Data = [];
        const blockSize = 1152;

        for (let i = 0; i < left.length; i += blockSize) {
            const leftChunk = left.subarray(i, i + blockSize);
            const rightChunk = right.subarray(i, i + blockSize);
            const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
        }

        const final = mp3encoder.flush();
        if (final.length > 0) {
            mp3Data.push(final);
        }

        return new Blob(mp3Data, { type: 'audio/mp3' });
    },

    download(blob, filename) {
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
