# Local Whisper Support - User Guide

## Overview

The Voice Intelligence Desktop App now supports local Whisper models for offline, privacy-focused transcription. This guide explains how to set up and use local transcription.

## Benefits of Local Transcription

- **Privacy**: Audio never leaves your device
- **Offline**: Works without internet connection
- **Cost**: No API usage fees
- **Speed**: Can be faster on capable hardware (depending on model size)

## Getting Started

### 1. Access Settings

1. Open the Voice Intelligence app
2. Navigate to **Settings** from the main menu
3. Scroll to the **Transcription Settings** section

### 2. Choose Transcription Method

You have two options:

**OpenAI API (Cloud)**
- Fast and accurate
- Requires internet connection
- Uses API credits
- No setup required

**Local Whisper Model (Offline)**
- Private and offline
- Requires model download
- Free after download
- Requires disk space

Select your preferred method using the radio buttons.

### 3. Download a Model (Local Only)

If you selected "Local Whisper Model", you need to download a model:

#### Model Variants

| Model | Size | Accuracy | Speed | Best For |
|-------|------|----------|-------|----------|
| **Tiny** | 75 MB | ⭐ Good | 🚀 Fast | Quick notes, testing |
| **Base** | 142 MB | ⭐⭐ Better | 🚀 Fast | General use, good balance |
| **Small** | 466 MB | ⭐⭐ Better | ⚡ Medium | **Recommended** for most users |
| **Medium** | 1.5 GB | ⭐⭐⭐ Best | 🐢 Slow | High accuracy needs |
| **Large** | 2.9 GB | ⭐⭐⭐ Best | 🐢 Slow | Maximum accuracy |

#### Download Steps

1. Check available disk space (shown at top right)
2. Click **Download** on your chosen model
3. Wait for download to complete (progress bar shows status)
4. Model will be validated automatically

**Tip**: Start with the **Small** model - it offers the best balance of accuracy and speed for most users.

### 4. Select Your Model

Once downloaded, click **Select** on the model you want to use for transcription.

### 5. Enable Fallback (Optional)

Check **"Enable API Fallback"** to automatically use the cloud API if local transcription fails. This provides a safety net while using local models.

## Using Local Transcription

Once configured, local transcription works exactly like API transcription:

1. Press your recording hotkey (default: `Ctrl+Shift+Space`)
2. Speak your message
3. Press the hotkey again to stop
4. Transcription happens automatically using your selected model

The app will show which method was used (Local or API) in the transcription results.

## Troubleshooting

### Model Download Fails

**Problem**: Download stops or shows an error

**Solutions**:
- Check your internet connection
- Ensure you have enough disk space
- Try downloading a smaller model first
- Check firewall settings (allow app to download)

### Transcription is Slow

**Problem**: Local transcription takes too long

**Solutions**:
- Use a smaller model (Tiny or Base)
- Enable API fallback for faster results
- Close other resource-intensive applications
- Consider using API transcription for time-sensitive work

### "Model Not Downloaded" Warning

**Problem**: Selected model shows as not downloaded

**Solutions**:
- Click the Download button for that model
- Wait for download to complete
- If download completed but still shows warning, try deleting and re-downloading

### Transcription Fails

**Problem**: Local transcription returns an error

**Solutions**:
- Ensure model is fully downloaded and validated
- Check that you have enough RAM (4GB+ recommended)
- Enable API fallback as a safety net
- Try a smaller model variant
- Check app logs for specific error messages

### Audio Quality Issues

**Problem**: Transcription accuracy is poor

**Solutions**:
- Use a larger model (Medium or Large)
- Ensure good microphone quality
- Speak clearly and reduce background noise
- Try API transcription for comparison

## Managing Models

### Deleting Models

To free up disk space:

1. Go to Settings > Transcription Settings
2. Find the model you want to remove
3. Click **Delete** button
4. Confirm deletion

**Note**: You cannot delete the currently selected model. Select a different model first.

### Changing Models

You can switch between downloaded models anytime:

1. Go to Settings > Transcription Settings
2. Click **Select** on a different downloaded model
3. Changes take effect immediately

### Storage Location

Models are stored in your application data directory:
- **Windows**: `%APPDATA%/voice-intelligence/models/`
- **Linux**: `~/.local/share/voice-intelligence/models/`
- **macOS**: `~/Library/Application Support/voice-intelligence/models/`

## Performance Tips

### For Best Speed
- Use Tiny or Base models
- Close other applications
- Ensure adequate RAM available

### For Best Accuracy
- Use Medium or Large models
- Ensure good audio quality
- Speak clearly with minimal background noise

### For Best Balance
- Use Small model (recommended)
- Enable API fallback
- Test with your typical use cases

## Privacy Considerations

### Local Transcription
- Audio never leaves your device
- No data sent to external servers
- Complete privacy

### API Transcription
- Audio sent to OpenAI servers
- Subject to OpenAI's privacy policy
- Processed in the cloud

### Fallback Mode
- Attempts local first
- Falls back to API only if local fails
- You'll be notified when fallback occurs

## System Requirements

### Minimum
- 4 GB RAM
- 500 MB disk space (for Small model)
- Modern CPU (2015 or newer)

### Recommended
- 8 GB RAM
- 2 GB disk space (for multiple models)
- Multi-core CPU
- SSD storage

## FAQ

**Q: Can I use multiple models at once?**
A: No, only one model can be active at a time, but you can download multiple models and switch between them.

**Q: Do I need an API key for local transcription?**
A: No, local transcription works completely offline without any API key.

**Q: How accurate is local transcription compared to API?**
A: The Large model is comparable to API accuracy. Smaller models trade some accuracy for speed.

**Q: Can I use local transcription on a laptop?**
A: Yes, but battery life may be impacted. Smaller models (Tiny/Base) are more battery-friendly.

**Q: What languages are supported?**
A: Whisper models support 99+ languages. English has the best accuracy.

**Q: Can I cancel a model download?**
A: Currently, downloads cannot be cancelled. Close the app if needed, and the partial download will be cleaned up.

**Q: Why is my first transcription slow?**
A: The model needs to be loaded into memory on first use. Subsequent transcriptions are faster.

**Q: How long does the model stay in memory?**
A: Models automatically unload after 5 minutes of inactivity to free up RAM.

## Support

If you encounter issues not covered in this guide:

1. Check the app logs for error details
2. Try the API transcription method to isolate the issue
3. Report bugs with specific error messages
4. Include your system specifications when reporting issues

## Updates

Model files are downloaded from Hugging Face and are maintained by the Whisper.cpp community. The app will notify you if model updates are available.
