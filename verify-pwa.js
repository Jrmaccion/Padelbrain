/**
 * PWA Setup Verification Script
 * Run with: node verify-pwa.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying PWA Setup for PadelBrain...\n');

let errors = 0;
let warnings = 0;

// Check 1: Service Worker
const swPath = path.join(__dirname, 'public', 'sw.js');
if (fs.existsSync(swPath)) {
  console.log('✅ Service Worker found: public/sw.js');
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (swContent.includes('CACHE_NAME')) {
    console.log('   └─ Cache configuration present');
  }
} else {
  console.log('❌ Service Worker NOT found: public/sw.js');
  errors++;
}

// Check 2: Manifest
const manifestPath = path.join(__dirname, 'public', 'manifest.json');
if (fs.existsSync(manifestPath)) {
  console.log('✅ Manifest found: public/manifest.json');
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    if (manifest.icons && manifest.icons.length > 0) {
      console.log(`   └─ ${manifest.icons.length} icons configured`);
    } else {
      console.log('⚠️  Warning: No icons in manifest');
      warnings++;
    }
    if (manifest.display === 'standalone') {
      console.log('   └─ Display mode: standalone ✓');
    }
  } catch (e) {
    console.log('❌ Invalid manifest.json:', e.message);
    errors++;
  }
} else {
  console.log('❌ Manifest NOT found: public/manifest.json');
  errors++;
}

// Check 3: Icons
const requiredIcons = [
  'pwa-64x64.png',
  'pwa-192x192.png',
  'pwa-512x512.png',
  'pwa-512x512-maskable.png',
  'favicon.svg'
];

console.log('✅ Checking PWA icons:');
requiredIcons.forEach(icon => {
  const iconPath = path.join(__dirname, 'public', icon);
  if (fs.existsSync(iconPath)) {
    const stats = fs.statSync(iconPath);
    console.log(`   ✓ ${icon} (${(stats.size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`   ❌ ${icon} NOT found`);
    errors++;
  }
});

// Check 4: HTML
const htmlPath = path.join(__dirname, 'public', 'index.html');
if (fs.existsSync(htmlPath)) {
  console.log('✅ HTML found: public/index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  if (htmlContent.includes('serviceWorker.register')) {
    console.log('   └─ Service Worker registration present');
  } else {
    console.log('   ⚠️  Service Worker registration NOT found');
    warnings++;
  }

  if (htmlContent.includes('rel="manifest"')) {
    console.log('   └─ Manifest link present');
  } else {
    console.log('   ❌ Manifest link NOT found');
    errors++;
  }

  if (htmlContent.includes('apple-touch-icon')) {
    console.log('   └─ Apple touch icons configured');
  } else {
    console.log('   ⚠️  Apple touch icons NOT configured');
    warnings++;
  }
} else {
  console.log('❌ HTML NOT found: public/index.html');
  errors++;
}

// Check 5: PWA Install Component
const componentPath = path.join(__dirname, 'src', 'components', 'common', 'PWAInstallPrompt.tsx');
if (fs.existsSync(componentPath)) {
  console.log('✅ PWA Install Prompt component found');
} else {
  console.log('⚠️  PWA Install Prompt component NOT found');
  warnings++;
}

// Check 6: App.tsx integration
const appPath = path.join(__dirname, 'App.tsx');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf8');
  if (appContent.includes('PWAInstallPrompt')) {
    console.log('✅ PWA Install Prompt integrated in App.tsx');
  } else {
    console.log('⚠️  PWA Install Prompt NOT imported in App.tsx');
    warnings++;
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('🎉 Perfect! PWA setup is complete and ready to deploy!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run web (to test locally)');
  console.log('2. Run: npm run build:web (to build for production)');
  console.log('3. Deploy dist/ folder to your hosting');
  console.log('\nSee PWA_SETUP.md for detailed instructions.');
} else {
  console.log(`⚠️  Setup complete with ${errors} error(s) and ${warnings} warning(s)`);
  if (errors > 0) {
    console.log('❌ Please fix errors before deploying');
  }
  if (warnings > 0) {
    console.log('⚠️  Warnings are optional but recommended to fix');
  }
}
console.log('='.repeat(50) + '\n');

process.exit(errors > 0 ? 1 : 0);
