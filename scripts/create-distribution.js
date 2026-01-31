#!/usr/bin/env node

/**
 * Distribution Package Creator
 * 
 * Creates distribution packages with installers, checksums, and documentation
 * 
 * Usage:
 *   node scripts/create-distribution.js
 *   node scripts/create-distribution.js --version 0.1.0
 *   node scripts/create-distribution.js --clean
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// Configuration
const BUNDLE_DIR = path.join(__dirname, '..', 'src-tauri', 'target', 'release', 'bundle');
const DIST_DIR = path.join(__dirname, '..', 'dist');
const DOCS_DIR = path.join(__dirname, '..', 'docs');

/**
 * Get current version
 */
function getVersion() {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  return pkg.version;
}

/**
 * Calculate SHA256 checksum
 */
function calculateChecksum(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Get file size in MB
 */
function getFileSizeMB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / (1024 * 1024)).toFixed(2);
}

/**
 * Find installer files
 */
function findInstallers() {
  const installers = [];
  
  if (!fs.existsSync(BUNDLE_DIR)) {
    console.warn('Warning: Bundle directory not found. Run `npm run tauri:build` first.');
    return installers;
  }
  
  // Windows installers
  const msiDir = path.join(BUNDLE_DIR, 'msi');
  if (fs.existsSync(msiDir)) {
    const msiFiles = fs.readdirSync(msiDir).filter(f => f.endsWith('.msi'));
    msiFiles.forEach(file => {
      installers.push({
        platform: 'windows',
        type: 'msi',
        path: path.join(msiDir, file),
        filename: file
      });
    });
  }
  
  const nsisDir = path.join(BUNDLE_DIR, 'nsis');
  if (fs.existsSync(nsisDir)) {
    const nsisFiles = fs.readdirSync(nsisDir).filter(f => f.endsWith('.exe'));
    nsisFiles.forEach(file => {
      installers.push({
        platform: 'windows',
        type: 'nsis',
        path: path.join(nsisDir, file),
        filename: file
      });
    });
  }
  
  // macOS installers
  const dmgDir = path.join(BUNDLE_DIR, 'dmg');
  if (fs.existsSync(dmgDir)) {
    const dmgFiles = fs.readdirSync(dmgDir).filter(f => f.endsWith('.dmg'));
    dmgFiles.forEach(file => {
      installers.push({
        platform: 'macos',
        type: 'dmg',
        path: path.join(dmgDir, file),
        filename: file
      });
    });
  }
  
  // Linux installers
  const appimageDir = path.join(BUNDLE_DIR, 'appimage');
  if (fs.existsSync(appimageDir)) {
    const appimageFiles = fs.readdirSync(appimageDir).filter(f => f.endsWith('.AppImage'));
    appimageFiles.forEach(file => {
      installers.push({
        platform: 'linux',
        type: 'appimage',
        path: path.join(appimageDir, file),
        filename: file
      });
    });
  }
  
  const debDir = path.join(BUNDLE_DIR, 'deb');
  if (fs.existsSync(debDir)) {
    const debFiles = fs.readdirSync(debDir).filter(f => f.endsWith('.deb'));
    debFiles.forEach(file => {
      installers.push({
        platform: 'linux',
        type: 'deb',
        path: path.join(debDir, file),
        filename: file
      });
    });
  }
  
  return installers;
}

/**
 * Copy file to distribution directory
 */
function copyToDistribution(installer, version) {
  const versionDir = path.join(DIST_DIR, `v${version}`);
  
  if (!fs.existsSync(versionDir)) {
    fs.mkdirSync(versionDir, { recursive: true });
  }
  
  const destPath = path.join(versionDir, installer.filename);
  fs.copyFileSync(installer.path, destPath);
  
  return destPath;
}

/**
 * Generate checksums file
 */
function generateChecksumsFile(installers, version) {
  const versionDir = path.join(DIST_DIR, `v${version}`);
  const checksumsPath = path.join(versionDir, 'SHA256SUMS.txt');
  
  let content = `# SHA256 Checksums for Voice Intelligence v${version}\n`;
  content += `# Generated: ${new Date().toISOString()}\n\n`;
  
  installers.forEach(installer => {
    const checksum = calculateChecksum(installer.distPath);
    content += `${checksum}  ${installer.filename}\n`;
  });
  
  fs.writeFileSync(checksumsPath, content);
  console.log(`✓ Generated checksums: ${checksumsPath}`);
}

