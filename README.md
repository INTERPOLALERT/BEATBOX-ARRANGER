# Beatbox Arranger

AI-powered beatbox pattern arranger using Web Audio API and natural language processing.

## Features

- Upload and categorize beatbox sounds
- Natural language prompt parsing ("trap beat 140 bpm")
- Real-time pattern generation with 5-6 genre templates
- Precise audio scheduling using AudioContext.currentTime
- IndexedDB storage for uploaded sounds
- Export to WAV or MP3 format
- No timing issues - uses Web Audio API correctly

## Quick Start

1. Open `index.html` in a modern web browser
2. Upload your beatbox samples (kick, snare, hi-hat, etc.)
3. Categorize each sound
4. Enter a prompt like "trap beat 140 bpm"
5. Click Generate Pattern
6. Click Play to hear your beat
7. Export as WAV or MP3

## Supported Genres

- Trap (130-150 BPM)
- Boom Bap (85-95 BPM)
- House (120-130 BPM)
- Dubstep (135-145 BPM)
- Techno (125-135 BPM)
- Lo-Fi (80-95 BPM)

## Technical Stack

- **Web Audio API**: Audio scheduling and playback
- **IndexedDB**: Persistent storage via localforage
- **OfflineAudioContext**: Fast rendering for export
- **lamejs**: MP3 encoding
- **Vanilla JavaScript**: No frameworks required

## File Structure

```
beatbox-arranger/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── package.json        # Project metadata
└── js/
    ├── storage.js      # IndexedDB management
    ├── audioManager.js # AudioContext and sound loading
    ├── patterns.js     # Genre pattern templates
    ├── promptParser.js # Natural language parsing
    ├── sequencer.js    # Audio scheduling engine
    ├── exporter.js     # WAV/MP3 export
    ├── ui.js           # UI management
    └── app.js          # Main application logic
```

## Success Criteria

- ✅ Upload 5+ beatbox sounds
- ✅ Each sound plays when clicked
- ✅ Prompt "trap beat 140 bpm" generates pattern
- ✅ Play triggers sounds in rhythm
- ✅ Export downloads playable audio
- ✅ File sounds like live playback
- ✅ No audio degradation
- ✅ Different prompts create different patterns

## Troubleshooting

### Audio Not Playing
- AudioContext requires user interaction - click Play button
- Verify audio files are valid (MP3, WAV, OGG)
- Check browser console for errors

### Timing Issues
- App uses AudioContext.currentTime (not setTimeout)
- Check if BPM is correct in prompt

### Export Fails
- Large projects may exceed memory
- Try reducing duration or simplifying pattern

## Browser Support

Works in all modern browsers supporting:
- Web Audio API
- IndexedDB
- ES6+

Recommended: Chrome, Firefox, Edge, Safari (latest versions)

## License

MIT
