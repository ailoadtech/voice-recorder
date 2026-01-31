# Dependency Management Guide

This guide covers how to manage dependencies in the Voice Intelligence Desktop App.

## Table of Contents

- [Overview](#overview)
- [Automated Updates](#automated-updates)
- [Manual Updates](#manual-updates)
- [Security Audits](#security-audits)
- [Security Monitoring](#security-monitoring)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The project uses multiple dependency management systems:

- **npm** - JavaScript/TypeScript dependencies (Next.js, React, etc.)
- **Cargo** - Rust dependencies (Tauri backend)
- **GitHub Actions** - CI/CD workflow dependencies

## Automated Updates

### Dependabot

Dependabot is configured to automatically check for dependency updates weekly.

**Configuration:** `.github/dependabot.yml`

**Schedule:** Every Monday at 9:00 AM UTC

**What it does:**
- Checks for outdated npm packages
- Checks for outdated Cargo crates
- Checks for outdated GitHub Actions
- Creates pull requests for updates
- Groups minor and patch updates together
- Separates major updates for careful review

**Pull Request Labels:**
- `dependencies` - All dependency updates
- `npm` - npm package updates
- `rust` - Cargo crate updates
- `github-actions` - GitHub Actions updates

### GitHub Actions Workflow

**Workflow:** `.github/workflows/dependency-check.yml`

**Triggers:**
- Weekly schedule (Monday 10:00 AM UTC)
- Manual dispatch
- Pull requests that modify dependency files

**What it does:**
- Runs `npm audit` for security vulnerabilities
- Runs `cargo audit` for Rust vulnerabilities
- Checks for outdated packages
- Runs Trivy security scanner
- Reviews dependencies in pull requests
- Uploads audit results as artifacts

## Manual Updates

### Using the Update Script

We provide a convenient script for managing dependencies:

```bash
# Check for outdated packages
node scripts/update-dependencies.js --check

# Run security audit
node scripts/update-dependencies.js --audit

# Update patch versions (safe)
node scripts/update-dependencies.js --update-patch

# Update minor versions
node scripts/update-dependencies.js --update-minor

# Check for major updates
node scripts/update-dependencies.js --update-major

# Fix security vulnerabilities
node scripts/update-dependencies.js --fix

# Dry run (see what would change)
node scripts/update-dependencies.js --update-patch --dry-run
```

### Using npm Commands

```bash
# Check for outdated packages
npm outdated

# Update all packages to latest compatible versions
npm update

# Update a specific package
npm update <package-name>

# Install latest version (may include breaking changes)
npm install <package-name>@latest

# Security audit
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Fix vulnerabilities (including breaking changes)
npm audit fix --force
```

### Using Cargo Commands

```bash
# Check for outdated crates
cd src-tauri
cargo outdated

# Update dependencies
cargo update

# Security audit (requires cargo-audit)
cargo install cargo-audit
cargo audit

# Fix vulnerabilities
cargo audit fix
```

## Security Audits

### npm Audit

Run security audits regularly:

```bash
# Check for vulnerabilities
npm audit

# Check with specific severity level
npm audit --audit-level=moderate

# Get JSON output
npm audit --json

# Fix automatically
npm audit fix

# Fix with breaking changes (use carefully!)
npm audit fix --force
```

### Cargo Audit

For Rust dependencies:

```bash
# Install cargo-audit
cargo install cargo-audit

# Run audit
cd src-tauri
cargo audit

# Get detailed report
cargo audit --json
```

### Trivy Scanner

Trivy scans for vulnerabilities in dependencies and container images:

```bash
# Install Trivy
# See: https://aquasecurity.github.io/trivy/latest/getting-started/installation/

# Scan filesystem
trivy fs .

# Scan with specific severity
trivy fs --severity HIGH,CRITICAL .

# Generate report
trivy fs --format json --output trivy-report.json .
```

## Security Monitoring

For comprehensive security vulnerability monitoring, see the [Security Monitoring Guide](./SECURITY_MONITORING.md).

### Quick Security Commands

```bash
# Run comprehensive security scan
npm run security:scan

# Run security audit
npm run security:audit

# Fix vulnerabilities automatically
npm run security:fix

# Generate security report
npm run security:report

# CI mode (fails on critical/high vulnerabilities)
npm run security:ci
```

### Automated Security Monitoring

The project includes automated security monitoring via GitHub Actions:

- **Daily Security Scans** - Runs at 2:00 AM UTC
- **Continuous Monitoring** - On every push and PR
- **Multiple Scanners** - npm audit, cargo audit, Trivy, CodeQL
- **Security Reports** - Automatically generated and uploaded

See [Security Monitoring Guide](./SECURITY_MONITORING.md) for details.

## Best Practices

### Update Strategy

1. **Patch Updates (x.x.X)** - Apply immediately
   - Bug fixes and security patches
   - No breaking changes
   - Low risk

2. **Minor Updates (x.X.x)** - Review and test
   - New features
   - Backward compatible
   - Medium risk

3. **Major Updates (X.x.x)** - Careful review required
   - Breaking changes
   - Review changelog and migration guide
   - High risk
   - Test thoroughly

### Update Workflow

1. **Check for updates**
   ```bash
   node scripts/update-dependencies.js --check
   ```

2. **Review changes**
   - Check changelogs
   - Look for breaking changes
   - Review security advisories

3. **Update in stages**
   ```bash
   # Start with patches
   node scripts/update-dependencies.js --update-patch
   
   # Test
   npm test
   npm run build
   
   # Then minors
   node scripts/update-dependencies.js --update-minor
   
   # Test again
   npm test
   npm run build
   ```

4. **Test thoroughly**
   - Run all tests
   - Test in development
   - Test production build
   - Test desktop app functionality

5. **Commit and deploy**
   ```bash
   git add package.json package-lock.json
   git commit -m "chore(deps): update dependencies"
   ```

### Security Best Practices

1. **Regular Audits**
   - Run `npm audit` weekly
   - Monitor Dependabot PRs
   - Review security advisories

2. **Immediate Action on Critical Issues**
   - Apply security patches immediately
   - Test and deploy quickly
   - Document the fix

3. **Keep Dependencies Minimal**
   - Only add necessary dependencies
   - Remove unused packages
   - Prefer well-maintained packages

4. **Pin Critical Dependencies**
   - Use exact versions for critical packages
   - Document why versions are pinned
   - Review pinned versions regularly

### Testing After Updates

Always test after updating dependencies:

```bash
# Run tests
npm test

# Check for type errors
npm run build

# Test desktop app
npm run tauri:dev

# Test production build
npm run tauri:build:debug
```

## Troubleshooting

### Dependency Conflicts

If you encounter dependency conflicts:

```bash
# Clear cache and reinstall
npm run clean:all
npm install

# Check for peer dependency issues
npm ls

# Force resolution (use carefully)
npm install --legacy-peer-deps
```

### Audit Fix Issues

If `npm audit fix` doesn't work:

```bash
# Try force fix (may include breaking changes)
npm audit fix --force

# Manual update
npm install <package>@latest

# Check if issue is in transitive dependency
npm ls <vulnerable-package>
```

### Build Failures After Update

If builds fail after updating:

1. Check the changelog for breaking changes
2. Review error messages carefully
3. Revert the update if needed:
   ```bash
   git checkout package.json package-lock.json
   npm install
   ```
4. Update one package at a time to isolate the issue

### Cargo Update Issues

If Cargo updates cause issues:

```bash
# Revert Cargo.lock
cd src-tauri
git checkout Cargo.lock
cargo build

# Update one crate at a time
cargo update -p <crate-name>
```

## Monitoring

### GitHub Security Alerts

- Enable Dependabot security alerts in repository settings
- Review alerts promptly
- Apply security patches quickly

### Dependency Review

- Review Dependabot PRs weekly
- Check CI/CD results
- Monitor audit reports in GitHub Actions artifacts

### Version Tracking

Keep track of major version updates:

```bash
# Check current versions
npm list --depth=0
cd src-tauri && cargo tree --depth=1
```

## Resources

- [npm Documentation](https://docs.npmjs.com/)
- [Cargo Book](https://doc.rust-lang.org/cargo/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [npm Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Cargo Audit](https://github.com/rustsec/rustsec/tree/main/cargo-audit)
- [Trivy](https://aquasecurity.github.io/trivy/)

## Quick Reference

```bash
# Daily/Weekly Tasks
npm audit                                    # Check security
node scripts/update-dependencies.js --check  # Check updates

# Monthly Tasks
node scripts/update-dependencies.js --update-patch  # Apply patches
npm test && npm run build                           # Test

# Quarterly Tasks
node scripts/update-dependencies.js --update-minor  # Apply minor updates
node scripts/update-dependencies.js --update-major  # Review major updates
npm test && npm run tauri:build:debug              # Full test

# Emergency Security Fix
npm audit fix                    # Fix vulnerabilities
npm test                         # Test
git commit -m "fix: security"    # Commit
```

## Support

For issues with dependency updates:

1. Check this documentation
2. Review error messages and logs
3. Check package changelogs
4. Search for similar issues on GitHub
5. Ask in project discussions
