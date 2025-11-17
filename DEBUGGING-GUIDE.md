# 🔍 DEBUGGING GUIDE - FIND OUT WHAT'S BROKEN

## STEP 1: TEST THE MINIMAL VERSION FIRST

Open **`minimal-working.html`** in your browser.

This is a single-file version with ALL code in one HTML file. If this doesn't work, the problem is your browser or environment.

### Test Steps:
1. Open `minimal-working.html`
2. Open browser console (F12)
3. Upload 3-5 audio files
4. Categorize each sound (kick, snare, hihat)
5. Type: `trap beat 140 bpm`
6. Click Generate
7. Click Play

**Expected Result:** You should see a pattern and hear audio.

---

## STEP 2: RUN THE DIAGNOSTIC TEST

Open **`test.html`** in your browser.

This tests if all the JavaScript modules are loading correctly.

### What to Check:
- All items should be GREEN (✓)
- Console output should show no errors
- Click the test button - it should respond

**If anything is RED:** That module has a problem.

---

## STEP 3: TEST THE MAIN APP WITH CONSOLE OPEN

Open **`index.html`** with browser console open (F12).

### Watch the Console Output:

When the page loads, you should see:
```
🎵 Beatbox Arranger v2.0 Starting...
✓ Browser support OK
✓ Storage initialized
🔧 Initializing UI...
✓ Found element: fileInput
✓ Found element: soundLibrary
✓ Found element: promptInput
✓ Found element: generateBtn
... (more elements)
✓ All event listeners attached
✓ UI ready
✓ App ready!
```

### Upload Audio Files

Watch for:
```
📁 Files selected: X
Loading file: filename.mp3
✓ Loaded: filename.mp3
```

### Change Category

Watch for:
```
Category changed: sound_xxx -> kick
```

### Click Generate Button

Watch for:
```
🎵 Generate button clicked!
🎵 ========== GENERATE STARTED ==========
Step 1 - Prompt: trap beat 140 bpm
Step 2 - Parsing prompt...
Parsed result: {genre: "trap", bpm: 140, success: true}
Step 3 - Validating...
Validation result: {valid: true, errors: []}
Step 4 - Showing parsed info...
Step 5 - Getting available sounds...
All sounds: [...]
Available categories: ["kick", "snare", "hihat"]
Step 6 - Creating pattern...
Genre: trap
Categories: ["kick", "snare", "hihat"]
Pattern created: {name: "Trap", bpm: 140, ...}
Step 7 - Displaying pattern...
✓ Pattern displayed
Step 8 - Initializing sequencer...
✓ Sequencer ready: Trap 140BPM
Step 9 - Enabling buttons...
✓ ========== GENERATE COMPLETE ==========
```

---

## COMMON ISSUES & SOLUTIONS

### Issue 1: Console says "❌ Missing element: XXX"
**Problem:** HTML element not found
**Solution:** Check index.html line 21-62 for missing IDs

### Issue 2: "No categorized sounds"
**Problem:** You didn't categorize the sounds
**Solution:** After uploading, select a category for EACH sound (kick, snare, hihat, etc.)

### Issue 3: "Genre not recognized"
**Problem:** Prompt not understood
**Solution:** Use exact phrases: "trap beat 140 bpm" or "house 128 bpm"

### Issue 4: Generate button doesn't do anything
**Check these:**
1. Does console show "🎵 Generate button clicked!"? → If NO, event listener not attached
2. Does it show Step 1? → If NO, generate() function crashing immediately
3. What error appears in console? → Copy exact error message

### Issue 5: Pattern generated but won't play
**Check:**
1. Click Play - does console show "▶️ Starting playback..."?
2. Is AudioContext suspended? (needs user interaction first)
3. Are sounds actually loaded? Run `debug()` in console

### Issue 6: Libraries not loading
**Check console for:**
```
❌ localforage not loaded
❌ lamejs not loaded
```
**Solution:** You need internet connection for CDN libraries

---

## DEBUG COMMANDS

Type these in browser console (F12):

```javascript
// Show full app status
debug()

// Check if modules exist
typeof StorageManager    // should be "object"
typeof AudioManager      // should be "object"
typeof PatternTemplates  // should be "object"
typeof PromptParser      // should be "object"
typeof Sequencer         // should be "object"
typeof Exporter          // should be "object"
typeof UI                // should be "object"

// Check sounds
AudioManager.getAllSounds()

// Check pattern
Sequencer.getPattern()

// Test parser
PromptParser.parse("trap beat 140 bpm")
```

---

## REPORT THE ISSUE

If still not working, copy ALL console output and tell me:

1. **Which step fails?** (Upload, Categorize, Generate, Play)
2. **What do you see in console?** (Copy everything)
3. **Any error messages?** (Copy exact text)
4. **Does minimal-working.html work?** (Yes/No)

---

## QUICK FIXES

### Clear Everything and Start Fresh:
```javascript
// Run in console:
await StorageManager.store.clear()
location.reload()
```

### Force AudioContext Resume:
```javascript
// Run in console:
AudioManager.context.resume()
```

### Check Event Listeners:
```javascript
// Click Generate and immediately check:
UI.elements.generateBtn   // Should not be null
```
