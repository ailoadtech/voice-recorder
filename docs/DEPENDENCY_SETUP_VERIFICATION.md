# Dependency Management Setup Verification

This document helps verify that the dependency management system is properly configured and working.

## Quick Verification

Run these commands to verify the setup:

```bash
# 1. Check if scripts are available
npm run deps:check --help

# 2. Verify npm scripts are configured
npm run | grep deps:

# 3. Check for outdated packages
npm run deps:check

# 4. Run security audit
npm run deps:audit
```

## Complete Setup Checklist

### ✅ Core Files

- [ ] `scripts/update-dependencies.js` exists
- [ ] `scripts/setup-dependency-tools.sh` exists
- [ ] `scripts/setup-dependency-tools.ps1` exists
- [ ] `.github/dependabot.yml` exists
- [ ] `.github/workflows/dependency-check.yml` exists

### ✅ Documentation

- [ ] `docs/DEPENDENCY_MANAGEMENT.md` exists
- [ ] `docs/DEPENDENCY_QUICK_REFERENCE.md` exists
- [ ] `scripts/README.md` includes dependency management section

### ✅ npm Scripts

Verify these scripts are in `package.json`:

- [ ] `deps:setup` - Setup dependency tools (Linux/macOS)
- [ ] `deps:setup:windows` - Setup dependency tools (Windows)
- [ ] `deps:check` - Check for outdated dependencies
- [ ] `deps:audit` - Run security audit
- [ ] `deps:update` - Update patch versions
- [ ] `deps:update:minor` - Update minor versions
- [ ] `deps:update:major` - Check major updates
- [ ] `deps:fix` - Fix security vulnerabilities

### ✅ Cargo Tools (Optional)

For Rust dependency management:

```bash
# Install cargo-audit
cargo install cargo-audit

# Install cargo-outdated
cargo install cargo-outdated

# Or use setup script
npm run deps:setup  # Linux/macOS
npm run deps:setup:windows  # Windows
```

Verify installation:

```bash
cargo audit --version
cargo outdated --version
```

## Testing the System

### Test 1: Check for Outdated Packages

```bash
npm run deps:check
```

**Expected Output:**
- List of outdated packages with current, wanted, and latest versions
- Color-coded by update type (patch/minor/major)
- No errors

### Test 2: Security Audit

```bash
npm run deps:audit
```

**Expected Output:**
- npm audit results
- cargo audit results (if cargo-audit is installed)
- List of vulnerabilities (if any)
- Suggestions for fixes

### Test 3: Dry Run Update

```bash
node scripts/update-dependencies.js --update-patch --dry-run
```

**Expected Output:**
- Preview of what would be updated
- No actual changes made
- No errors

### Test 4: Help Command

```bash
node scripts/update-dependencies.js --help
```

**Expected Output:**
- Usage instructions
- List of available options
- Examples

### Test 5: Dependabot Configuration

```bash
# Verify Dependabot config is valid
cat .github/dependabot.yml
```

**Expected Content:**
- npm package ecosystem configured
- cargo package ecosystem configured
- github-actions ecosystem configured
- Weekly schedule
- Proper grouping rules

### Test 6: GitHub Actions Workflow

```bash
# Verify workflow exists
cat .github/workflows/dependency-check.yml
```

**Expected Content:**
- audit-npm job
- audit-cargo job
- security-scan job
- dependency-review job
- Proper triggers (schedule, workflow_dispatch, pull_request)

## Common Issues and Solutions

### Issue: "cargo audit not found"

**Solution:**
```bash
# Install cargo-audit
cargo install cargo-audit

# Or use setup script
npm run deps:setup
```

### Issue: "Permission denied" on Linux/macOS

**Solution:**
```bash
# Make scripts executable
chmod +x scripts/setup-dependency-tools.sh
chmod +x scripts/update-dependencies.js
```

### Issue: npm scripts not found

**Solution:**
```bash
# Reinstall dependencies
npm install

# Verify package.json has the scripts
npm run | grep deps:
```

### Issue: Dependabot not creating PRs

