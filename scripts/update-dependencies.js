#!/usr/bin/env node

/**
 * Dependency Update Script
 * 
 * This script helps manage dependency updates with safety checks.
 * 
 * Usage:
 *   node scripts/update-dependencies.js [options]
 * 
 * Options:
 *   --check          Check for outdated dependencies
 *   --update-patch   Update patch versions only
 *   --update-minor   Update minor versions
 *   --update-major   Update major versions (interactive)
 *   --audit          Run security audit
 *   --fix            Automatically fix vulnerabilities
 *   --dry-run        Show what would be updated without making changes
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
    return { success: false, error: error.message, output: error.stdout };
  }
}

function checkOutdated() {
  log('\n📦 Checking for outdated npm packages...', 'cyan');
  const result = execCommand('npm outdated --json', { silent: true });
  
  if (result.output) {
    try {
      const outdated = JSON.parse(result.output);
      const packages = Object.keys(outdated);
      
      if (packages.length === 0) {
        log('✅ All packages are up to date!', 'green');
        return;
      }
      
      log(`\n⚠️  Found ${packages.length} outdated package(s):\n`, 'yellow');
      
      packages.forEach(pkg => {
        const info = outdated[pkg];
        const current = info.current;
        const wanted = info.wanted;
        const latest = info.latest;
        
        let updateType = 'patch';
        if (wanted !== latest) {
          const [wantedMajor] = wanted.split('.');
          const [latestMajor] = latest.split('.');
          updateType = wantedMajor !== latestMajor ? 'major' : 'minor';
        }
        
        const typeColor = updateType === 'major' ? 'red' : updateType === 'minor' ? 'yellow' : 'green';
        log(`  ${pkg}:`, 'bright');
        log(`    Current: ${current}`, 'reset');
        log(`    Wanted:  ${wanted}`, 'reset');
        log(`    Latest:  ${latest} (${updateType})`, typeColor);
      });
    } catch (e) {
      log('No outdated packages found.', 'green');
    }
  }
}

function runAudit() {
  log('\n🔒 Running security audit...', 'cyan');
  
  // npm audit
  log('\nNPM Audit:', 'bright');
  const npmAudit = execCommand('npm audit --audit-level=moderate');
  
  if (!npmAudit.success) {
    log('⚠️  Security vulnerabilities found!', 'yellow');
    log('Run "npm audit fix" to attempt automatic fixes.', 'yellow');
  } else {
    log('✅ No security vulnerabilities found!', 'green');
  }
  
  // Cargo audit (if Rust is available)
  if (fs.existsSync('src-tauri/Cargo.toml')) {
    log('\nCargo Audit:', 'bright');
    const cargoAudit = execCommand('cargo audit', { 
      cwd: 'src-tauri',
      silent: false 
    });
    
    if (!cargoAudit.success) {
      log('⚠️  Cargo audit not installed or vulnerabilities found.', 'yellow');
      log('Install with: cargo install cargo-audit', 'yellow');
    }
  }
}

function fixVulnerabilities() {
  log('\n🔧 Attempting to fix vulnerabilities...', 'cyan');
  
  const result = execCommand('npm audit fix');
  
  if (result.success) {
    log('✅ Vulnerabilities fixed!', 'green');
    log('⚠️  Please test your application to ensure nothing broke.', 'yellow');
  } else {
    log('⚠️  Some vulnerabilities could not be fixed automatically.', 'yellow');
    log('Try: npm audit fix --force (use with caution!)', 'yellow');
  }
}

function updatePatch(dryRun = false) {
  log('\n📦 Updating patch versions...', 'cyan');
  
  const command = dryRun 
    ? 'npm outdated --json' 
    : 'npm update';
  
  if (dryRun) {
    log('Dry run mode - no changes will be made', 'yellow');
  }
  
  const result = execCommand(command);
  
  if (result.success) {
    log('✅ Patch updates complete!', 'green');
    if (!dryRun) {
      log('⚠️  Run tests to verify: npm test', 'yellow');
    }
  }
}

function updateMinor(dryRun = false) {
  log('\n📦 Updating minor versions...', 'cyan');
  
  if (dryRun) {
    log('Dry run mode - showing what would be updated', 'yellow');
    checkOutdated();
    return;
  }
  
  log('⚠️  This will update to the latest minor versions.', 'yellow');
  log('Press Ctrl+C to cancel, or wait 5 seconds to continue...', 'yellow');
  
  // Give user time to cancel
  execSync('sleep 5 || timeout 5', { stdio: 'inherit' });
  
  const result = execCommand('npm update --save');
  
  if (result.success) {
    log('✅ Minor updates complete!', 'green');
    log('⚠️  Run tests to verify: npm test', 'yellow');
  }
}

function updateMajor() {
  log('\n📦 Checking for major version updates...', 'cyan');
  log('⚠️  Major updates may contain breaking changes!', 'red');
  
  const result = execCommand('npm outdated --json', { silent: true });
  
  if (result.output) {
    try {
      const outdated = JSON.parse(result.output);
      const majorUpdates = Object.entries(outdated).filter(([_, info]) => {
        const [wantedMajor] = info.wanted.split('.');
        const [latestMajor] = info.latest.split('.');
        return wantedMajor !== latestMajor;
      });
      
      if (majorUpdates.length === 0) {
        log('✅ No major updates available!', 'green');
        return;
      }
      
      log(`\nFound ${majorUpdates.length} major update(s):\n`, 'yellow');
      majorUpdates.forEach(([pkg, info]) => {
        log(`  ${pkg}: ${info.current} → ${info.latest}`, 'bright');
      });
      
      log('\n⚠️  Please update these manually and review changelogs:', 'yellow');
      majorUpdates.forEach(([pkg]) => {
        log(`  npm install ${pkg}@latest`, 'cyan');
      });
    } catch (e) {
      log('No major updates found.', 'green');
    }
  }
}

function showHelp() {
  log('\n📚 Dependency Update Script', 'bright');
  log('\nUsage: node scripts/update-dependencies.js [options]\n', 'reset');
  log('Options:', 'bright');
  log('  --check          Check for outdated dependencies', 'reset');
  log('  --update-patch   Update patch versions only (safe)', 'reset');
  log('  --update-minor   Update minor versions', 'reset');
  log('  --update-major   Check for major version updates', 'reset');
  log('  --audit          Run security audit', 'reset');
  log('  --fix            Automatically fix vulnerabilities', 'reset');
  log('  --dry-run        Show what would be updated', 'reset');
  log('  --help           Show this help message', 'reset');
  log('\nExamples:', 'bright');
  log('  node scripts/update-dependencies.js --check', 'cyan');
  log('  node scripts/update-dependencies.js --audit', 'cyan');
  log('  node scripts/update-dependencies.js --update-patch --dry-run', 'cyan');
  log('  node scripts/update-dependencies.js --fix', 'cyan');
  log('');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }
  
  const dryRun = args.includes('--dry-run');
  
  log('\n🚀 Voice Intelligence App - Dependency Manager', 'bright');
  log('='.repeat(50), 'cyan');
  
  if (args.includes('--check')) {
    checkOutdated();
  }
  
  if (args.includes('--audit')) {
    runAudit();
  }
  
  if (args.includes('--fix')) {
    fixVulnerabilities();
  }
  
  if (args.includes('--update-patch')) {
    updatePatch(dryRun);
  }
  
  if (args.includes('--update-minor')) {
    updateMinor(dryRun);
  }
  
  if (args.includes('--update-major')) {
    updateMajor();
  }
  
  log('\n' + '='.repeat(50), 'cyan');
  log('✅ Done!\n', 'green');
}

main();
