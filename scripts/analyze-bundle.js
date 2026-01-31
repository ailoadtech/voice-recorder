#!/usr/bin/env node

/**
 * Bundle Analysis Script
 * Analyzes the production build output and provides size information
 */

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(process.cwd(), 'out');
const NEXT_DIR = path.join(process.cwd(), '.next');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  if (!fs.existsSync(dirPath)) {
    return 0;
  }

  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getDirectorySize(filePath);
    } else {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
}

function analyzeDirectory(dirPath, label) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  ${label} directory not found: ${dirPath}`);
    return null;
  }

  const size = getDirectorySize(dirPath);
  console.log(`📦 ${label}: ${formatBytes(size)}`);
  
  return size;
}

function analyzeBuildOutput() {
  console.log('\n🔍 Build Output Analysis\n');
  console.log('━'.repeat(50));
  
  // Analyze output directory
  const outSize = analyzeDirectory(OUT_DIR, 'Static Export (out)');
  
  // Analyze Next.js build directory
  const nextSize = analyzeDirectory(NEXT_DIR, 'Next.js Build (.next)');
  
  console.log('━'.repeat(50));
  
  // Check for large files
  if (fs.existsSync(OUT_DIR)) {
    console.log('\n📊 Largest Files in Output:\n');
    const largeFiles = findLargeFiles(OUT_DIR, 100 * 1024); // Files > 100KB
    
    if (largeFiles.length > 0) {
      largeFiles
        .sort((a, b) => b.size - a.size)
        .slice(0, 10)
        .forEach(file => {
          const relativePath = path.relative(OUT_DIR, file.path);
          console.log(`  ${formatBytes(file.size).padEnd(12)} ${relativePath}`);
        });
    } else {
      console.log('  No files larger than 100KB found.');
    }
  }
  
  // Recommendations
  console.log('\n💡 Optimization Tips:\n');
  
  if (outSize && outSize > 10 * 1024 * 1024) {
    console.log('  ⚠️  Output size is large (>10MB). Consider:');
    console.log('     - Enabling code splitting');
    console.log('     - Lazy loading components');
    console.log('     - Optimizing images and assets');
  } else if (outSize) {
    console.log('  ✅ Output size looks good!');
  }
  
  console.log('\n━'.repeat(50));
  console.log('✨ Analysis complete!\n');
}

function findLargeFiles(dirPath, minSize) {
  const largeFiles = [];
  
  function traverse(currentPath) {
    const files = fs.readdirSync(currentPath);
    
    for (const file of files) {
      const filePath = path.join(currentPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        traverse(filePath);
      } else if (stats.size > minSize) {
        largeFiles.push({
          path: filePath,
          size: stats.size
        });
      }
    }
  }
  
  traverse(dirPath);
  return largeFiles;
}

// Run analysis
try {
  analyzeBuildOutput();
} catch (error) {
  console.error('❌ Error analyzing build:', error.message);
  process.exit(1);
}
