/**
 * patterns.js - Pattern templates for different genres
 * 16-step patterns (1 = trigger, 0 = silence)
 */

const PatternTemplates = {
    /**
     * Trap pattern (130-150 BPM)
     * Characteristic: Hard-hitting kicks, snappy snares on 2 and 4, rolling hi-hats
     */
    trap: {
        name: 'Trap',
        defaultBPM: 140,
        steps: 16,
        patterns: {
            kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            hihat: [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
            clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            perc: [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0]
        }
    },

    /**
     * Boom Bap pattern (85-95 BPM)
     * Characteristic: Classic hip-hop, heavy kick and snare, simple hi-hats
     */
    'boom-bap': {
        name: 'Boom Bap',
        defaultBPM: 90,
        steps: 16,
        patterns: {
            kick: [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            perc: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
        }
    },

    /**
     * House pattern (120-130 BPM)
     * Characteristic: Four-on-the-floor kicks, open hi-hats on offbeats
     */
    house: {
        name: 'House',
        defaultBPM: 128,
        steps: 16,
        patterns: {
            kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            hihat: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
            clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            perc: [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]
        }
    },

    /**
     * Dubstep pattern (135-145 BPM)
     * Characteristic: Half-time feel, heavy kick/snare on 1 and 3, syncopated hi-hats
     */
    dubstep: {
        name: 'Dubstep',
        defaultBPM: 140,
        steps: 16,
        patterns: {
            kick: [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            hihat: [1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0],
            clap: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            perc: [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0]
        }
    },

    /**
     * Techno pattern (125-135 BPM)
     * Characteristic: Driving four-on-the-floor, minimal, repetitive
     */
    techno: {
        name: 'Techno',
        defaultBPM: 130,
        steps: 16,
        patterns: {
            kick: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0],
            snare: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            hihat: [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
            clap: [0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
            perc: [0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0]
        }
    },

    /**
     * Lo-Fi pattern (80-95 BPM)
     * Characteristic: Laid-back, swung hi-hats, simple groove
     */
    'lo-fi': {
        name: 'Lo-Fi',
        defaultBPM: 85,
        steps: 16,
        patterns: {
            kick: [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0],
            snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
            hihat: [1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1],
            clap: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            perc: [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0]
        }
    },

    /**
     * Get pattern for a specific genre
     * @param {string} genre - Genre name
     * @returns {Object|null}
     */
    getPattern(genre) {
        const normalizedGenre = genre.toLowerCase().trim();
        return this[normalizedGenre] || null;
    },

    /**
     * Get all available genres
     * @returns {Array<string>}
     */
    getAllGenres() {
        return Object.keys(this).filter(key =>
            typeof this[key] === 'object' && this[key].patterns
        );
    },

    /**
     * Get genre info
     * @returns {Array<Object>}
     */
    getGenreInfo() {
        return this.getAllGenres().map(genre => ({
            id: genre,
            name: this[genre].name,
            defaultBPM: this[genre].defaultBPM,
            steps: this[genre].steps
        }));
    },

    /**
     * Create a custom pattern from available sounds
     * @param {string} genre - Base genre
     * @param {Array<string>} availableCategories - Categories user has uploaded
     * @returns {Object}
     */
    createPatternFromAvailableSounds(genre, availableCategories) {
        const template = this.getPattern(genre);
        if (!template) {
            return null;
        }

        const pattern = {
            name: template.name,
            bpm: template.defaultBPM,
            steps: template.steps,
            tracks: {}
        };

        // Map template patterns to available sound categories
        availableCategories.forEach(category => {
            if (template.patterns[category]) {
                pattern.tracks[category] = template.patterns[category];
            }
        });

        return pattern;
    },

    /**
     * Generate a variation of a pattern (adds some randomness)
     * @param {Array} pattern - Original pattern
     * @param {number} variation - Variation amount (0-1)
     * @returns {Array}
     */
    generateVariation(pattern, variation = 0.2) {
        return pattern.map(step => {
            if (Math.random() < variation) {
                return step === 1 ? 0 : 1;
            }
            return step;
        });
    }
};
