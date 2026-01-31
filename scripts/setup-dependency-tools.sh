#!/bin/bash

# Setup Dependency Management Tools
# This script installs additional tools needed for dependency management

set -e

echo "🔧 Setting up dependency management tools..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if cargo is installed
if ! command -v cargo &> /dev/null; then
    echo -e "${RED}❌ Cargo is not installed${NC}"
    echo "Please install Rust and Cargo from https://rustup.rs/"
    exit 1
fi

echo -e "${GREEN}✅ Cargo is installed${NC}"
echo ""

# Install cargo-audit
echo "📦 Installing cargo-audit..."
if cargo install cargo-audit; then
    echo -e "${GREEN}✅ cargo-audit installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install cargo-audit${NC}"
    exit 1
fi

echo ""

# Install cargo-outdated (optional but useful)
echo "📦 Installing cargo-outdated..."
if cargo install cargo-outdated; then
    echo -e "${GREEN}✅ cargo-outdated installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Failed to install cargo-outdated (optional)${NC}"
fi

echo ""

# Verify installations
echo "🔍 Verifying installations..."
echo ""

if cargo audit --version &> /dev/null; then
    echo -e "${GREEN}✅ cargo-audit: $(cargo audit --version)${NC}"
else
    echo -e "${RED}❌ cargo-audit verification failed${NC}"
fi

if cargo outdated --version &> /dev/null; then
    echo -e "${GREEN}✅ cargo-outdated: $(cargo outdated --version)${NC}"
else
    echo -e "${YELLOW}⚠️  cargo-outdated not available${NC}"
fi

echo ""
echo -e "${GREEN}✅ Dependency management tools setup complete!${NC}"
echo ""
echo "You can now use:"
echo "  - npm run deps:check    # Check for outdated npm packages"
echo "  - npm run deps:audit    # Run security audits"
echo "  - npm run deps:update   # Update dependencies"
echo ""
