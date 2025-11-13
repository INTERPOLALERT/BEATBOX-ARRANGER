// audioManager.js - Audio loading and playback
const AudioManager = {
    context: null,
    buffers: {},
    sounds: {},

    async init() {
        if (this.context) return true;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) {
                throw new Error('Web Audio API not supported');
            }

            this.context = new AudioContext();

            if (this.context.state === 'suspended') {
                await this.context.resume();
            }

            console.log('✓ AudioContext initialized:', this.context.sampleRate + 'Hz');
            return true;
        } catch (error) {
            console.error('AudioContext init failed:', error);
            return false;
        }
    },

    async ensureRunning() {
        if (!this.context) {
            await this.init();
        }
        if (this.context && this.context.state === 'suspended') {
            await this.context.resume();
        }
    },

    async loadSound(file, id, category = 'uncategorized') {
        await this.ensureRunning();

        try {
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer.slice(0));

            this.buffers[id] = audioBuffer;
            this.sounds[id] = {
                name: file.name,
                category: category,
                duration: audioBuffer.duration,
                arrayBuffer: arrayBuffer
            };

            // Save to storage
            await StorageManager.saveSound(id, {
                name: file.name,
                category: category,
                arrayBuffer: arrayBuffer
            });

            console.log('✓ Loaded:', file.name);
            return this.sounds[id];
        } catch (error) {
            console.error('Load sound failed:', error);
            throw error;
        }
    },

    async loadFromStorage() {
        await this.ensureRunning();

        try {
            const storedSounds = await StorageManager.getAllSounds();

            for (const sound of storedSounds) {
                try {
                    const audioBuffer = await this.context.decodeAudioData(sound.arrayBuffer.slice(0));
                    this.buffers[sound.id] = audioBuffer;
                    this.sounds[sound.id] = {
                        name: sound.name,
                        category: sound.category,
                        duration: audioBuffer.duration,
                        arrayBuffer: sound.arrayBuffer
                    };
                } catch (error) {
                    console.error('Failed to load stored sound:', sound.id, error);
                }
            }

            console.log('✓ Loaded', Object.keys(this.buffers).length, 'sounds from storage');
            return Object.keys(this.sounds).map(id => ({ id, ...this.sounds[id] }));
        } catch (error) {
            console.error('Load from storage failed:', error);
            return [];
        }
    },

    playSound(id, time = null, volume = 1.0) {
        if (!this.buffers[id]) {
            console.error('Sound not found:', id);
            return null;
        }

        const playTime = time !== null ? time : this.context.currentTime;

        const source = this.context.createBufferSource();
        source.buffer = this.buffers[id];

        const gainNode = this.context.createGain();
        gainNode.gain.value = volume;

        source.connect(gainNode);
        gainNode.connect(this.context.destination);

        source.start(playTime);

        return source;
    },

    async updateCategory(id, category) {
        if (this.sounds[id]) {
            this.sounds[id].category = category;
            const soundData = await StorageManager.getSound(id);
            if (soundData) {
                soundData.category = category;
                await StorageManager.saveSound(id, soundData);
            }
        }
    },

    async deleteSound(id) {
        delete this.buffers[id];
        delete this.sounds[id];
        await StorageManager.deleteSound(id);
    },

    getSoundsByCategory(category) {
        return Object.keys(this.sounds)
            .filter(id => this.sounds[id].category === category)
            .map(id => ({ id, ...this.sounds[id] }));
    },

    getAllSounds() {
        return Object.keys(this.sounds).map(id => ({ id, ...this.sounds[id] }));
    },

    getCurrentTime() {
        return this.context ? this.context.currentTime : 0;
    }
};
