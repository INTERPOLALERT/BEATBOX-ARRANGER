// sequencer.js - Audio sequencer with AudioContext.currentTime
const Sequencer = {
    pattern: null,
    isPlaying: false,
    currentStep: 0,
    bpm: 120,
    nextNoteTime: 0,
    scheduleAheadTime: 0.1,
    lookahead: 25,
    timerID: null,
    scheduledSources: [],
    onStepChange: null,

    init(pattern, bpm) {
        this.pattern = pattern;
        this.bpm = bpm;
        this.currentStep = 0;
        this.scheduledSources = [];
        console.log('✓ Sequencer ready:', pattern.name, bpm + 'BPM');
    },

    start() {
        if (this.isPlaying || !this.pattern) return;

        this.isPlaying = true;
        this.currentStep = 0;
        this.nextNoteTime = AudioManager.getCurrentTime();
        this.scheduler();
        console.log('✓ Playing');
    },

    stop() {
        if (!this.isPlaying) return;

        this.isPlaying = false;
        this.currentStep = 0;

        if (this.timerID) {
            clearTimeout(this.timerID);
            this.timerID = null;
        }

        this.scheduledSources.forEach(src => {
            try { src.stop(); } catch(e) {}
        });
        this.scheduledSources = [];

        console.log('✓ Stopped');
    },

    scheduler() {
        while (this.nextNoteTime < AudioManager.getCurrentTime() + this.scheduleAheadTime) {
            this.scheduleNote(this.currentStep, this.nextNoteTime);
            this.nextNote();
        }

        if (this.isPlaying) {
            this.timerID = setTimeout(() => this.scheduler(), this.lookahead);
        }
    },

    scheduleNote(step, time) {
        if (!this.pattern || !this.pattern.tracks) return;

        // Trigger callback for visualization
        if (this.onStepChange) {
            const delay = (time - AudioManager.getCurrentTime()) * 1000;
            setTimeout(() => {
                if (this.onStepChange) {
                    this.onStepChange(step);
                }
            }, Math.max(0, delay));
        }

        // Schedule each track
        Object.keys(this.pattern.tracks).forEach(category => {
            const trackPattern = this.pattern.tracks[category];

            if (trackPattern[step] === 1) {
                const sounds = AudioManager.getSoundsByCategory(category);

                if (sounds.length > 0) {
                    const source = AudioManager.playSound(sounds[0].id, time);

                    if (source) {
                        this.scheduledSources.push(source);
                        source.onended = () => {
                            const idx = this.scheduledSources.indexOf(source);
                            if (idx > -1) {
                                this.scheduledSources.splice(idx, 1);
                            }
                        };
                    }
                }
            }
        });
    },

    nextNote() {
        const secondsPerBeat = 60.0 / this.bpm;
        const secondsPerStep = secondsPerBeat / 4; // 16th notes

        this.nextNoteTime += secondsPerStep;
        this.currentStep++;

        if (this.currentStep >= this.pattern.steps) {
            this.currentStep = 0; // Loop
        }
    },

    toggleStep(category, step) {
        if (!this.pattern || !this.pattern.tracks[category]) return;

        const current = this.pattern.tracks[category][step];
        this.pattern.tracks[category][step] = current === 1 ? 0 : 1;
    },

    getPattern() {
        return this.pattern;
    }
};
