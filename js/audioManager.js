/**
 * audioManager.js - AudioContext and sound management
 * Handles audio loading, decoding, and playback using Web Audio API
 */

const AudioManager = {
    // AudioContext instance
    context: null,

    // Loaded sound buffers: { id: AudioBuffer }
    buffers: {},

    // Sound metadata: { id: { name, category, duration, etc. } }
    sounds: {},

    /**
     * Initialize AudioContext
     * Note: Must be called after user interaction to avoid browser restrictions
     */
    async init() {
        if (this.context) {
            return; // Already initialized
        }

        try {
            // Create AudioContext
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();

            // Resume if suspended (browser autoplay policy)
            if (this.context.state === 'suspended') {
                await this.context.resume();
            }

            console.log('AudioContext initialized:', {
                sampleRate: this.context.sampleRate,
                state: this.context.state
            });

            return true;
        } catch (error) {
            console.error('Failed to initialize AudioContext:', error);
            throw new Error('Your browser does not support Web Audio API');
        }
    },

    /**
     * Ensure AudioContext is running
     */
    async ensureContextRunning() {
        if (!this.context) {
            await this.init();
        }

        if (this.context.state === 'suspended') {
            await this.context.resume();
        }
    },

    /**
     * Load and decode an audio file
     * @param {File} file - Audio file to load
     * @param {string} id - Unique identifier
     * @param {string} category - Sound category (kick, snare, hihat, etc.)
     * @returns {Promise<Object>} Sound metadata
     */
    async loadSound(file, id, category = 'uncategorized') {
        await this.ensureContextRunning();

        try {
            // Read file as ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();

            // Decode audio data
            const audioBuffer = await this.context.decodeAudioData(arrayBuffer.slice(0));

            // Store buffer
            this.buffers[id] = audioBuffer;

            // Store metadata
            this.sounds[id] = {
                name: file.name,
                category: category,
                duration: audioBuffer.duration,
                sampleRate: audioBuffer.sampleRate,
                numberOfChannels: audioBuffer.numberOfChannels,
                arrayBuffer: arrayBuffer // Keep for storage
            };

            console.log(`Sound loaded: ${file.name}`, {
                duration: audioBuffer.duration.toFixed(2) + 's',
                sampleRate: audioBuffer.sampleRate,
                channels: audioBuffer.numberOfChannels
            });

            // Save to IndexedDB
            await StorageManager.saveSound(id, {
                name: file.name,
                category: category,
                arrayBuffer: arrayBuffer
            });

            return this.sounds[id];
        } catch (error) {
            console.error('Error loading sound:', error);
            throw new Error(`Failed to load ${file.name}: ${error.message}`);
        }
    },

    /**
     * Load sounds from IndexedDB on app start
     */
    async loadSoundsFromStorage() {
        await this.ensureContextRunning();

        try {
            const storedSounds = await StorageManager.getAllSounds();

            for (const sound of storedSounds) {
                try {
                    // Decode audio buffer
                    const audioBuffer = await this.context.decodeAudioData(
                        sound.arrayBuffer.slice(0)
                    );

                    // Store buffer
                    this.buffers[sound.id] = audioBuffer;

                    // Store metadata
                    this.sounds[sound.id] = {
                        name: sound.name,
                        category: sound.category,
                        duration: audioBuffer.duration,
                        sampleRate: audioBuffer.sampleRate,
                        numberOfChannels: audioBuffer.numberOfChannels,
                        arrayBuffer: sound.arrayBuffer
                    };
                } catch (error) {
                    console.error(`Failed to load sound ${sound.id}:`, error);
                }
            }

            console.log(`Loaded ${Object.keys(this.buffers).length} sounds from storage`);
            return Object.keys(this.sounds).map(id => ({ id, ...this.sounds[id] }));
        } catch (error) {
            console.error('Error loading sounds from storage:', error);
            return [];
        }
    },

    /**
     * Play a sound immediately
     * @param {string} id - Sound identifier
     * @param {number} time - When to play (optional, defaults to now)
     * @param {number} volume - Volume (0-1)
     * @returns {AudioBufferSourceNode}
     */
    playSound(id, time = null, volume = 1.0) {
        if (!this.buffers[id]) {
            console.error(`Sound not found: ${id}`);
            return null;
        }

        const playTime = time !== null ? time : this.context.currentTime;

        // Create source node
        const source = this.context.createBufferSource();
        source.buffer = this.buffers[id];

        // Create gain node for volume control
        const gainNode = this.context.createGain();
        gainNode.gain.value = volume;

        // Connect: source -> gain -> destination
        source.connect(gainNode);
        gainNode.connect(this.context.destination);

        // Schedule playback
        source.start(playTime);

        return source;
    },

    /**
     * Update sound category
     * @param {string} id - Sound identifier
     * @param {string} category - New category
     */
    async updateCategory(id, category) {
        if (this.sounds[id]) {
            this.sounds[id].category = category;

            // Update in storage
            const soundData = await StorageManager.getSound(id);
            if (soundData) {
                soundData.category = category;
                await StorageManager.saveSound(id, soundData);
            }
        }
    },

    /**
     * Delete a sound
     * @param {string} id - Sound identifier
     */
    async deleteSound(id) {
        delete this.buffers[id];
        delete this.sounds[id];
        await StorageManager.deleteSound(id);
        console.log(`Sound deleted: ${id}`);
    },

    /**
     * Get sounds by category
     * @param {string} category - Category name
     * @returns {Array}
     */
    getSoundsByCategory(category) {
        return Object.keys(this.sounds)
            .filter(id => this.sounds[id].category === category)
            .map(id => ({ id, ...this.sounds[id] }));
    },

    /**
     * Get all loaded sounds
     * @returns {Array}
     */
    getAllSounds() {
        return Object.keys(this.sounds).map(id => ({
            id,
            ...this.sounds[id]
        }));
    },

    /**
     * Get current time
     * @returns {number} Current audio context time
     */
    getCurrentTime() {
        return this.context ? this.context.currentTime : 0;
    }
};
