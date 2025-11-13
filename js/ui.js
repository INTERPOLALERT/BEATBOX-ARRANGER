/**
 * ui.js - User interface management
 * Handles all DOM interactions and updates
 */

const UI = {
    // DOM elements
    elements: {},

    // Current pattern display data
    currentPattern: null,

    /**
     * Initialize UI
     */
    init() {
        // Cache DOM elements
        this.elements = {
            fileInput: document.getElementById('fileInput'),
            soundLibrary: document.getElementById('soundLibrary'),
            promptInput: document.getElementById('promptInput'),
            generateBtn: document.getElementById('generateBtn'),
            parsedInfo: document.getElementById('parsedInfo'),
            patternDisplay: document.getElementById('patternDisplay'),
            playBtn: document.getElementById('playBtn'),
            stopBtn: document.getElementById('stopBtn'),
            exportWavBtn: document.getElementById('exportWavBtn'),
            exportMp3Btn: document.getElementById('exportMp3Btn'),
            playbackStatus: document.getElementById('playbackStatus'),
            currentBeat: document.getElementById('currentBeat')
        };

        // Set up event listeners
        this.setupEventListeners();

        console.log('UI initialized');
    },

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // File upload
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));

        // Generate pattern
        this.elements.generateBtn.addEventListener('click', () => this.handleGeneratePattern());

        // Prompt input - Enter key
        this.elements.promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleGeneratePattern();
            }
        });

        // Playback controls
        this.elements.playBtn.addEventListener('click', () => this.handlePlay());
        this.elements.stopBtn.addEventListener('click', () => this.handleStop());

        // Export
        this.elements.exportWavBtn.addEventListener('click', () => this.handleExport('wav'));
        this.elements.exportMp3Btn.addEventListener('click', () => this.handleExport('mp3'));
    },

    /**
     * Handle file upload
     */
    async handleFileUpload(event) {
        const files = event.target.files;

        if (files.length === 0) return;

        this.updateStatus('Loading sounds...');

        for (const file of files) {
            try {
                const id = 'sound_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                await AudioManager.loadSound(file, id);
                this.addSoundToLibrary(id, AudioManager.sounds[id]);
            } catch (error) {
                alert(`Failed to load ${file.name}: ${error.message}`);
            }
        }

        this.updateStatus('Sounds loaded');

        // Clear file input
        event.target.value = '';
    },

    /**
     * Add sound to library display
     */
    addSoundToLibrary(id, sound) {
        const soundItem = document.createElement('div');
        soundItem.className = 'sound-item';
        soundItem.dataset.id = id;

        soundItem.innerHTML = `
            <div class="sound-item-header">
                <span class="sound-name" title="${sound.name}">${sound.name}</span>
                <div class="sound-controls">
                    <button class="sound-play-btn" title="Play">▶</button>
                    <button class="sound-delete-btn" title="Delete">✕</button>
                </div>
            </div>
            <select class="sound-category" data-id="${id}">
                <option value="uncategorized">Select category...</option>
                <option value="kick">Kick</option>
                <option value="snare">Snare</option>
                <option value="hihat">Hi-Hat</option>
                <option value="clap">Clap</option>
                <option value="perc">Percussion</option>
            </select>
        `;

        // Set current category
        const select = soundItem.querySelector('.sound-category');
        select.value = sound.category;

        // Play button
        soundItem.querySelector('.sound-play-btn').addEventListener('click', () => {
            AudioManager.playSound(id);
        });

        // Delete button
        soundItem.querySelector('.sound-delete-btn').addEventListener('click', async () => {
            if (confirm(`Delete ${sound.name}?`)) {
                await AudioManager.deleteSound(id);
                soundItem.remove();
                this.updateStatus(`Deleted ${sound.name}`);
            }
        });

        // Category change
        select.addEventListener('change', async (e) => {
            await AudioManager.updateCategory(id, e.target.value);
            this.updateStatus(`Updated ${sound.name} category to ${e.target.value}`);
        });

        this.elements.soundLibrary.appendChild(soundItem);
    },

    /**
     * Handle pattern generation
     */
    handleGeneratePattern() {
        const prompt = this.elements.promptInput.value.trim();

        if (!prompt) {
            alert('Please enter a prompt (e.g., "trap beat 140 bpm")');
            return;
        }

        // Parse prompt
        const parsed = PromptParser.parse(prompt);

        // Validate
        const validation = PromptParser.validate(parsed);

        if (!validation.valid) {
            alert(validation.errors.join('\n'));
            return;
        }

        // Show warnings
        if (validation.warnings.length > 0) {
            console.warn('Warnings:', validation.warnings);
        }

        // Display parsed info
        this.displayParsedInfo(parsed);

        // Get available sound categories
        const sounds = AudioManager.getAllSounds();
        const categories = [...new Set(sounds.map(s => s.category))].filter(c => c !== 'uncategorized');

        if (categories.length === 0) {
            alert('Please upload and categorize some sounds first!');
            return;
        }

        // Create pattern from template
        const pattern = PatternTemplates.createPatternFromAvailableSounds(parsed.genre, categories);

        if (!pattern) {
            alert(`Pattern template not found for genre: ${parsed.genre}`);
            return;
        }

        // Use parsed BPM
        pattern.bpm = parsed.bpm;

        // Store pattern
        this.currentPattern = pattern;

        // Display pattern
        this.displayPattern(pattern);

        // Initialize sequencer
        Sequencer.init(pattern, pattern.bpm);

        // Enable playback buttons
        this.elements.playBtn.disabled = false;
        this.elements.exportWavBtn.disabled = false;
        this.elements.exportMp3Btn.disabled = false;

        this.updateStatus('Pattern generated!');
    },

    /**
     * Display parsed prompt info
     */
    displayParsedInfo(parsed) {
        const formatted = PromptParser.formatResult(parsed);

        this.elements.parsedInfo.innerHTML = `
            <h3>Detected Parameters</h3>
            <p>${formatted}</p>
        `;
        this.elements.parsedInfo.classList.add('visible');
    },

    /**
     * Display pattern grid
     */
    displayPattern(pattern) {
        const container = this.elements.patternDisplay;
        container.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'pattern-grid';

        // Create rows for each track
        Object.keys(pattern.tracks).forEach(category => {
            const row = document.createElement('div');
            row.className = 'pattern-row';
            row.dataset.category = category;

            // Label
            const label = document.createElement('div');
            label.className = 'pattern-label';
            label.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            row.appendChild(label);

            // Steps
            const stepsContainer = document.createElement('div');
            stepsContainer.className = 'pattern-steps';

            for (let i = 0; i < pattern.steps; i++) {
                const step = document.createElement('div');
                step.className = 'pattern-step';
                step.dataset.step = i;
                step.dataset.category = category;

                if (pattern.tracks[category][i] === 1) {
                    step.classList.add('active');
                }

                // Click to toggle
                step.addEventListener('click', () => {
                    Sequencer.toggleStep(category, i);
                    step.classList.toggle('active');
                });

                stepsContainer.appendChild(step);
            }

            row.appendChild(stepsContainer);
            grid.appendChild(row);
        });

        container.appendChild(grid);
    },

    /**
     * Handle play button
     */
    async handlePlay() {
        // Ensure AudioContext is running
        await AudioManager.ensureContextRunning();

        // Set up sequencer callbacks
        Sequencer.onStepChange = (step) => this.updateStepVisualization(step);

        // Start playback
        Sequencer.start();

        // Update UI
        this.elements.playBtn.disabled = true;
        this.elements.stopBtn.disabled = false;
        this.updateStatus('Playing...');
    },

    /**
     * Handle stop button
     */
    handleStop() {
        Sequencer.stop();

        // Update UI
        this.elements.playBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.updateStatus('Stopped');

        // Clear visualization
        this.clearStepVisualization();
    },

    /**
     * Update step visualization
     */
    updateStepVisualization(step) {
        // Remove previous highlights
        this.clearStepVisualization();

        // Highlight current step
        const steps = document.querySelectorAll(`.pattern-step[data-step="${step}"]`);
        steps.forEach(s => s.classList.add('playing'));

        // Update current beat display
        const position = Sequencer.getPosition();
        this.elements.currentBeat.textContent = `Bar ${position.bar}, Beat ${position.beat}`;
    },

    /**
     * Clear step visualization
     */
    clearStepVisualization() {
        const steps = document.querySelectorAll('.pattern-step.playing');
        steps.forEach(s => s.classList.remove('playing'));
        this.elements.currentBeat.textContent = '';
    },

    /**
     * Handle export
     */
    async handleExport(format) {
        if (!this.currentPattern) {
            alert('No pattern to export');
            return;
        }

        this.updateStatus(`Exporting ${format.toUpperCase()}...`);

        // Disable buttons during export
        this.elements.exportWavBtn.disabled = true;
        this.elements.exportMp3Btn.disabled = true;

        try {
            let blob;
            const filename = `beatbox-${Date.now()}.${format}`;

            if (format === 'wav') {
                blob = await Exporter.exportWAV(this.currentPattern, this.currentPattern.bpm, 4);
            } else if (format === 'mp3') {
                blob = await Exporter.exportMP3(this.currentPattern, this.currentPattern.bpm, 4);
            }

            // Download
            Exporter.downloadBlob(blob, filename);

            this.updateStatus(`Exported ${format.toUpperCase()}: ${filename}`);
        } catch (error) {
            alert(`Export failed: ${error.message}`);
            this.updateStatus('Export failed');
        } finally {
            // Re-enable buttons
            this.elements.exportWavBtn.disabled = false;
            this.elements.exportMp3Btn.disabled = false;
        }
    },

    /**
     * Update status message
     */
    updateStatus(message) {
        this.elements.playbackStatus.textContent = message;
        console.log('Status:', message);
    },

    /**
     * Load existing sounds from storage
     */
    async loadExistingSounds() {
        const sounds = await AudioManager.loadSoundsFromStorage();

        sounds.forEach(sound => {
            this.addSoundToLibrary(sound.id, sound);
        });

        if (sounds.length > 0) {
            this.updateStatus(`Loaded ${sounds.length} sounds from storage`);
        }
    }
};
