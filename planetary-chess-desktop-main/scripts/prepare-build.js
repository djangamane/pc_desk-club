#!/usr/bin/env node

/**
 * Build preparation script for Planetary Chess Desktop
 * Generates placeholder icons and prepares the build environment
 */

import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const buildDir = 'build';
const iconsDir = join(buildDir, 'icons');

console.log('🔧 Preparing Planetary Chess Desktop build environment...\n');

// Create directories
if (!existsSync(iconsDir)) {
  mkdirSync(iconsDir, { recursive: true });
  console.log('✅ Created icons directory');
}

// Generate placeholder icon sizes for Linux
const linuxIconSizes = [16, 32, 48, 64, 128, 256, 512];
linuxIconSizes.forEach(size => {
  const iconPath = join(iconsDir, `${size}x${size}.png`);
  if (!existsSync(iconPath)) {
    // Create a simple SVG placeholder that can be converted to PNG
    const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#1890ff"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="Arial" font-size="${size * 0.3}">♔</text>
</svg>`;
    writeFileSync(iconPath.replace('.png', '.svg'), svgContent);
    console.log(`📝 Created placeholder icon: ${size}x${size}.svg`);
  }
});

// Create Windows icon placeholder (ICO format)
const icoPath = join(buildDir, 'icon.ico');
if (!existsSync(icoPath)) {
  writeFileSync(icoPath + '.placeholder', '# Placeholder for Windows ICO icon (256x256)\n# Convert your app icon to ICO format and place it here as icon.ico');
  console.log('📝 Created placeholder for Windows icon (icon.ico)');
}

// Create macOS icon placeholder (ICNS format)
const icnsPath = join(buildDir, 'icon.icns');
if (!existsSync(icnsPath)) {
  writeFileSync(icnsPath + '.placeholder', '# Placeholder for macOS ICNS icon bundle\n# Convert your app icon to ICNS format and place it here as icon.icns');
  console.log('📝 Created placeholder for macOS icon (icon.icns)');
}

console.log('\n🎨 Icon Setup Instructions:');
console.log('1. Replace build/icon.ico with your 256x256 Windows icon');
console.log('2. Replace build/icon.icns with your macOS icon bundle');
console.log('3. Replace build/icons/*.svg with proper PNG icons for Linux');
console.log('4. You can use tools like:');
console.log('   - electron-icon-maker for automatic generation');
console.log('   - ImageMagick for format conversion');
console.log('   - Online converters for quick testing\n');

console.log('🚀 Build Commands:');
console.log('npm run electron:build        # Build for current platform');
console.log('npm run electron:build:win    # Build for Windows');
console.log('npm run electron:build:mac    # Build for macOS (macOS only)');
console.log('npm run electron:build:linux  # Build for Linux');
console.log('npm run electron:dist         # Build all platforms without publishing');
console.log('npm run electron:pack         # Build unpacked for testing\n');

console.log('✅ Build environment ready!');