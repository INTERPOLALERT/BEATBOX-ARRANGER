// patterns.js - Genre pattern templates
const PatternTemplates = {
    trap: {
        name: 'Trap',
        defaultBPM: 140,
        steps: 16,
        patterns: {
            kick: [1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0],
            snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
            hihat: [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1],
            clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
            perc: [0,0,0,1,0,0,1,0,0,0,0,1,0,0,0,0]
        }
    },

    'boom-bap': {
        name: 'Boom Bap',
        defaultBPM: 90,
        steps: 16,
        patterns: {
            kick: [1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],
            snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
            hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
            clap: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            perc: [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0]
        }
    },

    house: {
        name: 'House',
        defaultBPM: 128,
        steps: 16,
        patterns: {
            kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
            snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
            hihat: [0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0],
            clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
            perc: [0,1,0,1,0,1,0,1,0,1,0,1,0,1,0,1]
        }
    },

    dubstep: {
        name: 'Dubstep',
        defaultBPM: 140,
        steps: 16,
        patterns: {
            kick: [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],
            snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
            hihat: [1,1,0,1,0,1,1,0,1,1,0,1,0,1,1,0],
            clap: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
            perc: [0,0,1,0,0,0,0,1,0,0,1,0,0,0,0,0]
        }
    },

    techno: {
        name: 'Techno',
        defaultBPM: 130,
        steps: 16,
        patterns: {
            kick: [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
            snare: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            hihat: [1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0],
            clap: [0,0,0,0,1,0,0,1,0,0,0,0,1,0,0,1],
            perc: [0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0]
        }
    },

    'lo-fi': {
        name: 'Lo-Fi',
        defaultBPM: 85,
        steps: 16,
        patterns: {
            kick: [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0],
            snare: [0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],
            hihat: [1,0,0,1,1,0,0,1,1,0,0,1,1,0,0,1],
            clap: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
            perc: [0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0]
        }
    },

    getPattern(genre) {
        const key = genre.toLowerCase().trim();
        return this[key] || null;
    },

    getAllGenres() {
        return ['trap', 'boom-bap', 'house', 'dubstep', 'techno', 'lo-fi'];
    },

    getGenreInfo() {
        return this.getAllGenres().map(g => ({
            id: g,
            name: this[g].name,
            defaultBPM: this[g].defaultBPM
        }));
    },

    createFromAvailable(genre, availableCategories) {
        const template = this.getPattern(genre);
        if (!template) return null;

        const pattern = {
            name: template.name,
            bpm: template.defaultBPM,
            steps: template.steps,
            tracks: {}
        };

        availableCategories.forEach(cat => {
            if (template.patterns[cat]) {
                pattern.tracks[cat] = template.patterns[cat];
            }
        });

        return pattern;
    }
};
