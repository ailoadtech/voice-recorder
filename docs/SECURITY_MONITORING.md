# Security Monitoring Guide

This guide covers security vulnerability monitoring and management for the Voice Intelligence Desktop App.

## Table of Contents

- [Overview](#overview)
- [Automated Monitoring](#automated-monitoring)
- [Manual Security Checks](#manual-security-checks)
- [Security Tools](#security-tools)
- [Vulnerability Response](#vulnerability-response)
- [Best Practices](#best-practices)
- [Security Reports](#security-reports)

## Overview

Security monitoring is a critical part of maintaining the application. We use multiple layers of security scanning to detect and address vulnerabilities:

- **Dependency Auditing** - npm and Cargo security audits
- **Vulnerability Scanning** - Trivy and CodeQL analysis
- **Automated Monitoring** - GitHub Actions workflows
- **Manual Reviews** - Regular security assessments

## Automated Monitoring

### GitHub Actions Workflows

#### Security Monitoring Workflow

**File:** `.github/workflows/security-monitoring.yml`

**Triggers:**
- Daily at 2:00 AM UTC
- On push to main/develop branches
- On pull requests
- Manual dispatch

**What it does:**
- Runs comprehensive security scans
- Performs npm and cargo audits
- Executes Trivy vulnerability scanner
- Runs CodeQL security analysis
- Generates security reports
- Uploads results as artifacts

#### Dependency Check Workflow

**File:** `.github/workflows/dependency-check.yml`

**Triggers:**
- Weekly on Mondays at 10:00 AM UTC
- On dependency file changes
- Manual dispatch

**What it does:**
- Audits npm and cargo dependencies
- Checks for outdated packages
- Reviews dependency changes in PRs
- Uploads audit results

### Dependabot Security Updates

**File:** `.github/dependabot.yml`

Dependabot automatically:
- Monitors for security vulnerabilities
- Creates PRs for security updates
- Groups related updates
- Labels PRs appropriately

## Manual Security Checks

### Quick Security Scan

Run a comprehensive security scan:

```bash
npm run security:scan
```

This will:
- Audit npm dependencies
- Audit cargo dependencies
- Check for outdated packages
- Generate a security report

### Security Audit Only

Run security audits without generating a report:

```bash
npm run security:audit
```

### Fix Vulnerabilities

Attempt to automatically fix vulnerabilities:

```bash
npm run security:fix
```

### Generate Security Report

Generate a detailed JSON security report:

```bash
npm run security:report
```

The report will be saved to `security-report.json` and includes:
- Total vulnerability count
- Breakdown by severity (critical, high, moderate, low)
- Detailed information about each vulnerability
- Affected packages and versions
- Available fixes

### CI Mode

Run security checks in CI mode (fails on critical/high vulnerabilities):

```bash
npm run security:ci
```

## Security Tools

### 1. npm audit

Built-in npm security auditing:

```bash
# Basic audit
npm audit

# Audit with specific severity level
npm audit --audit-level=moderate

# Get JSON output
npm audit --json

# Fix vulnerabilities
npm audit fix

# Force fix (may include breaking changes)
npm audit fix --force
```

### 2. cargo-audit

Rust dependency security auditing:

```bash
# Install cargo-audit
cargo install cargo-audit

# Run audit
cd src-tauri
cargo audit

# Get JSON output
cargo audit --json

# Attempt to fix
cargo audit fix
```

### 3. Trivy

Comprehensive vulnerability scanner:

```bash
# Install Trivy
# See: https://aquasecurity.github.io/trivy/latest/getting-started/installation/

# Scan filesystem
trivy fs .

# Scan with specific severity
trivy fs --severity HIGH,CRITICAL .

# Generate JSON report
trivy fs --format json --output trivy-report.json .

# Scan specific directory
trivy fs --scanners vuln,config,secret ./src
```

### 4. CodeQL

GitHub's semantic code analysis:

- Automatically runs on push/PR via GitHub Actions
- Detects security vulnerabilities in code
- Provides detailed analysis in GitHub Security tab
- No manual setup required

### 5. Security Monitor Script

Our custom security monitoring script:

```bash
# Full scan with report
node scripts/security-monitor.js --scan --report

# Audit only
node scripts/security-monitor.js --audit

# Attempt fixes
node scripts/security-monitor.js --audit --fix

# CI mode with custom severity
node scripts/security-monitor.js --scan --ci --severity=high

# Available options:
#   --scan           Run full security scan
#   --audit          Run dependency audits
#   --report         Generate security report
#   --fix            Attempt to fix vulnerabilities
#   --ci             CI mode (exit with error on critical/high)
#   --severity=LEVEL Minimum severity level
```

## Vulnerability Response

### Response Workflow

When a vulnerability is detected:

1. **Assess Severity**
   - Critical/High: Immediate action required
   - Moderate: Address within 1 week
   - Low: Address in next maintenance cycle

2. **Review Details**
   ```bash
   npm run security:report
   ```
   - Check the generated `security-report.json`
   - Review affected packages
   - Check if fix is available

3. **Attempt Automatic Fix**
   ```bash
   npm run security:fix
   ```

4. **Manual Fix (if needed)**
   ```bash
   # Update specific package
   npm install package-name@latest
   
   # Or for Rust
   cd src-tauri
   cargo update -p crate-name
   ```

5. **Test Thoroughly**
   ```bash
   npm test
   npm run build
   npm run tauri:dev
   ```

6. **Verify Fix**
   ```bash
   npm run security:scan
   ```

7. **Document and Deploy**
   - Document the vulnerability and fix
   - Create PR with security fix
   - Deploy as soon as possible

### Critical Vulnerability Response

For critical vulnerabilities:

1. **Immediate Assessment** (within 1 hour)
   - Determine if vulnerability affects production
   - Assess potential impact

2. **Emergency Fix** (within 4 hours)
   - Apply fix or workaround
   - Test critical functionality
   - Deploy emergency patch

3. **Communication**
   - Notify team immediately
   - Document incident
   - Update security log

4. **Post-Incident Review**
   - Analyze root cause
   - Improve detection
   - Update procedures

## Best Practices

### Regular Monitoring

1. **Daily**
   - Review GitHub Security alerts
   - Check automated workflow results

2. **Weekly**
   - Run manual security scan
   - Review Dependabot PRs
   - Check for outdated packages

3. **Monthly**
   - Comprehensive security review
   - Update all dependencies
   - Review security policies

### Proactive Security

1. **Keep Dependencies Updated**
   ```bash
   # Check for updates weekly
   npm run deps:check
   
   # Apply patch updates
   npm run deps:update
   ```

2. **Monitor Security Advisories**
   - Enable GitHub Security alerts
   - Subscribe to security mailing lists
   - Follow security researchers

3. **Use Security Headers**
   - Implement CSP (Content Security Policy)
   - Use HTTPS everywhere
   - Enable security headers in Tauri config

4. **Code Review**
   - Review all dependency updates
   - Check for suspicious code
   - Verify package authenticity

5. **Principle of Least Privilege**
   - Minimize dependencies
   - Use minimal permissions
   - Audit third-party code

### Security Checklist

- [ ] GitHub Security alerts enabled
- [ ] Dependabot configured and active
- [ ] Security workflows running successfully
- [ ] Regular security scans performed
- [ ] Security reports reviewed
- [ ] Critical vulnerabilities addressed immediately
- [ ] Dependencies updated regularly
- [ ] Security documentation up to date

## Security Reports

### Report Structure

The security report (`security-report.json`) contains:

```json
{
  "timestamp": "2024-01-30T12:00:00.000Z",
  "summary": {
    "total": 5,
    "critical": 0,
    "high": 1,
    "moderate": 3,
    "low": 1
  },
  "npm": 3,
  "cargo": 2,
  "details": {
    "npm": [...],
    "cargo": [...]
  }
}
```

### Accessing Reports

#### GitHub Actions Artifacts

1. Go to Actions tab in GitHub
2. Select "Security Monitoring" workflow
3. Click on latest run
4. Download artifacts:
   - `security-report` - Overall security report
   - `npm-audit-report` - npm audit results
   - `cargo-audit-report` - Cargo audit results
   - `trivy-report` - Trivy scan results

#### Local Reports

Generate reports locally:

```bash
# Generate security report
npm run security:report

# View report
cat security-report.json | jq .

# View summary
cat security-report.json | jq .summary
```

### Report Analysis

Analyze security reports:

```bash
# Count vulnerabilities by severity
cat security-report.json | jq '.summary'

# List all npm vulnerabilities
cat security-report.json | jq '.details.npm'

# Find critical vulnerabilities
cat security-report.json | jq '.details.npm[] | select(.[1].severity == "critical")'

# Get package names with vulnerabilities
cat security-report.json | jq '.details.npm[] | .[0]'
```

## Integration with CI/CD

### Pre-commit Checks

Add security checks to pre-commit hooks:

```bash
# .husky/pre-commit
npm run security:audit
```

### Pull Request Checks

Security checks run automatically on PRs:
- Dependency review
- Security scan
- Vulnerability detection

### Deployment Gates

Prevent deployment with critical vulnerabilities:

```yaml
# In CI/CD pipeline
- name: Security Gate
  run: npm run security:ci
```

## Troubleshooting

### False Positives

If a vulnerability is a false positive:

1. Verify it doesn't affect your usage
2. Document why it's not applicable
3. Consider using `.npmrc` or `audit-resolve.json` to suppress

### Unfixable Vulnerabilities

If a vulnerability can't be fixed:

1. Check if it affects your code path
2. Look for alternative packages
3. Implement workarounds
4. Document the risk
5. Monitor for updates

### Performance Issues

If security scans are slow:

1. Use `--audit-level` to filter severity
2. Run scans in parallel
3. Cache dependencies in CI
4. Use incremental scanning

## Resources

- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [Cargo Security Advisory Database](https://rustsec.org/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [Trivy Documentation](https://aquasecurity.github.io/trivy/)
- [CodeQL Documentation](https://codeql.github.com/docs/)

## Quick Reference

```bash
# Daily Tasks
npm run security:scan              # Quick security scan

# Weekly Tasks
npm run security:report            # Generate detailed report
npm run deps:check                 # Check for updates

# Monthly Tasks
npm run security:fix               # Fix vulnerabilities
npm run deps:update                # Update dependencies

# Emergency Response
npm run security:ci                # Check critical issues
npm audit fix --force              # Force fix vulnerabilities
```

## Support

For security concerns:

1. Check this documentation
2. Review security reports
3. Check GitHub Security tab
4. Consult security advisories
5. Contact security team

**For security vulnerabilities, please report privately through GitHub Security Advisories.**
