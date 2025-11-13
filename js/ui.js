// ui.js - User interface management
const UI = {
    elements: {},
    currentPattern: null,

    init() {
        console.log('🔧 Initializing UI...');

        // Cache elements
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
            status: document.getElementById('playbackStatus') || document.getElementById('status')
        };

        // Check if all elements exist
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.error('❌ Missing element:', key);
            } else {
                console.log('✓ Found element:', key);
            }
        }

        // Setup listeners with error handling
        try {
            this.elements.fileInput.addEventListener('change', (e) => {
                console.log('📁 File input changed');
                this.handleFiles(e);
            });

            this.elements.generateBtn.addEventListener('click', () => {
                console.log('🎵 Generate button clicked!');
                try {
                    this.generate();
                } catch (error) {
                    console.error('❌ Generate error:', error);
                    alert('Error generating pattern: ' + error.message);
                }
            });

            this.elements.promptInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('⌨️ Enter key pressed');
                    this.generate();
                }
            });

            this.elements.playBtn.addEventListener('click', () => {
                console.log('▶️ Play clicked');
                this.play();
            });

            this.elements.stopBtn.addEventListener('click', () => {
                console.log('⏹️ Stop clicked');
                this.stop();
            });

            this.elements.exportWavBtn.addEventListener('click', () => {
                console.log('💾 Export WAV clicked');
                this.export('wav');
            });

            this.elements.exportMp3Btn.addEventListener('click', () => {
                console.log('💾 Export MP3 clicked');
                this.export('mp3');
            });

            console.log('✓ All event listeners attached');
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
        }

        console.log('✓ UI ready');
    },

    async handleFiles(event) {
        const files = event.target.files;
        console.log('📁 Files selected:', files.length);

        if (files.length === 0) return;

        this.status('Loading sounds...');

        for (const file of files) {
            try {
                console.log('Loading file:', file.name);
                const id = 'sound_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                await AudioManager.loadSound(file, id);
                this.addSoundItem(id, AudioManager.sounds[id]);
            } catch (error) {
                console.error('❌ Failed to load:', file.name, error);
                alert('Failed to load ' + file.name + ': ' + error.message);
            }
        }

        this.status('Sounds loaded');
        event.target.value = '';
    },

    addSoundItem(id, sound) {
        const item = document.createElement('div');
        item.className = 'sound-item';
        item.dataset.id = id;

        item.innerHTML = `
            <div class="sound-header">
                <span class="sound-name" title="${sound.name}">${sound.name}</span>
                <div>
                    <button class="btn-play">▶</button>
                    <button class="btn-delete">✕</button>
                </div>
            </div>
            <select class="sound-category">
                <option value="uncategorized">Select category...</option>
                <option value="kick">Kick</option>
                <option value="snare">Snare</option>
                <option value="hihat">Hi-Hat</option>
                <option value="clap">Clap</option>
                <option value="perc">Percussion</option>
            </select>
        `;

        const select = item.querySelector('.sound-category');
        select.value = sound.category;

        item.querySelector('.btn-play').addEventListener('click', () => {
            console.log('▶️ Playing sound:', id);
            AudioManager.playSound(id);
        });

        item.querySelector('.btn-delete').addEventListener('click', async () => {
            if (confirm('Delete ' + sound.name + '?')) {
                await AudioManager.deleteSound(id);
                item.remove();
                this.status('Deleted ' + sound.name);
            }
        });

        select.addEventListener('change', async (e) => {
            console.log('Category changed:', id, '->', e.target.value);
            await AudioManager.updateCategory(id, e.target.value);
            this.status('Updated category');
        });

        this.elements.soundLibrary.appendChild(item);
    },

    generate() {
        console.log('🎵 ========== GENERATE STARTED ==========');

        try {
            // Step 1: Get prompt
            const prompt = this.elements.promptInput.value.trim();
            console.log('Step 1 - Prompt:', prompt);

            if (!prompt) {
                console.log('❌ No prompt entered');
                alert('Enter a prompt (e.g., "trap beat 140 bpm")');
                return;
            }

            // Step 2: Parse prompt
            console.log('Step 2 - Parsing prompt...');
            const parsed = PromptParser.parse(prompt);
            console.log('Parsed result:', parsed);

            // Step 3: Validate
            console.log('Step 3 - Validating...');
            const validation = PromptParser.validate(parsed);
            console.log('Validation result:', validation);

            if (!validation.valid) {
                console.log('❌ Validation failed:', validation.errors);
                alert(validation.errors.join('\n'));
                return;
            }

            // Step 4: Show parsed info
            console.log('Step 4 - Showing parsed info...');
            this.elements.parsedInfo.innerHTML = '<p>' + PromptParser.format(parsed) + '</p>';
            this.elements.parsedInfo.style.display = 'block';

            // Step 5: Get available sounds
            console.log('Step 5 - Getting available sounds...');
            const sounds = AudioManager.getAllSounds();
            console.log('All sounds:', sounds);

            const categories = [...new Set(sounds.map(s => s.category))].filter(c => c !== 'uncategorized');
            console.log('Available categories:', categories);

            if (categories.length === 0) {
                console.log('❌ No categorized sounds');
                alert('Please upload and categorize sounds first!\n\nMake sure to select a category (kick, snare, hihat, etc.) for each sound.');
                return;
            }

            // Step 6: Create pattern
            console.log('Step 6 - Creating pattern...');
            console.log('Genre:', parsed.genre);
            console.log('Categories:', categories);

            const pattern = PatternTemplates.createFromAvailable(parsed.genre, categories);
            console.log('Pattern created:', pattern);

            if (!pattern) {
                console.log('❌ Pattern creation failed');
                alert('Pattern not found for genre: ' + parsed.genre);
                return;
            }

            if (Object.keys(pattern.tracks).length === 0) {
                console.log('❌ No tracks in pattern');
                alert('No matching sounds for this pattern!\n\nMake sure you have sounds categorized as: ' + categories.join(', '));
                return;
            }

            pattern.bpm = parsed.bpm;
            this.currentPattern = pattern;

            console.log('Step 7 - Displaying pattern...');
            this.displayPattern(pattern);

            console.log('Step 8 - Initializing sequencer...');
            Sequencer.init(pattern, pattern.bpm);

            console.log('Step 9 - Enabling buttons...');
            this.elements.playBtn.disabled = false;
            this.elements.exportWavBtn.disabled = false;
            this.elements.exportMp3Btn.disabled = false;

            this.status('Pattern generated!');
            console.log('✓ ========== GENERATE COMPLETE ==========');

        } catch (error) {
            console.error('❌ ========== GENERATE ERROR ==========');
            console.error('Error:', error);
            console.error('Stack:', error.stack);
            alert('Error generating pattern:\n\n' + error.message + '\n\nCheck console for details (F12)');
        }
    },

    displayPattern(pattern) {
        console.log('Displaying pattern...');
        const container = this.elements.patternDisplay;
        container.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'pattern-grid';

        Object.keys(pattern.tracks).forEach(category => {
            const row = document.createElement('div');
            row.className = 'pattern-row';

            const label = document.createElement('div');
            label.className = 'pattern-label';
            label.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            row.appendChild(label);

            const steps = document.createElement('div');
            steps.className = 'pattern-steps';

            for (let i = 0; i < pattern.steps; i++) {
                const step = document.createElement('div');
                step.className = 'pattern-step';
                step.dataset.step = i;
                step.dataset.category = category;

                if (pattern.tracks[category][i] === 1) {
                    step.classList.add('active');
                }

                step.addEventListener('click', () => {
                    Sequencer.toggleStep(category, i);
                    step.classList.toggle('active');
                });

                steps.appendChild(step);
            }

            row.appendChild(steps);
            grid.appendChild(row);
        });

        container.appendChild(grid);
        console.log('✓ Pattern displayed');
    },

    async play() {
        console.log('▶️ Starting playback...');
        try {
            await AudioManager.ensureRunning();
            Sequencer.onStepChange = (step) => this.highlightStep(step);
            Sequencer.start();

            this.elements.playBtn.disabled = true;
            this.elements.stopBtn.disabled = false;
            this.status('Playing...');
        } catch (error) {
            console.error('❌ Play error:', error);
            alert('Playback error: ' + error.message);
        }
    },

    stop() {
        console.log('⏹️ Stopping playback...');
        Sequencer.stop();

        this.elements.playBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.status('Stopped');

        this.clearHighlight();
    },

    highlightStep(step) {
        this.clearHighlight();
        const steps = document.querySelectorAll(`.pattern-step[data-step="${step}"]`);
        steps.forEach(s => s.classList.add('playing'));
    },

    clearHighlight() {
        document.querySelectorAll('.pattern-step.playing').forEach(s => {
            s.classList.remove('playing');
        });
    },

    async export(format) {
        console.log('💾 Exporting as', format);

        if (!this.currentPattern) {
            alert('No pattern to export');
            return;
        }

        this.status('Exporting ' + format.toUpperCase() + '...');
        this.elements.exportWavBtn.disabled = true;
        this.elements.exportMp3Btn.disabled = true;

        try {
            let blob;
            const filename = 'beatbox-' + Date.now() + '.' + format;

            if (format === 'wav') {
                blob = await Exporter.exportWAV(this.currentPattern, this.currentPattern.bpm, 4);
            } else if (format === 'mp3') {
                blob = await Exporter.exportMP3(this.currentPattern, this.currentPattern.bpm, 4);
            }

            Exporter.download(blob, filename);
            this.status('Exported: ' + filename);
        } catch (error) {
            console.error('❌ Export error:', error);
            alert('Export failed: ' + error.message);
            this.status('Export failed');
        } finally {
            this.elements.exportWavBtn.disabled = false;
            this.elements.exportMp3Btn.disabled = false;
        }
    },

    async loadExisting() {
        console.log('📦 Loading existing sounds from storage...');
        try {
            const sounds = await AudioManager.loadFromStorage();
            sounds.forEach(sound => {
                this.addSoundItem(sound.id, sound);
            });
            if (sounds.length > 0) {
                this.status('Loaded ' + sounds.length + ' sounds from storage');
            }
        } catch (error) {
            console.error('❌ Load existing error:', error);
        }
    },

    status(msg) {
        if (this.elements.status) {
            this.elements.status.textContent = msg;
        }
        console.log('📊 Status:', msg);
    }
};