/**
 * Generate distribution manifest
 */
function generateManifest(installers, version) {
  const versionDir = path.join(DIST_DIR, `v${version}`);
  const manifestPath = path.join(versionDir, 'manifest.json');
  
  const manifest = {
    version: version,
    releaseDate: new Date().toISOString().split('T')[0],
    installers: installers.map(installer => ({
      platform: installer.platform,
      type: installer.type,
      filename: installer.filename,
      size: getFileSizeMB(installer.distPath) + ' MB',
      checksum: calculateChecksum(installer.distPath)
    }))
  };
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`✓ Generated manifest: ${manifestPath}`);
}

/**
 * Copy documentation
 */
function copyDocumentation(version) {
  const versionDir = path.join(DIST_DIR, `v${version}`);
  const docsDestDir = path.join(versionDir, 'docs');
  
  if (!fs.existsSync(docsDestDir)) {
    fs.mkdirSync(docsDestDir, { recursive: true });
  }
  
  // Essential docs to include
  const essentialDocs = [
    'README.md',
    'CHANGELOG.md',
    'LICENSE',
    'docs/USER_GUIDE.md',
    'docs/API_KEY_SETUP.md',
    'docs/FAQ.md',
    'docs/QUICK_REFERENCE.md'
  ];
  
  essentialDocs.forEach(doc => {
    const srcPath = path.join(__dirname, '..', doc);
    if (fs.existsSync(srcPath)) {
      const destPath = path.join(docsDestDir, path.basename(doc));
      fs.copyFileSync(srcPath, destPath);
      console.log(`✓ Copied: ${doc}`);
    }
  });
}

/**
 * Generate installation instructions
 */
function generateInstallInstructions(installers, version) {
  const versionDir = path.join(DIST_DIR, `v${version}`);
  const instructionsPath = path.join(versionDir, 'INSTALL.txt');
  
  let content = `Voice Intelligence v${version} - Installation Instructions\n`;
  content += `${'='.repeat(60)}\n\n`;
  
  // Windows
  const windowsInstallers = installers.filter(i => i.platform === 'windows');
  if (windowsInstallers.length > 0) {
    content += `WINDOWS INSTALLATION\n`;
    content += `${'-'.repeat(60)}\n\n`;
    windowsInstallers.forEach(installer => {
      content += `${installer.type.toUpperCase()} Installer: ${installer.filename}\n`;
      content += `  1. Download the installer\n`;
      content += `  2. Run the installer\n`;
      content += `  3. Follow the installation wizard\n`;
      content += `  4. Launch Voice Intelligence from Start Menu\n\n`;
    });
  }
  
  // macOS
  const macosInstallers = installers.filter(i => i.platform === 'macos');
  if (macosInstallers.length > 0) {
    content += `MACOS INSTALLATION\n`;
    content += `${'-'.repeat(60)}\n\n`;
    macosInstallers.forEach(installer => {
      content += `DMG Installer: ${installer.filename}\n`;
      content += `  1. Download the DMG file\n`;
      content += `  2. Open the DMG file\n`;
      content += `  3. Drag Voice Intelligence to Applications folder\n`;
      content += `  4. Launch from Applications\n\n`;
    });
  }
  
  // Linux
  const linuxInstallers = installers.filter(i => i.platform === 'linux');
  if (linuxInstallers.length > 0) {
    content += `LINUX INSTALLATION\n`;
    content += `${'-'.repeat(60)}\n\n`;
    linuxInstallers.forEach(installer => {
      if (installer.type === 'appimage') {
        content += `AppImage: ${installer.filename}\n`;
        content += `  1. Download the AppImage\n`;
        content += `  2. Make it executable: chmod +x ${installer.filename}\n`;
        content += `  3. Run: ./${installer.filename}\n\n`;
      } else if (installer.type === 'deb') {
        content += `DEB Package: ${installer.filename}\n`;
        content += `  1. Download the DEB file\n`;
        content += `  2. Install: sudo dpkg -i ${installer.filename}\n`;
        content += `  3. Fix dependencies if needed: sudo apt-get install -f\n`;
        content += `  4. Launch from applications menu\n\n`;
      }
    });
  }
  
  content += `\nCONFIGURATION\n`;
  content += `${'-'.repeat(60)}\n\n`;
  content += `Before using Voice Intelligence, configure your API keys:\n\n`;
  content += `1. Create a .env.local file in the application directory\n`;
  content += `2. Add your OpenAI API key:\n`;
  content += `   OPENAI_API_KEY=sk-your-api-key-here\n`;
  content += `3. Restart the application\n\n`;
  content += `See docs/API_KEY_SETUP.md for detailed instructions.\n\n`;
  
  content += `\nSUPPORT\n`;
  content += `${'-'.repeat(60)}\n\n`;
  content += `Documentation: See docs/ folder\n`;
  content += `FAQ: docs/FAQ.md\n`;
  content += `Issues: https://github.com/your-org/voice-intelligence/issues\n`;
  
  fs.writeFileSync(instructionsPath, content);
  console.log(`✓ Generated installation instructions: ${instructionsPath}`);
}

