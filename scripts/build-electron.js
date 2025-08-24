#!/usr/bin/env node

/**
 * Simple build script for Electron main process
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('Building Electron main process...');

// Clean previous electron build
const electronDistPath = join(projectRoot, 'dist-electron');
if (existsSync(electronDistPath)) {
  console.log('Cleaning previous electron build...');
  rmSync(electronDistPath, { recursive: true, force: true });
}

// Create electron build directory
mkdirSync(electronDistPath, { recursive: true });

try {
  // Build electron main process with tsc
  console.log('Compiling Electron main process with TypeScript...');
  execSync('npx tsc --project tsconfig.electron.json', { 
    cwd: projectRoot, 
    stdio: 'inherit' 
  });
  
  console.log('Electron build completed successfully!');
} catch (error) {
  console.error('Electron build failed:', error.message);
  process.exit(1);
}