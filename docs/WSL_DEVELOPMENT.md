# WSL Development Workflow

> **📖 New to the project?** See the [Complete Setup Guide](SETUP.md) for step-by-step instructions covering all platforms.

This guide covers the complete setup and workflow for developing the Voice Intelligence Desktop App in WSL (Windows Subsystem for Linux).

## Prerequisites

### WSL Setup

1. **Ensure WSL 2 is installed:**
   ```bash
   wsl --version
   ```
   
   If not installed, run in PowerShell (as Administrator):
   ```powershell
   wsl --install
   ```

2. **Verify your distribution:**
   ```bash
   lsb_release -a
   ```
   
   Recommended: Ubuntu 22.04 LTS or later

### Required Software

Install the following in your WSL environment:

1. **Node.js 18+ and npm:**
   ```bash
   # Using nvm (recommended)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   source ~/.bashrc
   nvm install 18
   nvm use 18
   
   # Verify installation
   node --version
   npm --version
   ```

2. **Git:**
   ```bash
   sudo apt update
   sudo apt install git -y
   git --version
   ```

3. **Build essentials:**
   ```bash
   sudo apt install build-essential -y
   ```
### Working with Windows Paths in WSL

- **Access Windows files:** `/mnt/c/` maps to `C:\`
- **Access WSL files from Windows:** `\\wsl$\Ubuntu\home\username\`
- **Performance tip:** Keep source files in WSL filesystem for better performance, but this project uses Windows filesystem for easier IDE access

## Development Workflow

### Initial Setup

1. **Run automated setup script (recommended):**
   ```bash
   chmod +x scripts/wsl-setup.sh
   ./scripts/wsl-setup.sh
   ```
   
   This script will:
   - Verify Node.js and npm installation
   - Install Git and build essentials if needed
   - Configure file watchers for better performance
   - Install npm dependencies
   - Create .env.local from template
   - Validate environment configuration

3. **Or manual setup:**
   
   a. Install dependencies:
   ```bash
   npm install
   ```

   b. Configure environment:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   nano .env.local
   ```

   c. Validate environment:
   ```bash
   npm run validate-env
   ```

### Daily Development

1. **Start development server:**
   ```bash
   npm run dev
   ```
   
   The server will be available at `http://localhost:3000`

2. **Access from Windows browser:**
   - Open `http://localhost:3000` in your Windows browser
   - WSL 2 automatically forwards ports to Windows

3. **Run linting:**
   ```bash
   npm run lint
   ```

4. **Format code:**
   ```bash
   npm run format
   ```

### File Editing

You have two options for editing files:

#### Option 1: VS Code with WSL Extension (Recommended)

1. **Install VS Code on Windows**
2. **Install "Remote - WSL" extension**
3. **Open project in WSL:**
   ```bash
   code .
   ```
   
   This opens VS Code on Windows connected to WSL

#### Option 2: Edit in Windows, Run in WSL

1. **Edit files using any Windows editor** (VS Code, Sublime, etc.)
2. **Run commands in WSL terminal**
3. **Note:** File watching may be slower due to cross-filesystem operations

## WSL-Specific Considerations

### WSL Configuration (.wslconfig)

For optimal performance, create a `.wslconfig` file in your Windows user directory:

**Location:** `C:\Users\<YourUsername>\.wslconfig`

**Example configuration:**
```ini
[wsl2]
memory=4GB
processors=2
localhostForwarding=true
swap=2GB
```

See `docs/.wslconfig.example` for a complete example.

**Apply changes:**
```powershell
# In PowerShell (Windows)
wsl --shutdown
# Then restart WSL
```

### File System Performance

- **Issue:** Cross-filesystem operations (Windows ↔ WSL) are slower
- **Current setup:** Project is on Windows filesystem (`/mnt/c/`)
- **Impact:** 
  - File watching may have slight delays
  - npm install may be slower
  - Hot reload may take 1-2 seconds longer

**Optimization options:**
1. Keep project on Windows filesystem for IDE compatibility (current approach)
2. Move to WSL filesystem (`~/projects/`) for better performance
3. Use VS Code Remote-WSL extension for best of both worlds

### Port Forwarding

WSL 2 automatically forwards ports to Windows:
- `localhost:3000` in WSL → accessible at `localhost:3000` in Windows
- No additional configuration needed

### Environment Variables