/**
 * Create distribution summary
 */
function createSummary(installers, version) {
  console.log('\n' + '='.repeat(60));
  console.log(`Distribution Package Created: v${version}`);
  console.log('='.repeat(60));
  console.log(`\nLocation: ${path.join(DIST_DIR, `v${version}`)}`);
  console.log(`\nInstallers (${installers.length}):`);
  
  installers.forEach(installer => {
    const size = getFileSizeMB(installer.distPath);
    console.log(`  ${installer.platform.padEnd(10)} ${installer.type.padEnd(10)} ${installer.filename} (${size} MB)`);
  });
  
  console.log('\nFiles created:');
  console.log('  - Installers copied');
  console.log('  - SHA256SUMS.txt (checksums)');
  console.log('  - manifest.json (metadata)');
  console.log('  - INSTALL.txt (instructions)');
  console.log('  - docs/ (documentation)');
  
  console.log('\nNext steps:');
  console.log('  1. Test installers on target platforms');
  console.log('  2. Create GitHub release');
  console.log('  3. Upload distribution files');
  console.log('  4. Announce release');
}

/**
 * Clean distribution directory
 */
function cleanDistribution() {
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true, force: true });
    console.log('✓ Cleaned distribution directory');
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage:');
    console.log('  node scripts/create-distribution.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --version <ver>   Specify version (default: from package.json)');
    console.log('  --clean           Clean distribution directory');
    console.log('  --help, -h        Show this help message');
    process.exit(0);
  }
  
  if (args.includes('--clean')) {
    cleanDistribution();
    return;
  }
  
  // Get version
  let version;
  if (args.includes('--version')) {
    const versionIndex = args.indexOf('--version');
    version = args[versionIndex + 1].replace(/^v/, '');
  } else {
    version = getVersion();
  }
  
  console.log(`Creating distribution package for v${version}...\n`);
  
  // Find installers
  const installers = findInstallers();
  
  if (installers.length === 0) {
    console.error('Error: No installers found!');
    console.error('Run `npm run tauri:build` first to create installers.');
    process.exit(1);
  }
  
  console.log(`Found ${installers.length} installer(s):\n`);
  installers.forEach(installer => {
    console.log(`  ${installer.platform}/${installer.type}: ${installer.filename}`);
  });
  console.log('');
  
  // Copy installers to distribution directory
  console.log('Copying installers...');
  installers.forEach(installer => {
    installer.distPath = copyToDistribution(installer, version);
    console.log(`✓ Copied: ${installer.filename}`);
  });
  console.log('');
  
  // Generate checksums
  console.log('Generating checksums...');
  generateChecksumsFile(installers, version);
  console.log('');
  
  // Generate manifest
  console.log('Generating manifest...');
  generateManifest(installers, version);
  console.log('');
  
  // Copy documentation
  console.log('Copying documentation...');
  copyDocumentation(version);
  console.log('');
  
  // Generate installation instructions
  console.log('Generating installation instructions...');
  generateInstallInstructions(installers, version);
  console.log('');
  
  // Create summary
  createSummary(installers, version);
}

// Run
main();
