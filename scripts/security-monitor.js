#!/usr/bin/env node

/**
 * Security Vulnerability Monitoring Script
 * 
 * This script provides comprehensive security monitoring for the project,
 * including vulnerability scanning, dependency auditing, and security reporting.
 * 
 * Usage:
 *   node scripts/security-monitor.js [options]
 * 
 * Options:
 *   --scan           Run full security scan
 *   --audit          Run dependency audits (npm + cargo)
 *   --report         Generate security report
 *   --check-cve      Check for known CVEs
 *   --fix            Attempt to fix vulnerabilities
 *   --ci             CI mode (exit with error on vulnerabilities)
 *   --severity       Minimum severity level (low, moderate, high, critical)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message, 
      output: error.stdout || '',
      code: error.status 
    };
  }
}

class SecurityMonitor {
  constructor(options = {}) {
    this.ciMode = options.ci || false;
    this.minSeverity = options.severity || 'moderate';
    this.vulnerabilities = {
      npm: [],
      cargo: [],
      total: 0,
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
    };
  }

  async runNpmAudit() {
    log('\n🔒 Running npm security audit...', 'cyan');
    
    const result = execCommand(`npm audit --json --audit-level=${this.minSeverity}`, { 
      silent: true 
    });
    
    if (result.output) {
      try {
        const audit = JSON.parse(result.output);
        
        if (audit.vulnerabilities) {
          const vulns = Object.entries(audit.vulnerabilities);
          this.vulnerabilities.npm = vulns;
          
          vulns.forEach(([pkg, info]) => {
            const severity = info.severity;
            this.vulnerabilities[severity] = (this.vulnerabilities[severity] || 0) + 1;
            this.vulnerabilities.total++;
          });
          
          if (vulns.length > 0) {
            log(`\n⚠️  Found ${vulns.length} npm vulnerabilities:`, 'yellow');
            
            vulns.forEach(([pkg, info]) => {
              const severityColor = this.getSeverityColor(info.severity);
              log(`\n  Package: ${pkg}`, 'bright');
              log(`  Severity: ${info.severity.toUpperCase()}`, severityColor);
              log(`  Via: ${info.via.map(v => typeof v === 'string' ? v : v.name).join(', ')}`, 'reset');
              if (info.fixAvailable) {
                log(`  Fix: ${info.fixAvailable.name}@${info.fixAvailable.version}`, 'green');
              } else {
                log(`  Fix: Not available`, 'red');
              }
            });
          } else {
            log('✅ No npm vulnerabilities found!', 'green');
          }
        }
      } catch (e) {
        log(`Error parsing npm audit: ${e.message}`, 'red');
      }
    }
    
    return result.success;
  }

  async runCargoAudit() {
    if (!fs.existsSync('src-tauri/Cargo.toml')) {
      log('\n⏭️  Skipping cargo audit (no Rust project found)', 'yellow');
      return true;
    }
    
    log('\n🔒 Running cargo security audit...', 'cyan');
    
    // Check if cargo-audit is installed
    const checkInstall = execCommand('cargo audit --version', { silent: true });
    
    if (!checkInstall.success) {
      log('⚠️  cargo-audit not installed. Installing...', 'yellow');
      const install = execCommand('cargo install cargo-audit', { silent: false });
      
      if (!install.success) {
        log('❌ Failed to install cargo-audit', 'red');
        return false;
      }
    }
    
    const result = execCommand('cargo audit --json', { 
      cwd: 'src-tauri',
      silent: true 
    });
    
    if (result.output) {
      try {
        const audit = JSON.parse(result.output);
        
        if (audit.vulnerabilities && audit.vulnerabilities.list) {
          const vulns = audit.vulnerabilities.list;
          this.vulnerabilities.cargo = vulns;
          
          vulns.forEach(vuln => {
            const severity = vuln.advisory.severity || 'moderate';
            this.vulnerabilities[severity] = (this.vulnerabilities[severity] || 0) + 1;
            this.vulnerabilities.total++;
          });
          
          if (vulns.length > 0) {
            log(`\n⚠️  Found ${vulns.length} cargo vulnerabilities:`, 'yellow');
            
            vulns.forEach(vuln => {
              const advisory = vuln.advisory;
              const severityColor = this.getSeverityColor(advisory.severity);
              log(`\n  Package: ${vuln.package.name}@${vuln.package.version}`, 'bright');
              log(`  Severity: ${advisory.severity.toUpperCase()}`, severityColor);
              log(`  CVE: ${advisory.id}`, 'reset');
              log(`  Title: ${advisory.title}`, 'reset');
              log(`  URL: ${advisory.url}`, 'cyan');
            });
          } else {
            log('✅ No cargo vulnerabilities found!', 'green');
          }
        }
      } catch (e) {
        if (result.output.includes('Success')) {
          log('✅ No cargo vulnerabilities found!', 'green');
        } else {
          log(`Error parsing cargo audit: ${e.message}`, 'red');
        }
      }
    }
    
    return result.success || result.code === 0;
  }

  async checkOutdatedPackages() {
    log('\n📦 Checking for outdated packages with known vulnerabilities...', 'cyan');
    
    const npmOutdated = execCommand('npm outdated --json', { silent: true });
    
    if (npmOutdated.output) {
      try {
        const outdated = JSON.parse(npmOutdated.output);
        const packages = Object.keys(outdated);
        
        if (packages.length > 0) {
          log(`\n⚠️  Found ${packages.length} outdated package(s):`, 'yellow');
          log('Consider updating to get security patches.', 'yellow');
        }
      } catch (e) {
        // No outdated packages
      }
    }
  }

  async generateReport() {
    log('\n📊 Generating security report...', 'cyan');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.vulnerabilities.total,
        critical: this.vulnerabilities.critical,
        high: this.vulnerabilities.high,
        moderate: this.vulnerabilities.moderate,
        low: this.vulnerabilities.low,
      },
      npm: this.vulnerabilities.npm.length,
      cargo: this.vulnerabilities.cargo.length,
      details: {
        npm: this.vulnerabilities.npm,
        cargo: this.vulnerabilities.cargo,
      },
    };
    
    const reportPath = path.join(process.cwd(), 'security-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    log(`\n📄 Report saved to: ${reportPath}`, 'green');
    
    // Print summary
    log('\n' + '='.repeat(50), 'cyan');
    log('Security Summary:', 'bright');
    log('='.repeat(50), 'cyan');
    log(`Total Vulnerabilities: ${report.summary.total}`, 'bright');
    log(`  Critical: ${report.summary.critical}`, report.summary.critical > 0 ? 'red' : 'green');
    log(`  High: ${report.summary.high}`, report.summary.high > 0 ? 'red' : 'green');
    log(`  Moderate: ${report.summary.moderate}`, report.summary.moderate > 0 ? 'yellow' : 'green');
    log(`  Low: ${report.summary.low}`, report.summary.low > 0 ? 'yellow' : 'green');
    log('='.repeat(50), 'cyan');
    
    return report;
  }

  async attemptFix() {
    log('\n🔧 Attempting to fix vulnerabilities...', 'cyan');
    
    // Try npm audit fix
    log('\nFixing npm vulnerabilities...', 'bright');
    const npmFix = execCommand('npm audit fix');
    
    if (npmFix.success) {
      log('✅ npm vulnerabilities fixed!', 'green');
    } else {
      log('⚠️  Some npm vulnerabilities could not be fixed automatically.', 'yellow');
      log('Try: npm audit fix --force (use with caution!)', 'yellow');
    }
    
    // Cargo audit fix
    if (fs.existsSync('src-tauri/Cargo.toml')) {
      log('\nFixing cargo vulnerabilities...', 'bright');
      const cargoFix = execCommand('cargo audit fix', { cwd: 'src-tauri' });
      
      if (cargoFix.success) {
        log('✅ cargo vulnerabilities fixed!', 'green');
      } else {
        log('⚠️  Some cargo vulnerabilities require manual intervention.', 'yellow');
      }
    }
  }

  getSeverityColor(severity) {
    const severityMap = {
      critical: 'red',
      high: 'red',
      moderate: 'yellow',
      low: 'yellow',
    };
    return severityMap[severity] || 'reset';
  }

  shouldFailCI() {
    if (!this.ciMode) return false;
    
    // Fail CI if there are critical or high vulnerabilities
    return this.vulnerabilities.critical > 0 || this.vulnerabilities.high > 0;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }
  
  const options = {
    ci: args.includes('--ci'),
    severity: args.find(arg => arg.startsWith('--severity='))?.split('=')[1] || 'moderate',
  };
  
  log('\n🛡️  Voice Intelligence App - Security Monitor', 'bright');
  log('='.repeat(60), 'cyan');
  
  const monitor = new SecurityMonitor(options);
  
  if (args.includes('--scan') || args.includes('--audit')) {
    await monitor.runNpmAudit();
    await monitor.runCargoAudit();
    await monitor.checkOutdatedPackages();
  }
  
  if (args.includes('--report')) {
    await monitor.generateReport();
  }
  
  if (args.includes('--fix')) {
    await monitor.attemptFix();
  }
  
  log('\n' + '='.repeat(60), 'cyan');
  
  if (monitor.shouldFailCI()) {
    log('❌ Security check failed: Critical or high vulnerabilities found!', 'red');
    process.exit(1);
  } else {
    log('✅ Security check complete!\n', 'green');
  }
}

function showHelp() {
  log('\n🛡️  Security Vulnerability Monitoring Script', 'bright');
  log('\nUsage: node scripts/security-monitor.js [options]\n', 'reset');
  log('Options:', 'bright');
  log('  --scan           Run full security scan', 'reset');
  log('  --audit          Run dependency audits (npm + cargo)', 'reset');
  log('  --report         Generate security report (JSON)', 'reset');
  log('  --check-cve      Check for known CVEs', 'reset');
  log('  --fix            Attempt to fix vulnerabilities', 'reset');
  log('  --ci             CI mode (exit with error on critical/high)', 'reset');
  log('  --severity=LEVEL Minimum severity (low, moderate, high, critical)', 'reset');
  log('  --help           Show this help message', 'reset');
  log('\nExamples:', 'bright');
  log('  node scripts/security-monitor.js --scan --report', 'cyan');
  log('  node scripts/security-monitor.js --audit --fix', 'cyan');
  log('  node scripts/security-monitor.js --scan --ci --severity=high', 'cyan');
  log('');
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
