# Voice Intelligence Desktop App - User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Recording Audio](#recording-audio)
3. [Viewing Transcriptions](#viewing-transcriptions)
4. [AI Enrichment](#ai-enrichment)
5. [Managing History](#managing-history)
6. [Settings](#settings)
7. [Keyboard Shortcuts](#keyboard-shortcuts)
8. [Tips & Tricks](#tips--tricks)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### First Launch

When you first launch the Voice Intelligence Desktop App, you'll see the main dashboard with three main sections:

1. **Quick Record** - Start a new recording
2. **History** - View past recordings
3. **Settings** - Configure the app

### Initial Setup

Before you can use the app, you need to:

1. **Configure API Keys**
   - Navigate to Settings
   - Enter your OpenAI API key
   - Click "Save" to store your configuration

2. **Grant Microphone Permission**
   - When you first try to record, your browser will ask for microphone access
   - Click "Allow" to grant permission
   - This only needs to be done once

## Recording Audio

### Starting a Recording

There are two ways to start recording:

**Method 1: Click the Record Button**
1. Navigate to the Record page
2. Click the large red microphone button
3. Start speaking

**Method 2: Use Keyboard Shortcut**
1. Press `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. The app will start recording immediately
3. Works even when the app is in the background

### During Recording

While recording:
- The button will pulse red
- A timer shows the recording duration
- An audio level indicator shows your voice input (if enabled)

### Stopping a Recording

To stop recording:
- Click the stop button (square icon)
- Or press the hotkey again (`Ctrl+Shift+R`)

The app will automatically:
1. Process the audio
2. Send it for transcription
3. Display the transcribed text

## Viewing Transcriptions

### Transcription Display

After recording stops, you'll see:

1. **Original Audio**
   - Play/pause controls
   - Progress bar
   - Duration display

2. **Transcribed Text**
   - The text version of your recording
   - Edit button to make corrections
   - Copy button to copy to clipboard

3. **Metadata**
   - Recording date and time
   - Duration
   - Language detected
   - Word count

### Editing Transcriptions

To edit a transcription:
1. Click the "Edit" button
2. Make your changes in the text area
3. Click "Save" to keep changes
4. Or "Cancel" to discard

## AI Enrichment

### Enrichment Types

The app offers several ways to enhance your transcribed text:

**1. Format**
- Cleans up grammar and punctuation
- Fixes capitalization
- Removes filler words
- Best for: Quick cleanup of casual speech

**2. Summarize**
- Creates a concise summary
- Extracts key points
- Reduces length by ~70%
- Best for: Long recordings, meeting notes

**3. Expand**
- Adds detail and context
- Elaborates on key points
- Increases clarity
- Best for: Brief notes that need more detail

**4. Bullet Points**
- Converts to list format
- Organizes by topic
- Easy to scan
- Best for: Action items, key takeaways

**5. Action Items**
- Extracts tasks and to-dos
- Identifies deadlines
- Assigns priorities
- Best for: Meeting notes, planning sessions

**6. Custom**
- Use your own prompt
- Full control over output
- Advanced users
- Best for: Specific formatting needs

### Using Enrichment

1. **Select Type**
   - Choose an enrichment type from the dropdown
   - Or select a preset for common use cases

2. **Customize (Optional)**
   - Adjust temperature (creativity level)
   - Set max length
   - Add custom instructions

3. **Process**
   - Click "Enrich" button
   - Wait for AI processing (usually 5-15 seconds)
   - View the enriched output

4. **Compare**
   - Toggle between original and enriched versions
   - Make additional edits if needed
   - Re-process with different settings

### Enrichment Presets

Quick presets for common scenarios:

- **Quick Notes**: Fast formatting for brief notes
- **Meeting Summary**: Comprehensive meeting recap
- **Email Draft**: Professional email format
- **Blog Post**: Expanded content for blogging
- **Study Notes**: Organized learning material

## Managing History

### Viewing History

The History page shows all your past recordings:

**List View:**
- Thumbnail preview
- Date and time
- Duration
- First line of transcription
- Tags (if added)

**Sorting Options:**
- Newest first (default)
- Oldest first
- Longest duration
- Shortest duration
- Alphabetical

**Filtering:**
- By date range
- By tags
- By duration
- Search by text content

### Recording Details

Click any recording to view full details:

1. **Audio Playback**
   - Full audio player with controls
   - Download original audio

2. **Transcription**
   - Full transcribed text
   - Edit and save changes
   - Copy to clipboard

3. **Enriched Versions**
   - View all enriched versions
   - Compare different enrichments
   - Re-process with new settings

4. **Metadata**
   - Creation date
   - Last modified
   - File size
   - Processing time

### Managing Recordings

**Actions Available:**

- **Edit**: Modify transcription or enrichment
- **Copy**: Copy text to clipboard
- **Export**: Save as .txt or .md file
- **Tag**: Add organizational tags
- **Delete**: Remove recording permanently

**Bulk Actions:**

- Select multiple recordings
- Delete in bulk
- Export multiple files
- Add tags to multiple items

## Settings

### General Settings

**Auto-Save:**
- Automatically save recordings after transcription
- Default: Enabled

**Default Enrichment:**
- Choose default enrichment type
- Applied automatically after transcription
- Default: None (manual selection)

### Audio Settings

**Input Device:**
- Select microphone
- Test audio levels
- Adjust input volume

**Audio Quality:**
- High (best quality, larger files)
- Medium (balanced)
- Low (smaller files, faster processing)

**Format:**
- WebM (recommended)
- MP3
- WAV

### API Settings

**OpenAI Configuration:**
- API key
- Model selection (Whisper, GPT-4, GPT-3.5)
- API endpoint (for custom deployments)

**Rate Limiting:**
- Max requests per minute
- Retry attempts
- Timeout duration

### Appearance

**Theme:**
- Light mode
- Dark mode
- System (follows OS preference)

**Font Size:**
- Small
- Medium (default)
- Large

**Animations:**
- Enable/disable UI animations
- Reduce motion (accessibility)

### Keyboard Shortcuts

**Recording Hotkey:**
- Customize global hotkey
- Default: `Ctrl+Shift+R`
- Test hotkey functionality

**Other Shortcuts:**
- Copy transcription: `Ctrl+C`
- Save recording: `Ctrl+S`
- Delete recording: `Delete`

### Privacy

**Data Storage:**
- All data stored locally
- No cloud sync (optional feature)
- Clear all data option

**API Usage:**
- View API call history
- Monitor token usage
- Set usage limits

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+R` | Start/Stop recording |
| `Ctrl+N` | New recording |
| `Ctrl+H` | Open history |
| `Ctrl+,` | Open settings |

### Recording Page

| Shortcut | Action |
|----------|--------|
| `Space` | Play/Pause audio |
| `Ctrl+E` | Edit transcription |
| `Ctrl+C` | Copy transcription |
| `Ctrl+Shift+E` | Enrich text |

### History Page

| Shortcut | Action |
|----------|--------|
| `↑/↓` | Navigate recordings |
| `Enter` | Open selected recording |
| `Delete` | Delete selected recording |
| `Ctrl+F` | Search recordings |

### Text Editing

| Shortcut | Action |
|----------|--------|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+A` | Select all |
| `Ctrl+S` | Save changes |
| `Esc` | Cancel editing |

## Tips & Tricks

### Recording Tips

1. **Speak Clearly**
   - Maintain consistent distance from microphone
   - Avoid background noise
   - Speak at normal pace

2. **Optimal Length**
   - 30 seconds to 5 minutes works best
   - Longer recordings may take more time to process
   - Break very long content into segments

3. **Provide Context**
   - Start with topic or purpose
   - Use clear transitions between topics
   - End with summary or conclusion

### Transcription Tips

1. **Language Detection**
   - Specify language in settings for better accuracy
   - Mix of languages may reduce accuracy
   - Use language-specific models when available

2. **Technical Terms**
   - Spell out acronyms first time
   - Speak technical terms clearly
   - Add custom vocabulary in settings

3. **Editing**
   - Review transcription before enrichment
   - Fix names and technical terms
   - Add punctuation if needed

### Enrichment Tips

1. **Choose Right Type**
   - Format: For quick cleanup
   - Summarize: For long content
   - Expand: For brief notes
   - Custom: For specific needs

2. **Experiment**
   - Try different enrichment types
   - Adjust temperature for creativity
   - Compare results

3. **Iterate**
   - Start with one enrichment
   - Refine with custom prompts
   - Save successful prompts as presets

### Organization Tips

1. **Use Tags**
   - Create consistent tag system
   - Use tags for projects, topics, dates
   - Filter by tags for quick access

2. **Regular Cleanup**
   - Review and delete old recordings
   - Export important recordings
   - Archive completed projects

3. **Naming Convention**
   - Add descriptive notes
   - Use consistent date format
   - Include project or topic name

## Troubleshooting

### Recording Issues

**Problem: No audio detected**
- Check microphone is connected
- Verify microphone permissions
- Test microphone in system settings
- Try different input device

**Problem: Poor audio quality**
- Move closer to microphone
- Reduce background noise
- Check microphone settings
- Increase input volume

**Problem: Recording stops unexpectedly**
- Check available disk space
- Verify browser permissions
- Update browser to latest version
- Try different audio format

### Transcription Issues

**Problem: Transcription is inaccurate**
- Speak more clearly
- Reduce background noise
- Specify language in settings
- Edit transcription manually

**Problem: Transcription takes too long**
- Check internet connection
- Verify API key is valid
- Try shorter recordings
- Check API rate limits

**Problem: Transcription fails**
- Verify API key is correct
- Check internet connection
- Ensure audio file is valid
- Review error message for details

### Enrichment Issues

**Problem: Enrichment fails**
- Check API key is valid
- Verify internet connection
- Ensure input text is not too long
- Check API rate limits

**Problem: Enrichment is not helpful**
- Try different enrichment type
- Adjust temperature setting
- Use custom prompt
- Edit transcription first

**Problem: Enrichment takes too long**
- Check internet connection
- Try shorter input text
- Reduce max tokens setting
- Check API status

### General Issues

**Problem: App is slow**
- Close unused tabs
- Clear browser cache
- Check system resources
- Disable animations in settings

**Problem: Settings not saving**
- Check browser permissions
- Clear browser cache
- Try different browser
- Check for browser extensions

**Problem: Hotkey not working**
- Verify hotkey in settings
- Check for conflicts with other apps
- Try different key combination
- Restart application

### Getting Help

If you continue to experience issues:

1. **Check Documentation**
   - Review this user guide
   - Check troubleshooting section
   - Read FAQ

2. **Check Logs**
   - Open browser console (F12)
   - Look for error messages
   - Copy error details

3. **Contact Support**
   - Provide error messages
   - Describe steps to reproduce
   - Include system information

## Conclusion

This user guide covers the main features and functionality of the Voice Intelligence Desktop App. For technical documentation, see the [Architecture Guide](ARCHITECTURE.md) and [API Integration Guide](API_INTEGRATION.md).

Happy recording!
