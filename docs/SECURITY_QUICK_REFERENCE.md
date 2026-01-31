# Security Monitoring Quick Reference

Quick reference for security vulnerability monitoring commands and workflows.

## Daily Commands

```bash
# Quick security check
npm run security:scan

# Check for security alerts
# Visit: https://github.com/YOUR_ORG/YOUR_REPO/security
```

## Weekly Commands

```bash
# Full security audit
npm run security:audit

# Generate detailed report
npm run security:report

# Check for outdated packages
npm run deps:check
```

## Monthly Commands

```bash
# Fix vulnerabilities
npm run security:fix

# Update dependencies
npm run deps:update

# Verify all is secure
npm run security:scan
npm test
```

## Emergency Response

```bash
# Check critical vulnerabilities
npm run security:ci

# Force fix (use with caution!)
npm audit fix --force

# Manual package update
npm install package-name@latest
```

## Security Scan Options

```bash
# Basic scan
npm run security:scan

# Audit only (no report)
npm run security:audit

# Fix automatically
npm run security:fix

# Generate JSON report
npm run security:report

# CI mode (exit on critical/high)
npm run security:ci
```

## Advanced Usage

```bash
# Custom severity level
node scripts/security-monitor.js --scan --severity=high

# Scan and fix
node scripts/security-monitor.js --audit --fix

# CI mode with custom severity
node scripts/security-monitor.js --scan --ci --severity=critical
```

## npm Audit Commands

```bash
# Basic audit
npm audit

# Specific severity
npm audit --audit-level=moderate

# JSON output
npm audit --json

# Fix vulnerabilities
npm audit fix

# Force fix (breaking changes)
npm audit fix --force
```

## Cargo Audit Commands

```bash
# Install cargo-audit
cargo install cargo-audit

# Run audit
cd src-tauri && cargo audit

# JSON output
cd src-tauri && cargo audit --json

# Attempt fix
cd src-tauri && cargo audit fix
```

## Trivy Scanner

```bash
# Scan filesystem
trivy fs .

# High/Critical only
trivy fs --severity HIGH,CRITICAL .

# JSON report
trivy fs --format json --output trivy-report.json .
```

## Viewing Reports

```bash
# View security report
cat security-report.json | jq .

# View summary
cat security-report.json | jq .summary

# Count by severity
cat security-report.json | jq '.summary'

# List npm vulnerabilities
cat security-report.json | jq '.details.npm'

# Find critical issues
cat security-report.json | jq '.details.npm[] | select(.[1].severity == "critical")'
```

## GitHub Actions

### Workflows

- **Security Monitoring**: Runs daily at 2:00 AM UTC
- **Dependency Check**: Runs weekly on Mondays at 10:00 AM UTC

### Manual Trigger

1. Go to Actions tab
2. Select "Security Monitoring" workflow
3. Click "Run workflow"

### View Results

1. Go to Actions tab
2. Select latest workflow run
3. Download artifacts:
   - security-report
   - npm-audit-report
   - cargo-audit-report
   - trivy-report

## Severity Response Times

| Severity | Response Time | Action |
|----------|--------------|--------|
| Critical | Immediate (1 hour) | Emergency fix |
| High | 24 hours | Priority fix |
| Moderate | 1 week | Scheduled fix |
| Low | Next cycle | Maintenance fix |

## Vulnerability Response Workflow

```bash
# 1. Assess
npm run security:report
cat security-report.json | jq .summary

# 2. Attempt fix
npm run security:fix

# 3. Test
npm test
npm run build
npm run tauri:dev

# 4. Verify
npm run security:scan

# 5. Deploy
git add .
git commit -m "fix: security vulnerabilities"
git push
```

## Common Issues

### False Positives

```bash
# Document and suppress
# Add to .npmrc or audit-resolve.json
```

### Unfixable Vulnerabilities

```bash
# Check alternative packages
npm search alternative-package

# Update manually
npm install package@latest

# Document risk
echo "Known issue: ..." >> SECURITY.md
```

### Build Failures After Fix

```bash
# Revert
git checkout package.json package-lock.json
npm install

# Update one at a time
npm install package1@latest
npm test
npm install package2@latest
npm test
```

## Integration

### Pre-commit Hook

```bash
# .husky/pre-commit
npm run security:audit
```

### CI/CD Pipeline

```yaml
- name: Security Check
  run: npm run security:ci
```

### Deployment Gate

```yaml
- name: Security Gate
  run: |
    npm run security:scan
    if [ $? -ne 0 ]; then
      echo "Security vulnerabilities found!"
      exit 1
    fi
```

## Monitoring Checklist

- [ ] GitHub Security alerts enabled
- [ ] Dependabot active
- [ ] Security workflows running
- [ ] Daily scans reviewed
- [ ] Weekly audits performed
- [ ] Monthly updates applied
- [ ] Critical issues addressed immediately

## Resources

- [Security Monitoring Guide](./SECURITY_MONITORING.md)
- [Dependency Management Guide](./DEPENDENCY_MANAGEMENT.md)
- [GitHub Security Tab](https://github.com/YOUR_ORG/YOUR_REPO/security)

## Support

For security issues:
1. Check security-report.json
2. Review GitHub Security tab
3. Consult documentation
4. Report privately via GitHub Security Advisories

---

**Quick Help:** `node scripts/security-monitor.js --help`
