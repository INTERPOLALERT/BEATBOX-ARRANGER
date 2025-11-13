/**
 * app.js - Main application entry point
 * Initializes all modules and starts the application
 */

// Application state
const App = {
    initialized: false,

    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) {
            return;
        }

        console.log('Beatbox Arranger starting...');

        try {
            // Check for required APIs
            this.checkBrowserSupport();

            // Initialize UI
            UI.init();

            // Initialize AudioContext on first user interaction
            // Note: AudioContext is created lazily to avoid browser restrictions
            console.log('AudioContext will be initialized on first interaction');

            // Load existing sounds from IndexedDB
            await UI.loadExistingSounds();

            this.initialized = true;

            console.log('Beatbox Arranger ready!');
            console.log('Upload sounds and describe your beat to get started.');

        } catch (error) {
            console.error('Initialization failed:', error);
            alert(`Failed to initialize app: ${error.message}`);
        }
    },

    /**
     * Check browser support for required APIs
     */
    checkBrowserSupport() {
        const required = {
            'Web Audio API': window.AudioContext || window.webkitAudioContext,
            'IndexedDB': window.indexedDB,
            'localforage': typeof localforage !== 'undefined',
            'File API': window.File && window.FileReader
        };

        const missing = [];

        for (const [name, supported] of Object.entries(required)) {
            if (!supported) {
                missing.push(name);
            }
        }

        if (missing.length > 0) {
            throw new Error(`Your browser does not support: ${missing.join(', ')}. Please use a modern browser.`);
        }

        console.log('Browser support check passed');
    },

    /**
     * Get app info
     */
    getInfo() {
        return {
            name: 'Beatbox Arranger',
            version: '1.0.0',
            soundsLoaded: Object.keys(AudioManager.sounds).length,
            audioContextState: AudioManager.context ? AudioManager.context.state : 'not initialized',
            sequencerPlaying: Sequencer.isPlaying,
            currentPattern: UI.currentPattern ? UI.currentPattern.name : null
        };
    },

    /**
     * Debug information
     */
    debug() {
        console.log('=== Beatbox Arranger Debug Info ===');
        console.log('App Info:', this.getInfo());
        console.log('Sounds:', AudioManager.getAllSounds());
        console.log('Pattern:', Sequencer.getPattern());
        console.log('Available Genres:', PatternTemplates.getGenreInfo());
        console.log('=====================================');
    }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Expose App to window for debugging
window.BeatboxApp = App;

// Log welcome message
console.log(`
╔═══════════════════════════════════════╗
║     🎵 BEATBOX ARRANGER v1.0.0 🎵    ║
╠═══════════════════════════════════════╣
║  AI-powered beatbox pattern arranger  ║
║                                       ║
║  Commands:                            ║
║  - BeatboxApp.debug()                 ║
║  - BeatboxApp.getInfo()               ║
╚═══════════════════════════════════════╝
`);
