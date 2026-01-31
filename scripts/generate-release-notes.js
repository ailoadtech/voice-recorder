#!/usr/bin/env node

/**
 * Release Notes Generator
 * 
 * Generates release notes from git commits and changelog
 * 
 * Usage:
 *   node scripts/generate-release-notes.js [version]
 *   node scripts/generate-release-notes.js --from-tag v0.1.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');
const RELEASE_NOTES_DIR = path.join(__dirname, '..', 'releases');

/**
 * Get current version from package.json
 */
function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  return pkg.version;
}

/**
 * Get git commits since last tag
 */
function getCommitsSinceTag(fromTag) {
  try {
    const range = fromTag ? `${fromTag}..HEAD` : 'HEAD';
    const commits = execSync(`git log ${range} --pretty=format:"%h|%s|%an|%ad" --date=short`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    });
    
    return commits.split('\n').filter(Boolean).map(line => {
      const [hash, subject, author, date] = line.split('|');
      return { hash, subject, author, date };
    });
  } catch (error) {
    console.warn('Warning: Could not get git commits');
    return [];
  }
}

/**
 * Categorize commits
 */
function categorizeCommits(commits) {
  const categories = {
    features: [],
    fixes: [],
    improvements: [],
    docs: [],
    tests: [],
    chore: [],
    other: []
  };
  
  commits.forEach(commit => {
    const subject = commit.subject.toLowerCase();
    
    if (subject.startsWith('feat:') || subject.startsWith('feature:')) {
      categories.features.push(commit);
    } else if (subject.startsWith('fix:') || subject.startsWith('bugfix:')) {
      categories.fixes.push(commit);
    } else if (subject.startsWith('improve:') || subject.startsWith('enhancement:')) {
      categories.improvements.push(commit);
    } else if (subject.startsWith('docs:') || subject.startsWith('doc:')) {
      categories.docs.push(commit);
    } else if (subject.startsWith('test:') || subject.startsWith('tests:')) {
      categories.tests.push(commit);
    } else if (subject.startsWith('chore:') || subject.startsWith('build:') || subject.startsWith('ci:')) {
      categories.chore.push(commit);
    } else {
      categories.other.push(commit);
    }
  });
  
  return categories;
}

/**
 * Format commit for release notes
 */
function formatCommit(commit) {
  const subject = commit.subject.replace(/^(feat|fix|docs|test|chore|improve|enhancement|feature|bugfix):\s*/i, '');
  return `- ${subject} (${commit.hash})`;
}

/**
 * Generate release notes content
 */
