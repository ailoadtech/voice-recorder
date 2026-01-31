#!/usr/bin/env node

/**
 * Desktop App Packaging Script
 * 
 * Automates the packaging process for Voice Intelligence desktop app
 * across different platforms and formats.
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

function error(message) {
  log(`❌ ${message}`, 'red');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function exec(command, options = {}) {
  try {
    return execSync(command, {
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf-8',
      ...options,
    });
  } catch (err) {
    if (!options.ignoreError) {
      throw err;
    }
    return null;
  }
}

function getPlatform() {
  const platform = process.platform;
  if (platform === 'win32') return 'windows';
  if (platform === 'darwin') return 'macos';
  if (platform === 'linux') return 'linux';
  throw new Error(`Unsupported platform: ${platform}`);
}

function getVersion() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
  );
  return packageJson.version;
}

function checkPrerequisites() {
  log('\n📋 Checking prerequisites...', 'bright');

  // Check Node.js
  try {
    const nodeVersion = exec('node --version', { silent: true }).trim();
    success(`Node.js: ${nodeVersion}`);
  } catch {
    error('Node.js not found');
    return false;
  }

  // Check Rust
  try {
    const rustVersion = exec('rustc --version', { silent: true }).trim();
    success(`Rust: ${rustVersion}`);
  } catch {
    error('Rust not found. Install from https://rustup.rs/');
    return false;
  }

  // Check Tauri CLI
  try {
    exec('npm list @tauri-apps/cli', { silent: true });
    success('Tauri CLI: installed');
  } catch {
    error('Tauri CLI not found. Run: npm install');
    return false;
  }

  // Platform-specific checks
  const platform = getPlatform();
  
  if (platform === 'windows') {
    // Check for WiX (optional)
    try {
      exec('candle -?', { silent: true, ignoreError: true });
      success('WiX Toolset: installed');
    } catch {
      warning('WiX Toolset not found (MSI builds will fail)');
    }
  }

  if (platform === 'macos') {
    // Check Xcode
    try {
      exec('xcode-select -p', { silent: true });
      success('Xcode Command Line Tools: installed');
    } catch {
      error('Xcode Command Line Tools not found. Run: xcode-select --install');
      return false;
    }
  }

  return true;
}

function cleanBuildArtifacts() {
  log('\n🧹 Cleaning previous build artifacts...', 'bright');
  
  const bundlePath = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle');
  
  if (fs.existsSync(bundlePath)) {
    fs.rmSync(bundlePath, { recursive: true, force: true });
    success('Cleaned bundle directory');
  } else {
    info('No previous artifacts found');
  }
}

function buildFrontend() {
  log('\n🔨 Building Next.js frontend...', 'bright');
  
  try {
    exec('npm run build');
    success('Frontend build complete');
    return true;
  } catch (err) {
    error('Frontend build failed');
    return false;
  }
}

function buildTauri(options = {}) {
  const { bundles, target, debug } = options;
  
  log('\n📦 Building Tauri application...', 'bright');
  
  let command = 'npm run tauri:build';
  
  if (debug) {
    command += ' -- --debug';
  }
  
  if (bundles) {
    command += ` -- --bundles ${bundles}`;
  }
  
  if (target) {
    command += ` -- --target ${target}`;
  }
  
  info(`Command: ${command}`);
  
  try {
    exec(command);
    success('Tauri build complete');
    return true;
  } catch (err) {
    error('Tauri build failed');
    return false;
  }
}

function listArtifacts() {
  log('\n📄 Build artifacts:', 'bright');
  
  const bundlePath = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle');
  
  if (!fs.existsSync(bundlePath)) {
    warning('No artifacts found');
    return;
  }
  
  const formats = fs.readdirSync(bundlePath);
  
  formats.forEach(format => {
    const formatPath = path.join(bundlePath, format);
    if (fs.statSync(formatPath).isDirectory()) {
      const files = fs.readdirSync(formatPath);
      
      if (files.length > 0) {
        log(`\n  ${format}:`, 'cyan');
        files.forEach(file => {
          const filePath = path.join(formatPath, file);
          const stats = fs.statSync(filePath);
          const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
          log(`    - ${file} (${sizeMB} MB)`, 'reset');
        });
      }
    }
  });
}

function generateChecksums() {
  log('\n🔐 Generating checksums...', 'bright');
  
  const bundlePath = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle');
  const checksumFile = path.join(bundlePath, 'checksums.txt');
  
  if (!fs.existsSync(bundlePath)) {
    warning('No artifacts to checksum');
    return;
  }
  
  const crypto = require('crypto');
  const checksums = [];
  
  function processDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        processDirectory(itemPath);
      } else if (stats.isFile()) {
        const content = fs.readFileSync(itemPath);
        const hash = crypto.createHash('sha256').update(content).digest('hex');
        const relativePath = path.relative(bundlePath, itemPath);
        checksums.push(`${hash}  ${relativePath}`);
      }
    });
  }
  
  processDirectory(bundlePath);
  
  if (checksums.length > 0) {
    fs.writeFileSync(checksumFile, checksums.join('\n'));
    success(`Checksums saved to: ${path.relative(process.cwd(), checksumFile)}`);
  }
}

function showHelp() {
  console.log(`
${colors.bright}Voice Intelligence - Desktop App Packaging${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node scripts/package.js [options]

${colors.cyan}Options:${colors.reset}
  --platform <name>     Target platform (windows, macos, linux, all)
  --format <formats>    Bundle formats (comma-separated)
                        Windows: msi, nsis
                        macOS: dmg, app
                        Linux: appimage, deb
  --target <triple>     Rust target triple
  --debug               Build with debug symbols
  --clean               Clean before building
  --no-checksums        Skip checksum generation
  --help                Show this help message

${colors.cyan}Examples:${colors.reset}
  # Build for current platform (all formats)
  node scripts/package.js

  # Build specific format
  node scripts/package.js --format msi

  # Build for specific platform
  node scripts/package.js --platform windows --format msi,nsis

  # Clean build
  node scripts/package.js --clean

  # Debug build
  node scripts/package.js --debug

${colors.cyan}Platform-specific formats:${colors.reset}
  Windows: msi, nsis
  macOS:   dmg, app
  Linux:   appimage, deb

${colors.cyan}Common targets:${colors.reset}
  Windows: x86_64-pc-windows-msvc
  macOS:   x86_64-apple-darwin, aarch64-apple-darwin, universal-apple-darwin
  Linux:   x86_64-unknown-linux-gnu
  `);
}

function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    platform: null,
    format: null,
    target: null,
    debug: false,
    clean: false,
    checksums: true,
    help: false,
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--platform') {
      options.platform = args[++i];
    } else if (arg === '--format') {
      options.format = args[++i];
    } else if (arg === '--target') {
      options.target = args[++i];
    } else if (arg === '--debug') {
      options.debug = true;
    } else if (arg === '--clean') {
      options.clean = true;
    } else if (arg === '--no-checksums') {
      options.checksums = false;
    }
  }
  
  if (options.help) {
    showHelp();
    return;
  }
  
  // Show header
  const version = getVersion();
  log(`\n${'='.repeat(60)}`, 'bright');
  log(`  Voice Intelligence Desktop App Packaging`, 'bright');
  log(`  Version: ${version}`, 'bright');
  log(`  Platform: ${getPlatform()}`, 'bright');
  log(`${'='.repeat(60)}\n`, 'bright');
  
  // Check prerequisites
  if (!checkPrerequisites()) {
    error('\n❌ Prerequisites check failed');
    process.exit(1);
  }
  
  // Clean if requested
  if (options.clean) {
    cleanBuildArtifacts();
  }
  
  // Build frontend
  if (!buildFrontend()) {
    error('\n❌ Build failed at frontend stage');
    process.exit(1);
  }
  
  // Build Tauri
  const buildOptions = {
    bundles: options.format,
    target: options.target,
    debug: options.debug,
  };
  
  if (!buildTauri(buildOptions)) {
    error('\n❌ Build failed at Tauri stage');
    process.exit(1);
  }
  
  // List artifacts
  listArtifacts();
  
  // Generate checksums
  if (options.checksums) {
    generateChecksums();
  }
  
  // Success
  log('\n' + '='.repeat(60), 'bright');
  success('Build completed successfully! 🎉');
  log('='.repeat(60) + '\n', 'bright');
  
  info('Next steps:');
  info('  1. Test the installer on a clean system');
  info('  2. Verify code signing (if configured)');
  info('  3. Create release notes');
  info('  4. Distribute to users\n');
}

// Run
if (require.main === module) {
  try {
    main();
  } catch (err) {
    error(`\n❌ Unexpected error: ${err.message}`);
    if (process.env.DEBUG) {
      console.error(err);
    }
    process.exit(1);
  }
}

module.exports = { main };
