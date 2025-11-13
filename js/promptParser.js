/**
 * promptParser.js - Natural language prompt parser
 * Uses regex and keyword matching to extract genre, BPM, and other parameters
 */

const PromptParser = {
    /**
     * Genre keywords and aliases
     */
    genreKeywords: {
        'trap': ['trap', 'trapy'],
        'boom-bap': ['boom bap', 'boom-bap', 'boombap', 'hip hop', 'hip-hop', 'hiphop', 'rap'],
        'house': ['house', 'deep house', 'tech house'],
        'dubstep': ['dubstep', 'dub step', 'brostep'],
        'techno': ['techno', 'minimal', 'detroit'],
        'lo-fi': ['lo-fi', 'lofi', 'lo fi', 'chill', 'chillhop']
    },

    /**
     * Default BPM ranges for genres
     */
    bpmRanges: {
        'trap': { min: 130, max: 150, default: 140 },
        'boom-bap': { min: 85, max: 95, default: 90 },
        'house': { min: 120, max: 130, default: 128 },
        'dubstep': { min: 135, max: 145, default: 140 },
        'techno': { min: 125, max: 135, default: 130 },
        'lo-fi': { min: 80, max: 95, default: 85 }
    },

    /**
     * Mood keywords that might affect pattern generation
     */
    moodKeywords: {
        'aggressive': ['aggressive', 'hard', 'heavy', 'intense'],
        'chill': ['chill', 'relaxed', 'smooth', 'laid-back', 'mellow'],
        'energetic': ['energetic', 'upbeat', 'fast', 'driving'],
        'minimal': ['minimal', 'simple', 'stripped', 'basic']
    },

    /**
     * Parse a natural language prompt
     * @param {string} prompt - User input (e.g., "trap beat 140 bpm")
     * @returns {Object} Parsed parameters
     */
    parse(prompt) {
        const normalized = prompt.toLowerCase().trim();

        const result = {
            original: prompt,
            genre: null,
            bpm: null,
            mood: null,
            duration: 4, // Default 4 bars
            variation: 0, // 0 = exact template, 1 = max variation
            success: false
        };

        // Extract genre
        result.genre = this.extractGenre(normalized);

        // Extract BPM
        result.bpm = this.extractBPM(normalized, result.genre);

        // Extract mood
        result.mood = this.extractMood(normalized);

        // Extract duration (in bars)
        result.duration = this.extractDuration(normalized);

        // Determine success
        result.success = result.genre !== null;

        return result;
    },

    /**
     * Extract genre from prompt
     * @param {string} normalized - Normalized prompt
     * @returns {string|null}
     */
    extractGenre(normalized) {
        for (const [genre, keywords] of Object.entries(this.genreKeywords)) {
            for (const keyword of keywords) {
                if (normalized.includes(keyword)) {
                    return genre;
                }
            }
        }
        return null;
    },

    /**
     * Extract BPM from prompt
     * @param {string} normalized - Normalized prompt
     * @param {string} genre - Detected genre (for default)
     * @returns {number}
     */
    extractBPM(normalized, genre) {
        // Try to find explicit BPM: "140 bpm", "140bpm", "140"
        const bpmRegex = /(\d{2,3})\s*(?:bpm)?/;
        const match = normalized.match(bpmRegex);

        if (match) {
            const bpm = parseInt(match[1]);
            // Validate BPM is reasonable (60-200)
            if (bpm >= 60 && bpm <= 200) {
                return bpm;
            }
        }

        // No explicit BPM found, use genre default
        if (genre && this.bpmRanges[genre]) {
            return this.bpmRanges[genre].default;
        }

        // Fallback to 120 BPM
        return 120;
    },

    /**
     * Extract mood from prompt
     * @param {string} normalized - Normalized prompt
     * @returns {string|null}
     */
    extractMood(normalized) {
        for (const [mood, keywords] of Object.entries(this.moodKeywords)) {
            for (const keyword of keywords) {
                if (normalized.includes(keyword)) {
                    return mood;
                }
            }
        }
        return null;
    },

    /**
     * Extract duration in bars
     * @param {string} normalized - Normalized prompt
     * @returns {number}
     */
    extractDuration(normalized) {
        // Look for "X bars", "X bar"
        const barRegex = /(\d+)\s*bars?/;
        const match = normalized.match(barRegex);

        if (match) {
            const bars = parseInt(match[1]);
            // Limit to reasonable range (1-16 bars)
            return Math.min(Math.max(bars, 1), 16);
        }

        return 4; // Default
    },

    /**
     * Get suggestions based on partial input
     * @param {string} partial - Partial prompt
     * @returns {Array<string>}
     */
    getSuggestions(partial) {
        const normalized = partial.toLowerCase().trim();
        const suggestions = [];

        // Genre suggestions
        if (normalized.length < 3) {
            return [
                'trap beat 140 bpm',
                'boom bap 90 bpm',
                'house 128 bpm',
                'dubstep 140 bpm',
                'techno 130 bpm',
                'lo-fi 85 bpm'
            ];
        }

        // Find matching genres
        for (const [genre, keywords] of Object.entries(this.genreKeywords)) {
            for (const keyword of keywords) {
                if (keyword.startsWith(normalized) || normalized.startsWith(keyword)) {
                    const template = PatternTemplates.getPattern(genre);
                    if (template) {
                        suggestions.push(`${keyword} ${template.defaultBPM} bpm`);
                    }
                }
            }
        }

        return suggestions;
    },

    /**
     * Validate parsed result
     * @param {Object} parsed - Parsed result
     * @returns {Object} Validation result
     */
    validate(parsed) {
        const errors = [];
        const warnings = [];

        if (!parsed.genre) {
            errors.push('No genre detected. Try: trap, boom-bap, house, dubstep, techno, or lo-fi');
        }

        if (parsed.genre && parsed.bpm) {
            const range = this.bpmRanges[parsed.genre];
            if (range && (parsed.bpm < range.min || parsed.bpm > range.max)) {
                warnings.push(
                    `BPM ${parsed.bpm} is outside typical range for ${parsed.genre} ` +
                    `(${range.min}-${range.max}). It will work, but may sound unusual.`
                );
            }
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    },

    /**
     * Format parsed result as human-readable text
     * @param {Object} parsed - Parsed result
     * @returns {string}
     */
    formatResult(parsed) {
        if (!parsed.success) {
            return 'Could not understand the prompt. Try something like "trap beat 140 bpm"';
        }

        const parts = [];

        parts.push(`Genre: ${PatternTemplates[parsed.genre]?.name || parsed.genre}`);
        parts.push(`BPM: ${parsed.bpm}`);
        parts.push(`Duration: ${parsed.duration} bars`);

        if (parsed.mood) {
            parts.push(`Mood: ${parsed.mood}`);
        }

        return parts.join(' | ');
    }
};
