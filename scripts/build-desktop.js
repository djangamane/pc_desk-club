#!/usr/bin/env node

/**
 * Desktop build script that excludes mobile-specific assets and dependencies
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🖥️  Building Planetary Chess for Desktop...\n');

// Clean previous desktop build
const desktopDistPath = join(projectRoot, 'dist-desktop');
if (existsSync(desktopDistPath)) {
  console.log('🧹 Cleaning previous desktop build...');
  rmSync(desktopDistPath, { recursive: true, force: true });
}

// Create desktop build directory
mkdirSync(desktopDistPath, { recursive: true });

try {
  // Build with desktop mode
  console.log('🔨 Building desktop application...');
  execSync('npm run build:desktop', { 
    cwd: projectRoot, 
    stdio: 'inherit' 
  });

  // Copy desktop-specific assets
  console.log('📁 Copying desktop-specific assets...');
  
  // Copy favicon and other static assets (excluding mobile-specific ones)
  const staticAssets = [
    'vite.svg',
    // Add other desktop-specific assets here
  ];

  staticAssets.forEach(asset => {
    const srcPath = join(projectRoot, 'public', asset);
    const destPath = join(desktopDistPath, asset);
    
    if (existsSync(srcPath)) {
      copyFileSync(srcPath, destPath);
      console.log(`  ✅ Copied ${asset}`);
    }
  });

  // Verify mobile dependencies are excluded
  console.log('🔍 Verifying mobile dependencies exclusion...');
  
  const buildFiles = execSync('dir /s /b dist-desktop\\*.js', { 
    cwd: projectRoot,
    encoding: 'utf8'
  }).trim().split('\n').filter(Boolean);

  let mobileDepFound = false;
  const mobileDeps = ['@capacitor/android', '@capacitor/cli', '@capacitor/core'];
  
  buildFiles.forEach(file => {
    if (existsSync(file)) {
      const content = execSync(`type "${file}"`, { encoding: 'utf8' });
      mobileDeps.forEach(dep => {
        if (content.includes(dep)) {
          console.warn(`  ⚠️  Found mobile dependency ${dep} in ${file}`);
          mobileDepFound = true;
        }
      });
    }
  });

  if (!mobileDepFound) {
    console.log('  ✅ No mobile dependencies found in desktop build');
  }

  // Analyze bundle composition
  console.log('📊 Analyzing bundle composition...');
  
  try {
    const jsFiles = execSync('dir /s /b dist-desktop\\assets\\*.js', { 
      cwd: projectRoot,
      encoding: 'utf8'
    }).trim().split('\n').filter(Boolean);

    console.log(`\n📈 Bundle Analysis:`);
    console.log(`  Total JS files: ${jsFiles.length}`);
    
    // Check for optimal chunk splitting
    const hasVendorChunk = jsFiles.some(f => f.includes('vendor'));
    const hasChessChunk = jsFiles.some(f => f.includes('chess'));
    const hasUIChunk = jsFiles.some(f => f.includes('ui'));
    
    console.log(`\n🎯 Chunk Optimization:`);
    console.log(`  Vendor chunk: ${hasVendorChunk ? '✅' : '❌'}`);
    console.log(`  Chess chunk: ${hasChessChunk ? '✅' : '❌'}`);
    console.log(`  UI chunk: ${hasUIChunk ? '✅' : '❌'}`);
    
  } catch (error) {
    console.log('  ⚠️  Bundle analysis skipped (files may not exist yet)');
  }

  // Calculate build size and performance metrics
  const buildSizeBytes = execSync('powershell -Command "(Get-ChildItem -Recurse dist-desktop | Measure-Object -Property Length -Sum).Sum"', { 
    cwd: projectRoot,
    encoding: 'utf8' 
  }).trim();
  
  const buildSizeMB = (parseFloat(buildSizeBytes) / (1024 * 1024)).toFixed(2);
  const isOptimalSize = parseFloat(buildSizeMB) < 10; // Target < 10MB for desktop
  
  console.log(`\n🎉 Desktop build completed successfully!`);
  console.log(`📦 Build size: ${buildSizeMB} MB ${isOptimalSize ? '✅' : '⚠️ (consider optimization)'}`);
  console.log(`📂 Output directory: ${desktopDistPath}`);
  
  // Performance recommendations
  if (!isOptimalSize) {
    console.log(`\n💡 Optimization suggestions:`);
    console.log(`   - Enable dynamic imports for large components`);
    console.log(`   - Consider removing unused dependencies`);
    console.log(`   - Use tree-shaking for library imports`);
  }
  console.log(`\n🚀 To preview the desktop build, run:`);
  console.log(`   cd ${projectRoot}`);
  console.log(`   npx vite preview --outDir dist-desktop`);

} catch (error) {
  console.error('❌ Desktop build failed:', error.message);
  process.exit(1);
}