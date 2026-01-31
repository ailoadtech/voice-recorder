#!/bin/bash

# Dependency Management Setup Verification Script
# Verifies that all dependency management tools and configurations are properly set up

echo "🔍 Verifying Dependency Management Setup..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
passed=0
failed=0
warnings=0

# Check files
echo "📁 Checking files..."
files=(
    "scripts/update-dependencies.js"
    "scripts/setup-dependency-tools.sh"
    "scripts/setup-dependency-tools.ps1"
    ".github/dependabot.yml"
    ".github/workflows/dependency-check.yml"
    "docs/DEPENDENCY_MANAGEMENT.md"
    "docs/DEPENDENCY_QUICK_REFERENCE.md"
    "docs/DEPENDENCY_SETUP_VERIFICATION.md"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅${NC} $file"
        ((passed++))
    else
        echo -e "  ${RED}❌${NC} $file (missing)"
        ((failed++))
    fi
done

echo ""

# Check npm scripts
echo "📦 Checking npm scripts..."
scripts=(
    "deps:setup"
    "deps:setup:windows"
    "deps:check"
    "deps:audit"
    "deps:update"
    "deps:update:minor"
    "deps:update:major"
    "deps:fix"
)

for script in "${scripts[@]}"; do
    if npm run 2>/dev/null | grep -q "$script"; then
        echo -e "  ${GREEN}✅${NC} $script"
        ((passed++))
    else
        echo -e "  ${RED}❌${NC} $script (missing)"
        ((failed++))
    fi
done

echo ""

# Test commands
echo "🧪 Testing commands..."

if node scripts/update-dependencies.js --help > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} update-dependencies.js works"
    ((passed++))
else
    echo -e "  ${RED}❌${NC} update-dependencies.js failed"
    ((failed++))
fi

if npm run deps:check > /dev/null 2>&1; then
    echo -e "  ${GREEN}✅${NC} deps:check works"
    ((passed++))
else
    echo -e "  ${RED}❌${NC} deps:check failed"
    ((failed++))
fi

echo ""

# Check cargo tools
echo "🦀 Checking Cargo tools..."

if command -v cargo &> /dev/null; then
    echo -e "  ${GREEN}✅${NC} Cargo installed"
    ((passed++))
    
    if cargo audit --version &> /dev/null 2>&1; then
        echo -e "  ${GREEN}✅${NC} cargo-audit installed"
        ((passed++))
    else
        echo -e "  ${YELLOW}⚠️${NC}  cargo-audit not installed (optional)"
        echo "      Run: npm run deps:setup"
        ((warnings++))
    fi
    
    if cargo outdated --version &> /dev/null 2>&1; then
        echo -e "  ${GREEN}✅${NC} cargo-outdated installed"
        ((passed++))
    else
        echo -e "  ${YELLOW}⚠️${NC}  cargo-outdated not installed (optional)"
        echo "      Run: npm run deps:setup"
        ((warnings++))
    fi
else
    echo -e "  ${YELLOW}⚠️${NC}  Cargo not installed"
    ((warnings++))
fi

echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Verification Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed:${NC} $passed"
echo -e "${RED}❌ Failed:${NC} $failed"
echo -e "${YELLOW}⚠️  Warnings:${NC} $warnings"
echo ""

if [ $failed -eq 0 ]; then
    echo -e "${GREEN}✅ Dependency management setup is complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm run deps:audit"
    echo "  2. Run: npm run deps:check"
    echo "  3. Install Cargo tools (optional): npm run deps:setup"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Setup incomplete. Please fix the failed checks above.${NC}"
    echo ""
    exit 1
fi