function generateReleaseNotes(version, commits) {
  const date = new Date().toISOString().split('T')[0];
  const categories = categorizeCommits(commits);
  
  let notes = `# Release Notes - v${version}\n\n`;
  notes += `**Release Date:** ${date}\n\n`;
  notes += `## Overview\n\n`;
  notes += `Voice Intelligence v${version} includes new features, improvements, and bug fixes.\n\n`;
  
  // Features
  if (categories.features.length > 0) {
    notes += `## ✨ New Features\n\n`;
    categories.features.forEach(commit => {
      notes += formatCommit(commit) + '\n';
    });
    notes += '\n';
  }
  
  // Improvements
  if (categories.improvements.length > 0) {
    notes += `## 🚀 Improvements\n\n`;
    categories.improvements.forEach(commit => {
      notes += formatCommit(commit) + '\n';
    });
    notes += '\n';
  }
  
  // Bug Fixes
  if (categories.fixes.length > 0) {
    notes += `## 🐛 Bug Fixes\n\n`;
    categories.fixes.forEach(commit => {
      notes += formatCommit(commit) + '\n';
    });
    notes += '\n';
  }
  
  // Documentation
  if (categories.docs.length > 0) {
    notes += `## 📚 Documentation\n\n`;
    categories.docs.forEach(commit => {
      notes += formatCommit(commit) + '\n';
    });
    notes += '\n';
  }
  
  // Other changes
  if (categories.other.length > 0) {
    notes += `## 🔧 Other Changes\n\n`;
    categories.other.forEach(commit => {
      notes += formatCommit(commit) + '\n';
    });
    notes += '\n';
  }
  
  // Installation
  notes += `## 📦 Installation\n\n`;
  notes += `### Windows\n\n`;
  notes += `1. Download \`Voice-Intelligence-${version}-setup.msi\` or \`Voice-Intelligence-${version}-setup.exe\`\n`;
  notes += `2. Run the installer\n`;
  notes += `3. Follow the installation wizard\n\n`;
  
  notes += `### macOS\n\n`;
  notes += `1. Download \`Voice-Intelligence-${version}.dmg\`\n`;
  notes += `2. Open the DMG file\n`;
  notes += `3. Drag Voice Intelligence to Applications folder\n\n`;
  
  notes += `### Linux\n\n`;
  notes += `1. Download \`voice-intelligence-${version}.AppImage\` or \`voice-intelligence_${version}_amd64.deb\`\n`;
  notes += `2. For AppImage: Make executable and run\n`;
  notes += `3. For DEB: Install with \`sudo dpkg -i voice-intelligence_${version}_amd64.deb\`\n\n`;
  
  // Configuration
  notes += `## ⚙️ Configuration\n\n`;
  notes += `Before using Voice Intelligence, you need to configure your API keys:\n\n`;
  notes += `1. Create a \`.env.local\` file in the application directory\n`;
  notes += `2. Add your OpenAI API key:\n`;
  notes += `   \`\`\`\n`;
  notes += `   OPENAI_API_KEY=sk-your-api-key-here\n`;
  notes += `   \`\`\`\n`;
  notes += `3. Restart the application\n\n`;
  notes += `See [API Key Setup Guide](../docs/API_KEY_SETUP.md) for detailed instructions.\n\n`;
  
  // Known Issues
  notes += `## ⚠️ Known Issues\n\n`;
  notes += `- None reported for this release\n\n`;
  
  // Upgrade Notes
  notes += `## 🔄 Upgrade Notes\n\n`;
  notes += `If upgrading from a previous version:\n\n`;
  notes += `1. Backup your recordings and settings\n`;
  notes += `2. Uninstall the previous version (optional)\n`;
  notes += `3. Install the new version\n`;
  notes += `4. Your data should be preserved automatically\n\n`;
  
  // System Requirements
  notes += `## 💻 System Requirements\n\n`;
  notes += `### Windows\n`;
  notes += `- Windows 10 or later\n`;
  notes += `- 4GB RAM minimum\n`;
  notes += `- 200MB disk space\n`;
  notes += `- Microphone for recording\n\n`;
  
  notes += `### macOS\n`;
  notes += `- macOS 10.13 or later\n`;
  notes += `- 4GB RAM minimum\n`;
  notes += `- 200MB disk space\n`;
  notes += `- Microphone for recording\n\n`;
  
  notes += `### Linux\n`;
  notes += `- Ubuntu 18.04 or later (or equivalent)\n`;
  notes += `- 4GB RAM minimum\n`;
  notes += `- 200MB disk space\n`;
  notes += `- Microphone for recording\n\n`;
  
  // Support
  notes += `## 🆘 Support\n\n`;
  notes += `- **Documentation:** [docs/](../docs/)\n`;
  notes += `- **Issues:** [GitHub Issues](https://github.com/your-org/voice-intelligence/issues)\n`;
  notes += `- **FAQ:** [docs/FAQ.md](../docs/FAQ.md)\n\n`;
  
  // Checksums
  notes += `## 🔐 Checksums (SHA256)\n\n`;
  notes += `Checksums will be provided with the release artifacts.\n\n`;
  
  // Contributors
  notes += `## 👥 Contributors\n\n`;
  const contributors = [...new Set(commits.map(c => c.author))];
  contributors.forEach(author => {
    notes += `- ${author}\n`;
  });
  notes += '\n';
  
  notes += `---\n\n`;
  notes += `**Full Changelog:** [CHANGELOG.md](../CHANGELOG.md)\n`;
  
  return notes;
}

/**
 * Get last git tag
 */
function getLastTag() {
  try {
    return execSync('git describe --tags --abbrev=0', {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage:');
    console.log('  node scripts/generate-release-notes.js [version]');
    console.log('  node scripts/generate-release-notes.js --from-tag v0.1.0');
    console.log('');
    console.log('Options:');
    console.log('  --from-tag <tag>  Generate notes from specific tag to HEAD');
    console.log('  --help, -h        Show this help message');
    process.exit(0);
  }
  
  // Determine version
  let version;
  let fromTag;
  
  if (args.includes('--from-tag')) {
    const tagIndex = args.indexOf('--from-tag');
    fromTag = args[tagIndex + 1];
    version = getCurrentVersion();
  } else if (args.length > 0) {
    version = args[0].replace(/^v/, '');
  } else {
    version = getCurrentVersion();
  }
  
  // Get commits
  if (!fromTag) {
    fromTag = getLastTag();
  }
  
  console.log(`Generating release notes for v${version}...`);
  if (fromTag) {
    console.log(`Using commits from ${fromTag} to HEAD`);
  }
  
  const commits = getCommitsSinceTag(fromTag);
  console.log(`Found ${commits.length} commits`);
  
  // Generate notes
  const notes = generateReleaseNotes(version, commits);
  
  // Ensure releases directory exists
  if (!fs.existsSync(RELEASE_NOTES_DIR)) {
    fs.mkdirSync(RELEASE_NOTES_DIR, { recursive: true });
  }
  
  // Write to file
  const outputPath = path.join(RELEASE_NOTES_DIR, `v${version}.md`);
  fs.writeFileSync(outputPath, notes);
  
  console.log(`\n✓ Release notes generated: ${outputPath}`);
  console.log('\nNext steps:');
  console.log('  1. Review and edit the release notes');
  console.log('  2. Add any additional information');
  console.log('  3. Use for GitHub release or distribution');
}

// Run
main();
