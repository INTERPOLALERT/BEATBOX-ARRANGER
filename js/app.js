// app.js - Main application
const App = {
    initialized: false,

    async init() {
        if (this.initialized) return;

        console.log('🎵 Beatbox Arranger v2.0 Starting...');

        try {
            // Check browser support
            this.checkSupport();

            // Initialize storage
            if (!StorageManager.init()) {
                console.warn('Storage initialization failed - continuing without persistence');
            }

            // Initialize UI
            UI.init();

            // Load existing sounds
            await UI.loadExisting();

            this.initialized = true;

            console.log('✓ App ready!');
            console.log('📝 Upload sounds and describe your beat to get started');
            console.log('📝 Example prompts: "trap beat 140 bpm", "house 128 bpm", "boom bap 90 bpm"');

        } catch (error) {
            console.error('❌ Initialization failed:', error);
            alert('Failed to initialize: ' + error.message);
        }
    },

    checkSupport() {
        const required = {
            'Web Audio API': window.AudioContext || window.webkitAudioContext,
            'IndexedDB': window.indexedDB,
            'File API': window.File && window.FileReader
        };

        const missing = [];
        for (const [name, supported] of Object.entries(required)) {
            if (!supported) {
                missing.push(name);
            }
        }

        if (missing.length > 0) {
            throw new Error('Browser not supported. Missing: ' + missing.join(', '));
        }

        console.log('✓ Browser support OK');
    },

    debug() {
        console.log('=== DEBUG INFO ===');
        console.log('Sounds loaded:', Object.keys(AudioManager.sounds).length);
        console.log('AudioContext state:', AudioManager.context ? AudioManager.context.state : 'not initialized');
        console.log('Playing:', Sequencer.isPlaying);
        console.log('Current pattern:', UI.currentPattern);
        console.log('Available genres:', PatternTemplates.getGenreInfo());
        console.log('==================');
    }
};

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
} else {
    App.init();
}

// Expose for debugging
window.BeatboxApp = App;
window.debug = () => App.debug();

console.log('Type debug() in console for debug info');
