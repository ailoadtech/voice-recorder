#!/usr/bin/env node

/**
 * Version Management Script
 * 
 * Updates version numbers across all project files:
 * - package.json
 * - src-tauri/tauri.conf.json
 * - src-tauri/Cargo.toml
 * 
 * Usage:
 *   node scripts/version.js <new-version>
 *   node scripts/version.js patch|minor|major
 *   node scripts/version.js --current
 */

const fs = require('fs');
const path = require('path');

// File paths
const PACKAGE_JSON = path.join(__dirname, '..', 'package.json');
const TAURI_CONF = path.join(__dirname, '..', 'src-tauri', 'tauri.conf.json');
const CARGO_TOML = path.join(__dirname, '..', 'src-tauri', 'Cargo.toml');

/**
 * Parse semantic version
 */
function parseVersion(version) {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(-.*)?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }
  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
    prerelease: match[4] || '',
  };
}

/**
 * Increment version
 */
function incrementVersion(version, type) {
  const v = parseVersion(version);
  
  switch (type) {
    case 'major':
      v.major++;
      v.minor = 0;
      v.patch = 0;
      v.prerelease = '';
      break;
    case 'minor':
      v.minor++;
      v.patch = 0;
      v.prerelease = '';
      break;
    case 'patch':
      v.patch++;
      v.prerelease = '';
      break;
    default:
      throw new Error(`Invalid increment type: ${type}`);
  }
  
  return `${v.major}.${v.minor}.${v.patch}${v.prerelease}`;
}

/**
 * Get current version from package.json
 */
function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  return pkg.version;
}

/**
 * Update package.json
 */
function updatePackageJson(newVersion) {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const oldVersion = pkg.version;
  pkg.version = newVersion;
  fs.writeFileSync(PACKAGE_JSON, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`✓ Updated package.json: ${oldVersion} → ${newVersion}`);
}

/**
 * Update tauri.conf.json
 */
function updateTauriConf(newVersion) {
  const conf = JSON.parse(fs.readFileSync(TAURI_CONF, 'utf8'));
  const oldVersion = conf.version;
  conf.version = newVersion;
  fs.writeFileSync(TAURI_CONF, JSON.stringify(conf, null, 2) + '\n');
  console.log(`✓ Updated tauri.conf.json: ${oldVersion} → ${newVersion}`);
}

/**
 * Update Cargo.toml
 */
function updateCargoToml(newVersion) {
  let content = fs.readFileSync(CARGO_TOML, 'utf8');
  const versionMatch = content.match(/^version = "([^"]+)"/m);
  
  if (!versionMatch) {
    throw new Error('Could not find version in Cargo.toml');
  }
  
  const oldVersion = versionMatch[1];
  content = content.replace(
    /^version = "[^"]+"/m,
    `version = "${newVersion}"`
  );
  
  fs.writeFileSync(CARGO_TOML, content);
  console.log(`✓ Updated Cargo.toml: ${oldVersion} → ${newVersion}`);
}

/**
 * Verify all versions match
 */
function verifyVersions() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const conf = JSON.parse(fs.readFileSync(TAURI_CONF, 'utf8'));
  const cargo = fs.readFileSync(CARGO_TOML, 'utf8');
  const cargoVersion = cargo.match(/^version = "([^"]+)"/m)[1];
  
  if (pkg.version === conf.version && conf.version === cargoVersion) {
    console.log(`\n✓ All versions match: ${pkg.version}`);
    return true;
  } else {
    console.error('\n✗ Version mismatch:');
    console.error(`  package.json:     ${pkg.version}`);
    console.error(`  tauri.conf.json:  ${conf.version}`);
    console.error(`  Cargo.toml:       ${cargoVersion}`);
    return false;
  }
}

/**
 * Show current versions
 */
function showCurrentVersions() {
  const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
  const conf = JSON.parse(fs.readFileSync(TAURI_CONF, 'utf8'));
  const cargo = fs.readFileSync(CARGO_TOML, 'utf8');
  const cargoVersion = cargo.match(/^version = "([^"]+)"/m)[1];
  
  console.log('Current versions:');
  console.log(`  package.json:     ${pkg.version}`);
  console.log(`  tauri.conf.json:  ${conf.version}`);
  console.log(`  Cargo.toml:       ${cargoVersion}`);
  
  if (pkg.version === conf.version && conf.version === cargoVersion) {
    console.log('\n✓ All versions match');
  } else {
    console.log('\n✗ Versions do not match!');
    process.exit(1);
  }
}

/**
 * Create git tag
 */
function createGitTag(version) {
  const { execSync } = require('child_process');
  
  try {
    // Check if tag already exists
    try {
      execSync(`git rev-parse v${version}`, { stdio: 'ignore' });
      console.log(`\n⚠ Git tag v${version} already exists`);
      return;
    } catch {
      // Tag doesn't exist, continue
    }
    
    // Create tag
    execSync(`git tag -a v${version} -m "Release v${version}"`, { stdio: 'inherit' });
    console.log(`\n✓ Created git tag: v${version}`);
    console.log(`  Push with: git push origin v${version}`);
  } catch (error) {
    console.error(`\n✗ Failed to create git tag: ${error.message}`);
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log('Usage:');
    console.log('  node scripts/version.js <version>     Set specific version (e.g., 1.2.3)');
    console.log('  node scripts/version.js patch          Increment patch version');
    console.log('  node scripts/version.js minor          Increment minor version');
    console.log('  node scripts/version.js major          Increment major version');
    console.log('  node scripts/version.js --current      Show current versions');
    console.log('  node scripts/version.js --verify       Verify versions match');
    console.log('  node scripts/version.js --tag          Create git tag for current version');
    process.exit(0);
  }
  
  const command = args[0];
  
  // Handle special commands
  if (command === '--current') {
    showCurrentVersions();
    return;
  }
  
  if (command === '--verify') {
    const match = verifyVersions();
    process.exit(match ? 0 : 1);
  }
  
  if (command === '--tag') {
    const version = getCurrentVersion();
    createGitTag(version);
    return;
  }
  
  // Determine new version
  let newVersion;
  const currentVersion = getCurrentVersion();
  
  if (command === 'patch' || command === 'minor' || command === 'major') {
    newVersion = incrementVersion(currentVersion, command);
  } else {
    // Validate version format
    try {
      parseVersion(command);
      newVersion = command;
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }
  
  console.log(`\nUpdating version: ${currentVersion} → ${newVersion}\n`);
  
  // Update all files
  try {
    updatePackageJson(newVersion);
    updateTauriConf(newVersion);
    updateCargoToml(newVersion);
    
    // Verify
    if (verifyVersions()) {
      console.log('\n✓ Version update complete!');
      console.log('\nNext steps:');
      console.log('  1. Review changes: git diff');
      console.log('  2. Commit changes: git commit -am "Bump version to ' + newVersion + '"');
      console.log('  3. Create tag: node scripts/version.js --tag');
      console.log('  4. Push changes: git push && git push --tags');
    }
  } catch (error) {
    console.error(`\n✗ Error updating version: ${error.message}`);
    process.exit(1);
  }
}

// Run
main();
