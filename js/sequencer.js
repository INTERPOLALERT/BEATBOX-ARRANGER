/**
 * sequencer.js - Audio sequencer using AudioContext.currentTime
 * Handles precise timing and playback of patterns
 */

const Sequencer = {
    // Current pattern being played
    pattern: null,

    // Playback state
    isPlaying: false,
    currentStep: 0,

    // Timing
    bpm: 120,
    scheduleAheadTime: 0.1, // Schedule 100ms ahead
    lookahead: 25.0, // Check every 25ms
    nextNoteTime: 0.0,

    // Scheduled sources (for stopping)
    scheduledSources: [],

    // Timer
    timerID: null,

    // Callbacks
    onStepChange: null, // Called when step changes (for visualization)
    onPlaybackEnd: null, // Called when playback ends

    /**
     * Initialize sequencer with a pattern
     * @param {Object} pattern - Pattern object with tracks
     * @param {number} bpm - Tempo in BPM
     */
    init(pattern, bpm = 120) {
        this.pattern = pattern;
        this.bpm = bpm;
        this.currentStep = 0;
        this.scheduledSources = [];
        console.log('Sequencer initialized:', { pattern, bpm });
    },

    /**
     * Start playback
     */
    start() {
        if (this.isPlaying) {
            return;
        }

        if (!this.pattern) {
            console.error('No pattern loaded');
            return;
        }

        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = AudioManager.getCurrentTime();

        // Start scheduler
        this.scheduler();

        console.log('Sequencer started');
    },

    /**
     * Stop playback
     */
    stop() {
        if (!this.isPlaying) {
            return;
        }

        this.isPlaying = false;
        this.currentStep = 0;

        // Clear timer
        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }

        // Stop all scheduled sources
        this.scheduledSources.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Already stopped
            }
        });
        this.scheduledSources = [];

        console.log('Sequencer stopped');
    },

    /**
     * Main scheduler function
     * Uses AudioContext.currentTime for precise scheduling
     */
    scheduler() {
        // Schedule notes that need to play in the next lookahead window
        while (this.nextNoteTime < AudioManager.getCurrentTime() + this.scheduleAheadTime) {
            this.scheduleNote(this.currentStep, this.nextNoteTime);
            this.nextNote();
        }

        // Continue scheduling if still playing
        if (this.isPlaying) {
            this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
        }
    },

    /**
     * Schedule a single step
     * @param {number} step - Step number (0-15)
     * @param {number} time - When to play (AudioContext time)
     */
    scheduleNote(step, time) {
        if (!this.pattern || !this.pattern.tracks) {
            return;
        }

        // Trigger visual callback
        if (this.onStepChange) {
            // Use setTimeout to sync with audio time
            const delay = (time - AudioManager.getCurrentTime()) * 1000;
            setTimeout(() => {
                if (this.onStepChange) {
                    this.onStepChange(step);
                }
            }, Math.max(0, delay));
        }

        // Schedule each track
        Object.keys(this.pattern.tracks).forEach(category => {
            const pattern = this.pattern.tracks[category];

            // Check if this step should trigger
            if (pattern[step] === 1) {
                // Find a sound in this category
                const sounds = AudioManager.getSoundsByCategory(category);

                if (sounds.length > 0) {
                    // Use first sound in category (could be randomized)
                    const sound = sounds[0];
                    const source = AudioManager.playSound(sound.id, time);

                    if (source) {
                        this.scheduledSources.push(source);

                        // Clean up after playback
                        source.onended = () => {
                            const index = this.scheduledSources.indexOf(source);
                            if (index > -1) {
                                this.scheduledSources.splice(index, 1);
                            }
                        };
                    }
                }
            }
        });
    },

    /**
     * Advance to next note
     */
    nextNote() {
        // Calculate time per step (16th note)
        const secondsPerBeat = 60.0 / this.bpm;
        const secondsPerStep = secondsPerBeat / 4; // 16th notes

        this.nextNoteTime += secondsPerStep;

        // Advance step
        this.currentStep++;

        // Check if pattern is complete
        if (this.currentStep >= this.pattern.steps) {
            // Loop or stop based on duration
            if (this.pattern.loop !== false) {
                this.currentStep = 0;
            } else {
                this.stop();
                if (this.onPlaybackEnd) {
                    this.onPlaybackEnd();
                }
            }
        }
    },

    /**
     * Set BPM
     * @param {number} bpm - New BPM
     */
    setBPM(bpm) {
        this.bpm = Math.max(30, Math.min(300, bpm)); // Clamp 30-300
        console.log('BPM set to:', this.bpm);
    },

    /**
     * Get current playback position
     * @returns {Object}
     */
    getPosition() {
        return {
            step: this.currentStep,
            totalSteps: this.pattern ? this.pattern.steps : 0,
            bar: Math.floor(this.currentStep / 16) + 1,
            beat: Math.floor((this.currentStep % 16) / 4) + 1
        };
    },

    /**
     * Toggle step in pattern
     * @param {string} category - Track category
     * @param {number} step - Step number
     */
    toggleStep(category, step) {
        if (!this.pattern || !this.pattern.tracks[category]) {
            return;
        }

        const currentValue = this.pattern.tracks[category][step];
        this.pattern.tracks[category][step] = currentValue === 1 ? 0 : 1;

        console.log(`Toggled ${category} step ${step}`);
    },

    /**
     * Get pattern data
     * @returns {Object}
     */
    getPattern() {
        return this.pattern;
    }
};
