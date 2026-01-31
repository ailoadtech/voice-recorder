#!/bin/bash

# WSL Development Environment Setup Script
# This script helps set up the development environment in WSL

set -e

echo "🚀 Voice Intelligence App - WSL Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in WSL
if ! grep -qi microsoft /proc/version; then
    echo -e "${RED}❌ This script should be run in WSL${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Running in WSL${NC}"

# Check Node.js version
echo ""
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ using nvm:"
    echo "  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash"
    echo "  source ~/.bashrc"
    echo "  nvm install 18"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher (current: $(node -v))${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ npm $(npm -v)${NC}"

# Check Git
echo ""
echo "Checking Git..."
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}⚠ Git is not installed${NC}"
    echo "Installing Git..."
    sudo apt update
    sudo apt install git -y
fi

echo -e "${GREEN}✓ Git $(git --version | cut -d' ' -f3)${NC}"

# Check build essentials
echo ""
echo "Checking build essentials..."
if ! command -v gcc &> /dev/null; then
    echo -e "${YELLOW}⚠ Build essentials not installed${NC}"
    echo "Installing build essentials..."
    sudo apt update
    sudo apt install build-essential -y
fi

echo -e "${GREEN}✓ Build essentials installed${NC}"

# Increase file watchers
echo ""
echo "Configuring file watchers..."
CURRENT_WATCHERS=$(cat /proc/sys/fs/inotify/max_user_watches)
if [ "$CURRENT_WATCHERS" -lt 524288 ]; then
    echo "Increasing inotify watchers to 524288..."
    echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
    sudo sysctl -p
    echo -e "${GREEN}✓ File watchers increased${NC}"
else
    echo -e "${GREEN}✓ File watchers already configured${NC}"
fi

# Install dependencies
echo ""
echo "Installing npm dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ node_modules already exists, skipping install${NC}"
    echo "  Run 'npm install' manually if needed"
fi

# Check for .env.local
echo ""
echo "Checking environment configuration..."
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠ .env.local not found${NC}"
    if [ -f ".env.example" ]; then
        echo "Creating .env.local from .env.example..."
        cp .env.example .env.local
        echo -e "${GREEN}✓ .env.local created${NC}"
        echo -e "${YELLOW}⚠ Please edit .env.local and add your API keys${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
    fi
else
    echo -e "${GREEN}✓ .env.local exists${NC}"
fi

# Validate environment
if [ -f ".env.local" ]; then
    echo ""
    echo "Validating environment configuration..."
    if npm run validate-env; then
        echo -e "${GREEN}✓ Environment configuration is valid${NC}"
    else
        echo -e "${YELLOW}⚠ Environment validation failed${NC}"
        echo "  Please check your .env.local file"
    fi
fi

# Configure Git (optional)
echo ""
echo "Git configuration..."
GIT_NAME=$(git config --global user.name || echo "")
GIT_EMAIL=$(git config --global user.email || echo "")

if [ -z "$GIT_NAME" ] || [ -z "$GIT_EMAIL" ]; then
    echo -e "${YELLOW}⚠ Git user not configured${NC}"
    echo "  Run these commands to configure Git:"
    echo "    git config --global user.name \"Your Name\""
    echo "    git config --global user.email \"your.email@example.com\""
else
    echo -e "${GREEN}✓ Git configured as: $GIT_NAME <$GIT_EMAIL>${NC}"
fi

# Summary
echo ""
echo "======================================"
echo -e "${GREEN}✅ WSL Setup Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo "  1. Edit .env.local and add your API keys"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Open http://localhost:3000 in your Windows browser"
echo ""
echo "Useful commands:"
echo "  npm run dev          - Start development server"
echo "  npm run lint         - Run linting"
echo "  npm run format       - Format code"
echo "  npm run validate-env - Validate environment"
echo ""
echo "Documentation:"
echo "  docs/WSL_DEVELOPMENT.md - WSL-specific guide"
echo "  docs/ENVIRONMENT_SETUP.md - Environment configuration"
echo ""

