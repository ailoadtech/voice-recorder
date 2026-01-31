# Complete Setup Guide

This guide provides comprehensive setup instructions for the Voice Intelligence Desktop App.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup Steps](#detailed-setup-steps)
4. [Verification](#verification)
5. [Next Steps](#next-steps)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Node.js 18+** and npm
  - Check version: `node --version` (should be v18.0.0 or higher)
  - Download from: [nodejs.org](https://nodejs.org/)
  - Or use nvm (recommended): See [WSL Development Guide](WSL_DEVELOPMENT.md)

- **Git**
  - Check version: `git --version`
  - Download from: [git-scm.com](https://git-scm.com/)

- **OpenAI API Key**
  - Required for transcription and AI enrichment
  - Get your key at: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
  - Pricing: Pay-as-you-go (Whisper: ~$0.006/minute, GPT-4: varies)

### Platform-Specific Requirements

#### Windows (WSL Development)

- **WSL 2** (Windows Subsystem for Linux)
  - Check if installed: `wsl --version` in PowerShell
  - Install if needed: `wsl --install` in PowerShell (as Administrator)
  - Recommended distribution: Ubuntu 22.04 LTS
  - See detailed guide: [WSL Development Guide](WSL_DEVELOPMENT.md)

#### macOS

- **Xcode Command Line Tools**
  ```bash
  xcode-select --install
  ```

#### Linux

- **Build essentials**
  ```bash
  sudo apt update
  sudo apt install build-essential -y
  ```

## Quick Start

### Option 1: Automated Setup (WSL Only)

If you're using WSL, the fastest way to get started:

```bash
# Run automated setup script
chmod +x scripts/wsl-setup.sh
./scripts/wsl-setup.sh

# Edit .env.local to add your API key
nano .env.local

# Start development server
npm run dev
```

The automated script handles:
- ✅ Verifying Node.js and npm
- ✅ Installing Git and build tools
- ✅ Configuring file watchers
- ✅ Installing dependencies
- ✅ Creating environment file
- ✅ Validating configuration

### Option 2: Manual Setup (All Platforms)

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
cp .env.example .env.local

# 3. Edit .env.local and add your API key
# (Use your preferred text editor)

# 4. Validate environment
npm run validate-env

# 5. Start development server
npm run dev
```

## Detailed Setup Steps

### Step 1: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- Next.js 15
- React 18
- TypeScript
- Tailwind CSS
- ESLint and Prettier
- And more...

**Expected output:**
```
added XXX packages in XXs
```

**If you encounter errors:**
- Ensure Node.js 18+ is installed
- Try clearing npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then retry

### Step 2: Configure Environment Variables


#### 2.1 Create Environment File

```bash
cp .env.example .env.local
```

This creates your local environment configuration file.

**Important:**
- `.env.local` is NOT committed to git (it's in `.gitignore`)
- This file will contain your API keys and sensitive configuration
- Never share this file or commit it to version control

#### 2.2 Add Your API Key

Edit `.env.local` and add your OpenAI API key:

```bash
# Using nano (Linux/WSL/macOS)
nano .env.local

# Or using vim
vim .env.local

# Or using VS Code
code .env.local
```

**Required configuration:**
```bash
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Optional configuration:**
```bash
# AI Model Configuration
WHISPER_MODEL=whisper-1
GPT_MODEL=gpt-4

# Application Settings
HOTKEY_COMBINATION=CommandOrControl+Shift+R
NODE_ENV=development

# Feature Flags
AUTO_ENRICH=false
ENABLE_SYSTEM_TRAY=true
DEBUG=false
```

For complete list of available variables, see [Environment Setup Guide](ENVIRONMENT_SETUP.md).

#### 2.3 Validate Configuration

```bash
npm run validate-env
```

This script checks:
- ✅ Required environment variables are set
- ✅ API key format is valid
- ✅ Configuration values are correct
- ✅ Type safety is maintained

**Expected output:**
```
✓ Environment validation passed
✓ All required variables are set
✓ Configuration is valid
```

**If validation fails:**
- Check that `OPENAI_API_KEY` is set in `.env.local`
- Ensure the API key starts with `sk-`
- Verify no extra spaces or quotes around values
- Restart your terminal/editor after changes

### Step 3: Start Development Server

```bash
npm run dev
```

This starts the Next.js development server with:
- Hot reload enabled
- TypeScript compilation
- Tailwind CSS processing
- API routes available

**Expected output:**
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Ready in Xs
```

### Step 4: Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

**In WSL:**
- The port is automatically forwarded to Windows
- Access from Windows browser at `http://localhost:3000`
- No additional configuration needed

**You should see:**
- The Voice Intelligence App home page
- Navigation to Record, History, and Settings pages
- No errors in the browser console

## Verification

### Verify Installation

Run these commands to verify everything is set up correctly:

```bash
# Check Node.js version
node --version
# Should output: v18.x.x or higher

# Check npm version
npm --version
# Should output: 9.x.x or higher

# Check Git version
git --version
# Should output: git version 2.x.x

# Verify dependencies are installed
ls node_modules
# Should show many packages

# Verify environment file exists
ls -la .env.local
# Should show the file (not an error)

# Validate environment configuration
npm run validate-env
# Should output: ✓ Environment validation passed

# Check development server
npm run dev
# Should start without errors
```

### Verify Development Environment

1. **Server is running:**
   - Visit `http://localhost:3000`
   - Page loads without errors
   - No console errors in browser DevTools

2. **Hot reload works:**
   - Edit `src/app/page.tsx`
   - Save the file
   - Browser automatically refreshes with changes

3. **TypeScript compilation:**
   - No TypeScript errors in terminal
   - IntelliSense works in your editor

4. **Linting works:**
   ```bash
   npm run lint
   ```
   - Should complete without errors

5. **Formatting works:**
   ```bash
   npm run format
   ```
   - Should format files successfully

### Verify API Configuration

To test that your OpenAI API key is working:

1. Start the development server: `npm run dev`
2. Navigate to the Record page: `http://localhost:3000/record`
3. Check browser console for any API-related errors
4. (Once audio recording is implemented) Test a recording

**Note:** Full API testing requires implementing the audio recording and transcription features (Phase 2 and Phase 4).

## Next Steps

After completing setup, you're ready to start development:

### Immediate Next Steps

1. **Explore the codebase:**
   - Review `src/app/` for page structure
   - Check `src/lib/env.ts` for environment handling
   - Look at `src/components/` for UI components

2. **Review documentation:**
   - [Environment Setup Guide](ENVIRONMENT_SETUP.md) - Detailed env var docs
   - [WSL Development Guide](WSL_DEVELOPMENT.md) - WSL-specific workflow
   - [Task List](../.kiro/specs/tasklist.md) - Development roadmap

3. **Configure your editor:**
   - Install ESLint extension
   - Install Prettier extension
   - Enable format on save
   - Configure TypeScript support

### Development Workflow

```bash
# Start development server
npm run dev

# In another terminal, run linting
npm run lint

# Format code before committing
npm run format

# Validate environment after changes
npm run validate-env
```

### Next Development Phase

According to the [Task List](../.kiro/specs/tasklist.md), the next phase is:

**Phase 1.2: Configure Tauri Desktop Runtime**
- Install Tauri CLI and prerequisites
- Initialize Tauri in the project
- Configure desktop window settings
- Test basic desktop functionality

See the task list for detailed steps.

## Troubleshooting

### Common Issues

#### Issue: "node: command not found"

**Solution:**
```bash
# Install Node.js using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

#### Issue: "npm install" fails with permission errors

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules

# Or use sudo (not recommended)
sudo npm install
```

#### Issue: "npm install" is very slow in WSL

**Solution:**
```bash
# Use npm cache in /tmp
npm config set cache /tmp/npm-cache
npm install

# Or use pnpm for faster installs
npm install -g pnpm
pnpm install
```

#### Issue: File watching not working in WSL

**Solution:**
```bash
# Increase inotify watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Restart development server
npm run dev
```

#### Issue: Port 3000 already in use

**Solution:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

#### Issue: Environment validation fails

**Solution:**
1. Ensure `.env.local` exists: `ls -la .env.local`
2. Check API key is set: `grep OPENAI_API_KEY .env.local`
3. Verify no extra spaces: `OPENAI_API_KEY=sk-...` (no spaces around `=`)
4. Ensure API key starts with `sk-`
5. Restart development server after changes

#### Issue: Cannot access localhost from Windows (WSL)

**Solution:**
```bash
# Check WSL IP address
ip addr show eth0 | grep inet

# Access using WSL IP instead of localhost
# http://<wsl-ip>:3000

# Or check Windows firewall settings
# Ensure port 3000 is not blocked
```

#### Issue: TypeScript errors in editor

**Solution:**
1. Restart TypeScript server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
2. Delete and regenerate: `rm -rf .next && npm run dev`
3. Check `tsconfig.json` is present
4. Ensure TypeScript is installed: `npm list typescript`

#### Issue: ESLint or Prettier not working

**Solution:**
```bash
# Reinstall dev dependencies
npm install --save-dev eslint prettier

# Check configuration files exist
ls eslint.config.mjs .prettierrc

# Run manually to test
npm run lint
npm run format
```

### Getting Help

If you encounter issues not covered here:

1. **Check detailed guides:**
   - [WSL Development Guide](WSL_DEVELOPMENT.md#common-issues-and-solutions)
   - [Environment Setup Guide](ENVIRONMENT_SETUP.md#troubleshooting)

2. **Check logs:**
   - Terminal output for error messages
   - Browser console for client-side errors
   - `.next/` directory for build logs

3. **Clean and retry:**
   ```bash
   # Clean everything and start fresh
   rm -rf node_modules package-lock.json .next
   npm install
   npm run dev
   ```

4. **Verify prerequisites:**
   - Node.js 18+ installed
   - npm working correctly
   - Git installed
   - Sufficient disk space
   - Internet connection for API calls

## Platform-Specific Notes

### Windows (WSL)

- Use the automated setup script: `./scripts/wsl-setup.sh`
- See [WSL Development Guide](WSL_DEVELOPMENT.md) for detailed WSL workflow
- Configure `.wslconfig` for optimal performance
- Use VS Code with Remote-WSL extension for best experience

### macOS

- Install Xcode Command Line Tools first
- Use Homebrew for package management (optional)
- Native performance, no special configuration needed

### Linux

- Install build-essential package
- May need to configure file watchers manually
- Native performance, no special configuration needed

## Summary

After completing this setup guide, you should have:

- ✅ Node.js 18+ and npm installed
- ✅ Project dependencies installed
- ✅ Environment variables configured
- ✅ Development server running
- ✅ Application accessible at `http://localhost:3000`
- ✅ Hot reload working
- ✅ Linting and formatting configured

You're now ready to start developing the Voice Intelligence Desktop App!

For next steps, see the [Task List](../.kiro/specs/tasklist.md) and continue with Phase 1.2: Configure Tauri Desktop Runtime.
