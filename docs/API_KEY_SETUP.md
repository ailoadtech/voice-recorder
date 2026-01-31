# API Key Configuration Guide

This guide will help you set up the required API keys for the Voice Intelligence Desktop App.

## Required API Keys

### OpenAI API Key

The app uses OpenAI's services for:
- **Whisper API**: Voice-to-text transcription
- **GPT API**: AI-powered text enrichment

You need an OpenAI API key to use both services.

## Getting Your OpenAI API Key

1. **Create an OpenAI Account**
   - Go to [https://platform.openai.com/signup](https://platform.openai.com/signup)
   - Sign up for a new account or log in if you already have one

2. **Add Payment Method**
   - Navigate to [Billing Settings](https://platform.openai.com/account/billing)
   - Add a payment method (credit card)
   - Note: OpenAI charges per API usage (pay-as-you-go)

3. **Generate API Key**
   - Go to [API Keys](https://platform.openai.com/api-keys)
   - Click "Create new secret key"
   - Give it a name (e.g., "Voice Intelligence App")
   - Copy the key immediately (you won't be able to see it again!)

## Configuring the App

### Step 1: Create Environment File

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` in your text editor

### Step 2: Add Your API Key

Replace the placeholder with your actual API key:

```bash
# Before
OPENAI_API_KEY=sk-your-api-key-here

# After
OPENAI_API_KEY=sk-proj-abc123xyz...
```

### Step 3: Configure Models (Optional)

You can customize which models to use:

```bash
# Whisper model for transcription
WHISPER_MODEL=whisper-1

# GPT model for text enrichment
# Options: gpt-4, gpt-4-turbo, gpt-3.5-turbo
GPT_MODEL=gpt-4
```

**Model Recommendations:**
- **gpt-4**: Best quality, higher cost
- **gpt-4-turbo**: Good balance of quality and speed
- **gpt-3.5-turbo**: Fastest, lowest cost, good for simple tasks

### Step 4: Validate Configuration

Run the validation script to verify your setup:

```bash
npm run validate:api-keys
```

This will check:
- ✓ Environment file exists
- ✓ API key is configured
- ✓ API key format is valid
- ✓ Connection to OpenAI API works
- ✓ Models are configured

## Security Best Practices

### Protect Your API Key

⚠️ **IMPORTANT**: Your API key is like a password. Keep it secure!

- ✓ **DO**: Store it in `.env.local` (this file is gitignored)
- ✓ **DO**: Keep it private and never share it
- ✓ **DO**: Rotate keys regularly
- ✗ **DON'T**: Commit it to version control
- ✗ **DON'T**: Share it in screenshots or logs
- ✗ **DON'T**: Hardcode it in your source code

### Monitor Usage

1. Check your usage regularly at [OpenAI Usage Dashboard](https://platform.openai.com/usage)
2. Set up usage limits to avoid unexpected charges
3. Enable email notifications for high usage

### Revoke Compromised Keys

If you accidentally expose your API key:
1. Go to [API Keys](https://platform.openai.com/api-keys)
2. Delete the compromised key immediately
3. Generate a new key
4. Update your `.env.local` file

## Cost Estimation

### Typical Usage Costs

**Whisper API (Transcription)**
- $0.006 per minute of audio
- Example: 10 minutes of recording = $0.06

**GPT-4 (Text Enrichment)**
- Input: $0.03 per 1K tokens (~750 words)
- Output: $0.06 per 1K tokens (~750 words)
- Example: Enriching 500 words ≈ $0.04

**Daily Usage Example:**
- 20 recordings × 2 minutes each = 40 minutes
- Transcription: 40 × $0.006 = $0.24
- Enrichment: 20 × $0.04 = $0.80
- **Total: ~$1.04/day**

### Cost Optimization Tips

1. **Use gpt-3.5-turbo for simple tasks** (10x cheaper than GPT-4)
2. **Batch process recordings** instead of enriching each one
3. **Set usage limits** in OpenAI dashboard
4. **Monitor your usage** regularly

## Troubleshooting

### "Invalid API Key" Error

**Symptoms:**
- App shows authentication error
- Validation script fails with 401 error

**Solutions:**
1. Verify the key is copied correctly (no extra spaces)
2. Check if the key starts with `sk-`
3. Ensure the key hasn't been revoked
4. Generate a new key if needed

### "Rate Limit Exceeded" Error

**Symptoms:**
- App shows rate limit error
- Requests fail with 429 status

**Solutions:**
1. Wait a few minutes and try again
2. Check your [rate limits](https://platform.openai.com/account/rate-limits)
3. Upgrade your OpenAI account tier if needed
4. Implement request throttling in the app

### "Insufficient Quota" Error

**Symptoms:**
- Requests fail with quota error
- No credits available

**Solutions:**
1. Add credits to your OpenAI account
2. Check your [billing settings](https://platform.openai.com/account/billing)
3. Set up auto-recharge to avoid interruptions

### Connection Errors

**Symptoms:**
- "Network error" messages
- Timeout errors

**Solutions:**
1. Check your internet connection
2. Verify firewall isn't blocking OpenAI API
3. Try using a different network
4. Check [OpenAI Status](https://status.openai.com/)

## Alternative Configurations

### Using Separate Keys

If you want to use different keys for Whisper and GPT:

```bash
# Use separate keys instead of OPENAI_API_KEY
WHISPER_API_KEY=sk-whisper-key-here
GPT_API_KEY=sk-gpt-key-here
```

### Custom API Endpoint

For enterprise or custom deployments:

```bash
OPENAI_API_BASE_URL=https://your-custom-endpoint.com/v1
```

### Timeout and Retry Configuration

Adjust API behavior:

```bash
# Request timeout in milliseconds
API_TIMEOUT=30000

# Maximum retry attempts for failed requests
API_MAX_RETRIES=3
```

## Next Steps

After configuring your API keys:

1. ✓ Run the validation script: `npm run validate:api-keys`
2. ✓ Start the development server: `npm run dev`
3. ✓ Test recording and transcription
4. ✓ Try different enrichment types
5. ✓ Monitor your usage and costs

## Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting) above
2. Review [OpenAI API documentation](https://platform.openai.com/docs)
3. Check [OpenAI Status](https://status.openai.com/) for service issues
4. Contact OpenAI support for API-related problems

## Additional Resources

- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Whisper API Guide](https://platform.openai.com/docs/guides/speech-to-text)
- [GPT API Guide](https://platform.openai.com/docs/guides/text-generation)
- [OpenAI Pricing](https://openai.com/pricing)
- [Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
