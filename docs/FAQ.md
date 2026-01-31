# Frequently Asked Questions (FAQ)

## General Questions

### What is the Voice Intelligence Desktop App?

The Voice Intelligence Desktop App is a desktop application that captures voice input, transcribes it to text using AI, and enriches the transcription with intelligent formatting, summarization, and other AI-powered enhancements.

### What platforms does it support?

Currently, the app is built with Next.js and runs in a web browser. Desktop packaging with Tauri is planned for:
- Windows 10/11
- macOS 10.15+
- Linux (Ubuntu, Fedora, etc.)

### Is my data private?

Yes. All recordings are stored locally on your device using IndexedDB. Audio and transcriptions are only sent to OpenAI's API for processing and are not stored on external servers beyond the API call duration.

### Do I need an internet connection?

Yes, currently an internet connection is required for:
- Transcription (OpenAI Whisper API)
- AI enrichment (OpenAI GPT API)

Offline mode with local models is planned for a future release.

## Setup and Configuration

### How do I get an OpenAI API key?

1. Visit [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Click "Create new secret key"
5. Copy the key and add it to your `.env.local` file

See the [API Key Setup Guide](API_KEY_SETUP.md) for detailed instructions.

### Where do I put my API key?

Create a `.env.local` file in the project root and add:

```bash
OPENAI_API_KEY=sk-your-key-here
```

Never commit this file to version control.

### How much does it cost to use?

The app itself is free, but you'll need to pay for OpenAI API usage:

**Whisper API (Transcription):**
- $0.006 per minute of audio
- Example: 100 minutes = $0.60

**GPT-4 API (Enrichment):**
- $0.03 per 1K input tokens
- $0.06 per 1K output tokens
- Example: 10 enrichments ≈ $0.50

See [OpenAI Pricing](https://openai.com/pricing) for current rates.

### Can I use a different AI service?

Currently, the app is built for OpenAI's APIs. Support for other providers (Anthropic Claude, local models, etc.) is planned for future releases.

### The setup script fails. What should I do?

Try manual setup:

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your API key
npm run dev
```

If issues persist, check:
- Node.js version (18+ required)
- npm version (8+ required)
- Internet connection
- Disk space

## Recording Issues

### Why can't I record audio?

Common causes:
1. **No microphone permission** - Grant permission when prompted
2. **No microphone detected** - Check device is connected
3. **Browser compatibility** - Use Chrome, Edge, or Firefox
4. **HTTPS required** - MediaRecorder API requires secure context

### The recording quality is poor. How can I improve it?

Tips for better quality:
- Use an external microphone
- Record in a quiet environment
- Speak clearly and at normal pace
- Position microphone 6-12 inches from mouth
- Avoid background noise

### Can I use an external microphone?

Yes! The app will detect all available audio input devices. Select your preferred microphone in Settings > Audio Settings.

### What audio formats are supported?

The app records in WebM format by default (best browser support). Other formats may be available depending on your browser:
- WebM (recommended)
- MP3
- WAV

### How long can I record?

Technical limits:
- **Browser:** No hard limit, but longer recordings use more memory
- **API:** Whisper API supports up to ~2 hours
- **Recommended:** 30 seconds to 10 minutes per recording

For longer content, break it into segments.

### Why does recording stop automatically?

Possible reasons:
- Browser tab became inactive (some browsers pause recording)
- Ran out of disk space
- Browser crashed or was closed
- Microphone disconnected

## Transcription Issues

### The transcription is inaccurate. What can I do?

Improve accuracy by:
1. **Speaking clearly** - Enunciate words
2. **Reducing noise** - Record in quiet environment
3. **Specifying language** - Set language in settings
4. **Editing manually** - Fix errors after transcription
5. **Using better microphone** - Higher quality audio = better transcription

### What languages are supported?

OpenAI Whisper supports 50+ languages including:
- English, Spanish, French, German, Italian
- Portuguese, Dutch, Russian, Chinese, Japanese
- And many more

See [Whisper documentation](https://platform.openai.com/docs/guides/speech-to-text) for full list.

### Can it transcribe multiple speakers?

Whisper can transcribe multiple speakers but doesn't automatically identify who is speaking. Speaker diarization (identifying speakers) is not currently supported but may be added in future releases.

### Why is transcription taking so long?

Transcription time depends on:
- Audio length (longer = more time)
- Internet speed
- API load (OpenAI server capacity)
- File size

Typical times:
- 1 minute audio ≈ 5-10 seconds
- 5 minutes audio ≈ 20-30 seconds
- 10 minutes audio ≈ 40-60 seconds

### The transcription failed. What should I check?

1. **API key** - Verify it's correct and valid
2. **Internet connection** - Check you're online
3. **Audio file** - Ensure it's not corrupted
4. **File size** - Must be under 25MB
5. **API limits** - Check you haven't exceeded rate limits

## Enrichment Issues

### What's the difference between enrichment types?

- **Format:** Cleans up grammar, punctuation, capitalization
- **Summarize:** Creates concise summary of main points
- **Expand:** Adds detail and context to brief notes
- **Bullet Points:** Converts to organized list format
- **Action Items:** Extracts tasks and to-dos
- **Custom:** Use your own prompt for specific needs

### The enrichment doesn't match my expectations. What can I try?

1. **Try different type** - Each type has different purpose
2. **Adjust temperature** - Lower = more focused, Higher = more creative
3. **Edit transcription first** - Fix errors before enriching
4. **Use custom prompt** - Specify exactly what you want
5. **Iterate** - Try multiple enrichments and compare

### Can I save custom prompts?

Yes! Create custom prompts in the enrichment panel and save them as presets for future use.

### Why is enrichment expensive?

GPT-4 is more expensive than GPT-3.5-turbo. To reduce costs:
- Use GPT-3.5-turbo for simple tasks
- Keep input text concise
- Reduce max_tokens setting
- Use enrichment selectively

### Can I enrich the same text multiple times?

Yes! You can apply different enrichment types to the same transcription and compare results.

## Storage and History

### Where are my recordings stored?

Recordings are stored locally in your browser's IndexedDB. This is a secure, local database that persists across sessions.

### How much storage space do I have?

Browser storage limits vary:
- Chrome: ~60% of available disk space
- Firefox: ~50% of available disk space
- Safari: ~1GB

The app will warn you when approaching storage limits.

### Can I export my recordings?

Yes! Export options include:
- Plain text (.txt)
- Markdown (.md)
- JSON (with metadata)
- Audio file (original recording)

### How do I backup my data?

Currently, backups must be done manually by exporting recordings. Cloud sync and automatic backup features are planned for future releases.

### Can I delete recordings?

Yes. You can delete individual recordings or bulk delete multiple recordings from the History page. Deleted recordings cannot be recovered.

### How do I search my recordings?

Use the search bar in the History page to search by:
- Transcription text
- Tags
- Date range
- Duration

## Performance Issues

### The app is slow. How can I speed it up?

Performance tips:
1. **Close unused tabs** - Free up browser memory
2. **Clear old recordings** - Delete recordings you don't need
3. **Disable animations** - Settings > Appearance > Animations
4. **Use smaller recordings** - Break long recordings into segments
5. **Update browser** - Use latest version

### Why is my browser using so much memory?

Audio recordings and transcriptions use memory. To reduce usage:
- Delete old recordings regularly
- Export and remove completed projects
- Close other browser tabs
- Restart browser periodically

### The UI freezes during processing. Is this normal?

Brief freezes during processing are normal, especially for:
- Large audio files
- Long transcriptions
- Complex enrichments

If freezes are frequent or long, try:
- Reducing recording length
- Closing other applications
- Checking system resources

## Security and Privacy

### Is my API key secure?

Your API key is stored in `.env.local` which is:
- Not committed to version control
- Only accessible on your local machine
- Never sent to any server except OpenAI's API

### Can others access my recordings?

No. Recordings are stored locally in your browser and are not accessible to other users or websites.

### Does the app collect any data?

No. The app does not collect telemetry, analytics, or usage data. All data stays on your device.

### What data is sent to OpenAI?

Only:
- Audio files (for transcription)
- Text (for enrichment)

OpenAI's data usage policy:
- API data is not used to train models
- Data is not retained after processing
- See [OpenAI Privacy Policy](https://openai.com/privacy)

## Troubleshooting

### The app won't start. What should I check?

1. **Node.js installed** - Run `node --version`
2. **Dependencies installed** - Run `npm install`
3. **Port 3000 available** - Kill processes using port 3000
4. **Environment configured** - Check `.env.local` exists

### I get "API key not configured" error

1. Create `.env.local` file in project root
2. Add `OPENAI_API_KEY=sk-your-key-here`
3. Restart development server
4. Verify key is correct

### The hotkey doesn't work

1. Check hotkey in Settings
2. Verify no conflicts with other apps
3. Try different key combination
4. Restart application

### I see TypeScript errors

```bash
# Clear build cache
rm -rf .next
npm run build
```

If errors persist:
- Check TypeScript version
- Update dependencies
- Review error messages

### The build fails

Common causes:
- Missing dependencies - Run `npm install`
- TypeScript errors - Fix type errors
- ESLint errors - Run `npm run lint:fix`
- Out of memory - Increase Node memory

## Feature Requests

### Can you add [feature]?

Feature requests are welcome! Check the [Task List](.kiro/specs/tasklist.md) to see what's planned. For new features, create an issue with:
- Clear description
- Use case
- Expected behavior
- Why it's valuable

### When will [feature] be available?

Check the [Task List](.kiro/specs/tasklist.md) for development roadmap and estimated timelines.

### Can I contribute?

Yes! See the [Developer Guide](DEVELOPER_GUIDE.md) for contribution guidelines.

## Getting More Help

### Where can I find more documentation?

- [User Guide](USER_GUIDE.md) - End-user documentation
- [Developer Guide](DEVELOPER_GUIDE.md) - Development documentation
- [Architecture Guide](ARCHITECTURE.md) - System architecture
- [API Integration Guide](API_INTEGRATION.md) - API details
- [Setup Guide](SETUP.md) - Installation instructions

### How do I report a bug?

Create an issue with:
1. **Description** - What happened vs. what you expected
2. **Steps to reproduce** - How to trigger the bug
3. **Environment** - OS, browser, Node version
4. **Error messages** - Console logs, screenshots
5. **Impact** - How severe is the issue

### How do I request support?

For support:
1. Check this FAQ
2. Review documentation
3. Search existing issues
4. Create new issue if needed

### Is there a community forum?

Not yet. Community features may be added in future releases.

## About the Project

### Who built this?

This is a developer challenge project built as a demonstration of integrating voice recording, AI transcription, and LLM enrichment in a desktop application.

### What's the tech stack?

- **Frontend:** Next.js 15, React 18, TypeScript
- **Styling:** Tailwind CSS
- **Desktop:** Tauri (planned)
- **AI:** OpenAI Whisper + GPT-4
- **Storage:** IndexedDB

### Is it open source?

Currently this is a private project. Open source release may be considered in the future.

### Can I use this for commercial purposes?

Check the license file for usage terms. Note that OpenAI API usage is subject to OpenAI's terms of service.

## Conclusion

Can't find your answer? Check the documentation or create an issue with your question.
