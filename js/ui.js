// ui.js - User interface management
const UI = {
    elements: {},
    currentPattern: null,

    init() {
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

        // Setup listeners
        this.elements.fileInput.addEventListener('change', (e) => this.handleFiles(e));
        this.elements.generateBtn.addEventListener('click', () => this.generate());
        this.elements.promptInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generate();
        });
        this.elements.playBtn.addEventListener('click', () => this.play());
        this.elements.stopBtn.addEventListener('click', () => this.stop());
        this.elements.exportWavBtn.addEventListener('click', () => this.export('wav'));
        this.elements.exportMp3Btn.addEventListener('click', () => this.export('mp3'));

        console.log('✓ UI ready');
    },

    async handleFiles(event) {
        const files = event.target.files;
        if (files.length === 0) return;

        this.status('Loading sounds...');

        for (const file of files) {
            try {
                const id = 'sound_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                await AudioManager.loadSound(file, id);
                this.addSoundItem(id, AudioManager.sounds[id]);
            } catch (error) {
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
            await AudioManager.updateCategory(id, e.target.value);
            this.status('Updated category');
        });

        this.elements.soundLibrary.appendChild(item);
    },

    generate() {
        const prompt = this.elements.promptInput.value.trim();
        if (!prompt) {
            alert('Enter a prompt (e.g., "trap beat 140 bpm")');
            return;
        }

        // Parse
        const parsed = PromptParser.parse(prompt);
        const validation = PromptParser.validate(parsed);

        if (!validation.valid) {
            alert(validation.errors.join('\n'));
            return;
        }

        // Show parsed info
        this.elements.parsedInfo.innerHTML = '<p>' + PromptParser.format(parsed) + '</p>';
        this.elements.parsedInfo.style.display = 'block';

        // Get available categories
        const sounds = AudioManager.getAllSounds();
        const categories = [...new Set(sounds.map(s => s.category))].filter(c => c !== 'uncategorized');

        if (categories.length === 0) {
            alert('Please upload and categorize sounds first!');
            return;
        }

        // Create pattern
        const pattern = PatternTemplates.createFromAvailable(parsed.genre, categories);
        if (!pattern) {
            alert('Pattern not found');
            return;
        }

        pattern.bpm = parsed.bpm;
        this.currentPattern = pattern;

        // Display
        this.displayPattern(pattern);

        // Init sequencer
        Sequencer.init(pattern, pattern.bpm);

        // Enable buttons
        this.elements.playBtn.disabled = false;
        this.elements.exportWavBtn.disabled = false;
        this.elements.exportMp3Btn.disabled = false;

        this.status('Pattern generated!');
    },

    displayPattern(pattern) {
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
    },

    async play() {
        await AudioManager.ensureRunning();

        Sequencer.onStepChange = (step) => this.highlightStep(step);
        Sequencer.start();

        this.elements.playBtn.disabled = true;
        this.elements.stopBtn.disabled = false;
        this.status('Playing...');
    },

    stop() {
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
            alert('Export failed: ' + error.message);
            this.status('Export failed');
        } finally {
            this.elements.exportWavBtn.disabled = false;
            this.elements.exportMp3Btn.disabled = false;
        }
    },

    async loadExisting() {
        const sounds = await AudioManager.loadFromStorage();
        sounds.forEach(sound => {
            this.addSoundItem(sound.id, sound);
        });
        if (sounds.length > 0) {
            this.status('Loaded ' + sounds.length + ' sounds from storage');
        }
    },

    status(msg) {
        if (this.elements.status) {
            this.elements.status.textContent = msg;
        }
        console.log('Status:', msg);
    }
};
