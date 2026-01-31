# Quick Reference Guide

Quick reference for common commands and workflows in the Voice Intelligence Desktop App.

## Essential Commands

### Development

```bash
# Start development server
npm run dev

# Start on different port
npm run dev -- -p 3001

# Build for production
npm run build

# Start production server
npm run start
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint -- --fix

# Format code with Prettier
npm run format

# Check formatting without changing files
npm run format -- --check
```

### Environment

```bash
# Validate environment configuration
npm run validate-env

# Create environment file from template
cp .env.example .env.local
```

### Dependencies

```bash
# Install all dependencies
npm install

# Install specific package
npm install <package-name>

# Install dev dependency
npm install --save-dev <package-name>

# Update dependencies
npm update

# Check for outdated packages
npm outdated

# Clean install (removes node_modules first)
rm -rf node_modules package-lock.json && npm install
```

### Cleanup

```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Full cleanup and reinstall
rm -rf node_modules package-lock.json .next
npm install
```

## WSL-Specific Commands

### Setup

```bash
# Run automated setup script
chmod +x scripts/wsl-setup.sh
./scripts/wsl-setup.sh

# Increase file watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Check WSL version
wsl --version

# Check WSL IP address
ip addr show eth0 | grep inet
```

### System

```bash
# Update WSL packages
sudo apt update && sudo apt upgrade -y

# Install build essentials
sudo apt install build-essential -y

# Install Git
sudo apt install git -y

# Check Node.js version
node --version

# Check npm version
npm --version
```

## Git Commands

### Basic Workflow

```bash
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push changes
git push

# Pull latest changes
git pull

# View commit history
git log --oneline
```

### Branch Management

```bash
# Create new branch
git checkout -b feature/branch-name

# Switch branches
git checkout branch-name

# List branches
git branch

# Delete branch
git branch -d branch-name
```

### Configuration

```bash
# Set user name
git config --global user.name "Your Name"

# Set email
git config --global user.email "your.email@example.com"

# View configuration
git config --list

# Configure line endings (WSL)
git config --global core.autocrlf input
```

## File Operations

### Viewing Files

```bash
# View file contents
cat filename

# View with line numbers
cat -n filename

# View first 10 lines
head filename

# View last 10 lines
tail filename

# View file with pagination
less filename
```

### Editing Files

```bash
# Edit with nano (beginner-friendly)
nano filename

# Edit with vim
vim filename

# Edit with VS Code
code filename

# Edit with VS Code from WSL
code .
```

### File Management

```bash
# List files
ls -la

# Create directory
mkdir directory-name

# Remove file
rm filename

# Remove directory
rm -rf directory-name

# Copy file
cp source destination

# Move/rename file
mv source destination

# Find files
find . -name "*.ts"
```

## Process Management

### Port Management

```bash
# Find process using port 3000
lsof -ti:3000

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# List all listening ports
netstat -tuln
```

### Process Control

```bash
# Run command in background
npm run dev &

# List background jobs
jobs

# Bring job to foreground
fg %1

# Kill background job
kill %1

# Stop current process
Ctrl+C
```

## Environment Variables

### Viewing

```bash
# View all environment variables
env

# View specific variable
echo $OPENAI_API_KEY

# Check if variable is set
[ -z "$OPENAI_API_KEY" ] && echo "Not set" || echo "Set"
```

### Setting (Temporary)

```bash
# Set for current session
export OPENAI_API_KEY=sk-your-key

# Set for single command
OPENAI_API_KEY=sk-your-key npm run dev
```

### Setting (Permanent)

```bash
# Edit .env.local
nano .env.local

# Add variable
OPENAI_API_KEY=sk-your-key

# Restart server to apply changes
```

## Troubleshooting Commands

### Diagnostics

```bash
# Check Node.js installation
which node
node --version

# Check npm installation
which npm
npm --version

# Check Git installation
which git
git --version

# Check disk space
df -h

# Check memory usage
free -h

# Check running processes
ps aux | grep node
```

### Network

```bash
# Test internet connectivity
ping google.com

# Check DNS resolution
nslookup google.com

# Test port connectivity
curl http://localhost:3000

# Check listening ports
netstat -tuln | grep 3000
```

### Logs

```bash
# View npm debug log
cat ~/.npm/_logs/*-debug.log

# View Next.js build log
cat .next/build.log

# Follow development server logs
npm run dev | tee dev.log
```

## VS Code Commands

### Opening

```bash
# Open current directory
code .

# Open specific file
code filename

# Open in new window
code -n .

# Open and wait
code --wait filename
```

### Extensions

```bash
# List installed extensions
code --list-extensions

# Install extension
code --install-extension extension-id

# Uninstall extension
code --uninstall-extension extension-id
```

## Useful Aliases

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash

# Development
alias ndev='npm run dev'
alias nbuild='npm run build'
alias nstart='npm run start'

# Code quality
alias nlint='npm run lint'
alias nformat='npm run format'

# Cleanup
alias nclean='rm -rf node_modules package-lock.json .next'
alias nfresh='nclean && npm install'

# Git
alias gs='git status'
alias ga='git add .'
alias gc='git commit -m'
alias gp='git push'
alias gl='git log --oneline'

# System
alias ll='ls -la'
alias ..='cd ..'
alias ...='cd ../..'
```

After adding aliases, reload your shell:
```bash
source ~/.bashrc
```

## Keyboard Shortcuts

### Terminal

- `Ctrl+C` - Stop current process
- `Ctrl+Z` - Suspend current process
- `Ctrl+D` - Exit terminal
- `Ctrl+L` - Clear screen
- `Ctrl+R` - Search command history
- `Ctrl+A` - Move to start of line
- `Ctrl+E` - Move to end of line
- `Ctrl+U` - Clear line before cursor
- `Ctrl+K` - Clear line after cursor

### VS Code

- `Ctrl+P` - Quick file open
- `Ctrl+Shift+P` - Command palette
- `Ctrl+B` - Toggle sidebar
- `Ctrl+J` - Toggle terminal
- `Ctrl+Shift+F` - Search in files
- `Ctrl+Shift+H` - Replace in files
- `Ctrl+/` - Toggle comment
- `Alt+Up/Down` - Move line up/down
- `Shift+Alt+Up/Down` - Copy line up/down

## Documentation Links

- [Complete Setup Guide](SETUP.md)
- [Environment Setup](ENVIRONMENT_SETUP.md)
- [WSL Development](WSL_DEVELOPMENT.md)
- [Task List](../.kiro/specs/tasklist.md)
- [Requirements](../.kiro/specs/requirements.md)
- [Design Document](../.kiro/specs/design.md)

## Getting Help

```bash
# Command help
npm help
git help
node --help

# Man pages (Linux/WSL)
man ls
man git

# Command info
which node
type npm
```

## Emergency Recovery

If everything breaks:

```bash
# 1. Stop all processes
Ctrl+C

# 2. Clean everything
rm -rf node_modules package-lock.json .next

# 3. Reinstall
npm install

# 4. Validate environment
npm run validate-env

# 5. Restart server
npm run dev
```

If that doesn't work:

```bash
# 1. Check Node.js version
node --version  # Should be 18+

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall Node.js if needed
nvm install 18
nvm use 18

# 4. Try again
npm install
npm run dev
```
