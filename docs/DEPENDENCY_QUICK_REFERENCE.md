# Dependency Management Quick Reference

Quick commands for managing dependencies in the Voice Intelligence Desktop App.

## Daily/Weekly Commands

```bash
# Check for security vulnerabilities
npm run deps:audit

# Check for outdated packages
npm run deps:check

# Fix security vulnerabilities automatically
npm run deps:fix
```

## Update Commands

```bash
# Update patch versions (safe - bug fixes only)
npm run deps:update

# Update minor versions (new features, backward compatible)
npm run deps:update:minor

# Check for major updates (breaking changes)
npm run deps:update:major
```

## Manual npm Commands

```bash
# Check outdated packages
npm outdated

# Update all to latest compatible versions
npm update

# Security audit
npm audit

# Fix vulnerabilities
npm audit fix

# Fix with breaking changes (use carefully!)
npm audit fix --force
```

## Cargo (Rust) Commands

```bash
# Install cargo-audit (one-time setup)
cargo install cargo-audit

# Run security audit
cd src-tauri
cargo audit

# Check for outdated crates
cargo outdated

# Update dependencies
cargo update
```

## Script Options

The `update-dependencies.js` script supports these options:

```bash
# Check for outdated dependencies
node scripts/update-dependencies.js --check

# Run security audit
node scripts/update-dependencies.js --audit

# Update patch versions
node scripts/update-dependencies.js --update-patch

# Update minor versions
node scripts/update-dependencies.js --update-minor

# Check major updates
node scripts/update-dependencies.js --update-major

# Fix vulnerabilities
node scripts/update-dependencies.js --fix

# Dry run (preview changes)
node scripts/update-dependencies.js --update-patch --dry-run
```

## Automated Updates

### Dependabot

- **Schedule**: Every Monday at 9:00 AM UTC
- **Configuration**: `.github/dependabot.yml`
- **What it does**:
  - Checks npm, Cargo, and GitHub Actions dependencies
  - Creates pull requests for updates
  - Groups minor/patch updates together
  - Separates major updates for review

### GitHub Actions

- **Workflow**: `.github/workflows/dependency-check.yml`
- **Triggers**: Weekly schedule, manual dispatch, PR changes
- **What it does**:
  - Runs npm audit
  - Runs cargo audit
  - Checks for outdated packages
  - Runs Trivy security scanner
  - Reviews dependencies in PRs

## Update Strategy

### Patch Updates (x.x.X)
- **Risk**: Low
- **Contains**: Bug fixes, security patches
- **Action**: Apply immediately
- **Command**: `npm run deps:update`

### Minor Updates (x.X.x)
- **Risk**: Medium
- **Contains**: New features, backward compatible
- **Action**: Review and test
- **Command**: `npm run deps:update:minor`

### Major Updates (X.x.x)
- **Risk**: High
- **Contains**: Breaking changes
- **Action**: Careful review, read changelog
- **Command**: `npm run deps:update:major` (shows list only)

## Testing After Updates

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

### Clear cache and reinstall
```bash
npm run clean:all
npm install
```

### Check for conflicts
```bash
npm ls
```

### Force resolution (use carefully)
```bash
npm install --legacy-peer-deps
```

### Revert changes
```bash
git checkout package.json package-lock.json
npm install
```

## Resources

- [Full Documentation](./DEPENDENCY_MANAGEMENT.md)
- [npm Documentation](https://docs.npmjs.com/)
- [Cargo Book](https://doc.rust-lang.org/cargo/)
- [Dependabot Docs](https://docs.github.com/en/code-security/dependabot)

## Common Workflows

### Weekly Maintenance
```bash
# 1. Check for updates
npm run deps:check

# 2. Run security audit
npm run deps:audit

# 3. Apply safe updates
npm run deps:update

# 4. Test
npm test && npm run build
```

### Security Fix
```bash
# 1. Check vulnerabilities
npm run deps:audit

# 2. Fix automatically
npm run deps:fix

# 3. Test
npm test

# 4. Commit
git add package.json package-lock.json
git commit -m "fix(deps): security vulnerabilities"
```

### Major Update Review
```bash
# 1. Check for major updates
npm run deps:update:major

# 2. Review changelogs for each package

# 3. Update one at a time
npm install <package>@latest

# 4. Test thoroughly
npm test && npm run tauri:dev

# 5. Commit
git add package.json package-lock.json
git commit -m "chore(deps): update <package> to vX.X.X"
```