- `.env.local` works the same in WSL as native Linux
- Windows environment variables are NOT automatically available in WSL
- Use `.env.local` for all configuration

### Audio Device Access

**Important for future Tauri integration:**

- WSL does not have direct access to Windows audio devices
- Audio recording will work through the browser in development
- For Tauri desktop app, audio will be handled by Windows runtime
- Testing audio features requires running Tauri on Windows side

## Tauri Development in WSL

### Prerequisites for Tauri

When ready to add Tauri (Phase 1.2), you'll need:

1. **Rust in WSL:**
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source $HOME/.cargo/env
   rustc --version
   ```

2. **System dependencies:**
   ```bash
   sudo apt install libwebkit2gtk-4.0-dev \
     build-essential \
     curl \
     wget \
     file \
     libssl-dev \
     libgtk-3-dev \
     libayatana-appindicator3-dev \
     librsvg2-dev
   ```

3. **Tauri CLI:**
   ```bash
   npm install --save-dev @tauri-apps/cli
   ```

### Tauri Build Considerations

- **Development:** Run `npm run tauri dev` in WSL
- **Building:** Tauri builds Linux binaries in WSL
- **Windows builds:** Must be done on Windows side or use cross-compilation
- **Recommendation:** Use Windows for Tauri development to build Windows executables

## Common Issues and Solutions

### Issue: npm install is slow

**Solution:**
```bash
# Use npm cache
npm config set cache /tmp/npm-cache

# Or use pnpm for faster installs
npm install -g pnpm
pnpm install
```

### Issue: File watching not working

**Solution:**
```bash
# Increase inotify watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### Issue: Permission errors

**Solution:**
```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules
```

### Issue: Port already in use

**Solution:**
```bash
# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

### Issue: Cannot access localhost from Windows

**Solution:**
```bash
# Check WSL IP
ip addr show eth0

# Access using WSL IP instead
# http://<wsl-ip>:3000
```

## Git Workflow in WSL

### Configure Git

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Use Windows credential manager
git config --global credential.helper "/mnt/c/Program\ Files/Git/mingw64/bin/git-credential-manager-core.exe"
```

### Line Endings

```bash
# Configure line endings for cross-platform work
git config --global core.autocrlf input
```

## Performance Tips

1. **Use WSL 2** (not WSL 1) for better performance
2. **Keep node_modules in WSL** filesystem if possible
3. **Use VS Code Remote-WSL** for seamless editing
4. **Increase file watchers** for large projects
5. **Use npm ci** instead of npm install for faster installs
6. **Clear Next.js cache** if builds are slow: `rm -rf .next`

## Backup and Sync

Since the project is on Windows filesystem:

1. **Windows backup tools** will include the project
2. **Git** is your primary backup mechanism
3. **Consider:** Syncing to cloud storage (OneDrive, Dropbox)

## Testing Workflow

### Unit Tests (Future)

```bash
# Run tests in WSL
npm test

# Watch mode
npm test -- --watch
```

### Browser Testing

- **Chrome/Edge:** Access `localhost:3000` from Windows
- **Firefox:** Access `localhost:3000` from Windows
- **Mobile testing:** Use WSL IP address from mobile device on same network

## Deployment Considerations

### Building for Production

```bash
# Build Next.js app
npm run build

# Test production build
npm run start
```

### Tauri Desktop Build

When Tauri is configured:

```bash
# Build for Linux (in WSL)
npm run tauri build

# Build for Windows (must run on Windows)
# Switch to PowerShell/CMD and run:
# npm run tauri build
```

## Quick Reference

### Essential Commands

```bash

# Install dependencies
npm install

# Start dev server
npm run dev

# Run linting
npm run lint

# Format code
npm run format

# Validate environment
npm run validate-env

# Open in VS Code
code .
```

### Useful Aliases

Add to `~/.bashrc`:

```bash
# Quick commands
alias ndev='npm run dev'
alias nlint='npm run lint'
alias nformat='npm run format'
```

Then reload:
```bash
source ~/.bashrc
```

## Next Steps

1. ✅ WSL environment configured
2. ✅ Development server running
3. ⏭️ Configure Tauri for desktop functionality
4. ⏭️ Implement audio recording features
5. ⏭️ Add transcription service integration

## Additional Resources

- [WSL Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tauri Documentation](https://tauri.app/v1/guides/)
- [VS Code Remote-WSL](https://code.visualstudio.com/docs/remote/wsl)

