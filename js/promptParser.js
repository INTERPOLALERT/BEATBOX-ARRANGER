// promptParser.js - Natural language prompt parser
const PromptParser = {
    genreKeywords: {
        'trap': ['trap'],
        'boom-bap': ['boom bap', 'boom-bap', 'boombap', 'hip hop', 'hip-hop', 'rap'],
        'house': ['house'],
        'dubstep': ['dubstep', 'dub step'],
        'techno': ['techno'],
        'lo-fi': ['lo-fi', 'lofi', 'lo fi', 'chill']
    },

    parse(prompt) {
        const text = prompt.toLowerCase().trim();

        const result = {
            original: prompt,
            genre: null,
            bpm: null,
            success: false
        };

        // Extract genre
        result.genre = this.extractGenre(text);

        // Extract BPM
        result.bpm = this.extractBPM(text, result.genre);

        // Success if we found a genre
        result.success = result.genre !== null;

        return result;
    },

    extractGenre(text) {
        for (const [genre, keywords] of Object.entries(this.genreKeywords)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    return genre;
                }
            }
        }
        return null;
    },

    extractBPM(text, genre) {
        // Look for number followed by optional "bpm"
        const match = text.match(/(\d{2,3})\s*(?:bpm)?/);

        if (match) {
            const bpm = parseInt(match[1]);
            if (bpm >= 60 && bpm <= 200) {
                return bpm;
            }
        }

        // Use genre default
        if (genre) {
            const template = PatternTemplates.getPattern(genre);
            if (template) {
                return template.defaultBPM;
            }
        }

        return 120; // fallback
    },

    validate(parsed) {
        const errors = [];

        if (!parsed.genre) {
            errors.push('Genre not recognized. Try: trap, boom-bap, house, dubstep, techno, or lo-fi');
        }

        return {
            valid: errors.length === 0,
            errors: errors
        };
    },

    format(parsed) {
        if (!parsed.success) {
            return 'Could not understand prompt';
        }

        return `Genre: ${PatternTemplates[parsed.genre]?.name} | BPM: ${parsed.bpm}`;
    }
};