**Solution:**
1. Check repository settings → Security → Dependabot
2. Enable "Dependabot version updates"
3. Verify `.github/dependabot.yml` is in the main branch
4. Check Dependabot logs in GitHub

### Issue: GitHub Actions workflow not running

**Solution:**
1. Check Actions tab in GitHub repository
2. Verify workflow file is in `.github/workflows/`
3. Check if Actions are enabled in repository settings
4. Manually trigger with workflow_dispatch

## Verification Script

Create a simple verification script:

```bash
#!/bin/bash

echo "🔍 Verifying Dependency Management Setup..."
echo ""

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
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (missing)"
    fi
done

echo ""

# Check npm scripts
echo "📦 Checking npm scripts..."
scripts=(
    "deps:check"
    "deps:audit"
    "deps:update"
    "deps:update:minor"
    "deps:update:major"
    "deps:fix"
)

for script in "${scripts[@]}"; do
    if npm run | grep -q "$script"; then
        echo "  ✅ $script"
    else
        echo "  ❌ $script (missing)"
    fi
done

echo ""

# Test commands
echo "🧪 Testing commands..."

if node scripts/update-dependencies.js --help > /dev/null 2>&1; then
    echo "  ✅ update-dependencies.js works"
else
    echo "  ❌ update-dependencies.js failed"
fi

if npm run deps:check > /dev/null 2>&1; then
    echo "  ✅ deps:check works"
else
    echo "  ❌ deps:check failed"
fi

echo ""

# Check cargo tools
echo "🦀 Checking Cargo tools..."

if command -v cargo &> /dev/null; then
    echo "  ✅ Cargo installed"
    
    if cargo audit --version &> /dev/null; then
        echo "  ✅ cargo-audit installed"
    else
        echo "  ⚠️  cargo-audit not installed (optional)"
    fi
    
    if cargo outdated --version &> /dev/null; then
        echo "  ✅ cargo-outdated installed"
    else
        echo "  ⚠️  cargo-outdated not installed (optional)"
    fi
else
    echo "  ⚠️  Cargo not installed"
fi

echo ""
echo "✅ Verification complete!"
```

Save as `scripts/verify-dependency-setup.sh` and run:

```bash
chmod +x scripts/verify-dependency-setup.sh
./scripts/verify-dependency-setup.sh
```

## Next Steps

After verification:

1. **Run initial audit:**
   ```bash
   npm run deps:audit
   ```

2. **Check for updates:**
   ```bash
   npm run deps:check
   ```

3. **Apply safe updates:**
   ```bash
   npm run deps:update
   npm test
   ```

4. **Set up Cargo tools (if needed):**
   ```bash
   npm run deps:setup
   ```

5. **Enable Dependabot in GitHub:**
   - Go to repository Settings → Security → Dependabot
   - Enable "Dependabot version updates"

6. **Monitor GitHub Actions:**
   - Check Actions tab for workflow runs
   - Review any failures or warnings

## Maintenance Schedule

### Daily
- Monitor Dependabot PRs
- Review security alerts

### Weekly
- Run `npm run deps:audit`
- Check for critical updates
- Review and merge Dependabot PRs

### Monthly
- Run `npm run deps:check`
- Apply patch updates: `npm run deps:update`
- Test thoroughly: `npm test && npm run build`

### Quarterly
- Review major updates: `npm run deps:update:major`
- Plan breaking change migrations
- Update documentation

## Resources

- [Dependency Management Guide](./DEPENDENCY_MANAGEMENT.md)
- [Dependency Quick Reference](./DEPENDENCY_QUICK_REFERENCE.md)
- [npm Documentation](https://docs.npmjs.com/)
- [Cargo Book](https://doc.rust-lang.org/cargo/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)

## Support

If you encounter issues:

1. Check this verification guide
2. Review error messages
3. Check [DEPENDENCY_MANAGEMENT.md](./DEPENDENCY_MANAGEMENT.md) troubleshooting section
4. Search for similar issues on GitHub
5. Ask in project discussions

---

**Last Updated:** 2026-01-30
