# 🎵 QUICK START GUIDE

## How to Use Beatbox Arranger

### Step 1: Open the App
Open `index.html` in your web browser (Chrome, Firefox, Edge, or Safari)

### Step 2: Upload Sounds
1. Click "Choose Audio Files"
2. Select 5-10 beatbox samples (kick, snare, hi-hat, etc.)
3. Categorize each sound using the dropdown:
   - **Kick** - Bass drum sounds
   - **Snare** - Snare drum sounds
   - **Hi-Hat** - Hi-hat sounds
   - **Clap** - Clap/handclap sounds
   - **Perc** - Other percussion

💡 **Tip**: Click the ▶ button on each sound to test it!

### Step 3: Generate a Pattern
Type a prompt in the text box. Try these:

```
trap beat 140 bpm
boom bap 90 bpm
house 128 bpm
dubstep 140 bpm
techno 130 bpm
lo-fi 85 bpm
```

Then click **Generate**

### Step 4: Play Your Beat
1. Click **▶ Play** to hear your pattern
2. Click **■ Stop** to stop
3. Click on steps in the pattern grid to toggle them on/off

### Step 5: Export
- Click **Export WAV** for WAV file
- Click **Export MP3** for MP3 file

---

## Supported Genres

| Genre | BPM Range | Style |
|-------|-----------|-------|
| **Trap** | 130-150 | Hard-hitting kicks, rolling hi-hats |
| **Boom Bap** | 85-95 | Classic hip-hop groove |
| **House** | 120-130 | Four-on-the-floor kicks |
| **Dubstep** | 135-145 | Half-time feel, heavy bass |
| **Techno** | 125-135 | Driving, repetitive |
| **Lo-Fi** | 80-95 | Laid-back, swung feel |

---

## Troubleshooting

### Audio Not Playing?
- Click the Play button (AudioContext needs user interaction)
- Check browser console (F12) for errors
- Make sure sounds are categorized

### Pattern Not Generating?
- Check that you uploaded sounds
- Make sure sounds are categorized (not "uncategorized")
- Try a different prompt

### Export Not Working?
- WAV should always work
- MP3 requires lamejs library (check console for errors)
- Try exporting WAV first

---

## Where Are My Sounds Stored?

Your uploaded sounds are saved in your browser's IndexedDB storage. They will be automatically loaded next time you open the app!

To clear storage: Open browser console and run:
```javascript
await StorageManager.store.clear()
```

---

## Technical Details

- **Audio Engine**: Web Audio API with AudioContext.currentTime scheduling
- **Storage**: IndexedDB via localforage
- **Export**: OfflineAudioContext for perfect rendering
- **Formats**: WAV (16-bit PCM), MP3 (128kbps)
- **Pattern**: 16-step sequencer (4/4 time)

---

## Debug Mode

Open browser console (F12) and type:
```javascript
debug()
```

This shows:
- How many sounds are loaded
- AudioContext state
- Current pattern info
- Available genres

---

## Need Help?

Check browser console (F12) for detailed error messages.

All actions are logged with ✓ or ❌ symbols.
