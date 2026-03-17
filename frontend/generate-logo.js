#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Expirio Logo & Asset Generator
 * Creates professional icons and splash screen using canvas
 */

async function generateAssets() {
  try {
    console.log('🎨 Generating professional Expirio assets...\n');

    // Try to use canvas for high-quality assets
    try {
      const canvas = require('canvas');
      await generateWithCanvas(canvas);
    } catch (err) {
      console.warn('⚠️ Canvas library not found, using fallback method');
      generateWithFallback();
    }
  } catch (error) {
    console.error('❌ Error generating assets:', error.message);
    process.exit(1);
  }
}

async function generateWithCanvas(canvas) {
  const { createCanvas } = canvas;
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Color Palette (Modern Purple & Gradient)
  const PRIMARY_COLOR = '#667eea';
  const SECONDARY_COLOR = '#764ba2';
  const ACCENT_COLOR = '#f093fb';
  const WHITE = '#ffffff';
  const DARK_BG = '#1a1a2e';

  // 1. MAIN APP ICON (1024x1024px)
  const iconCanvas = createCanvas(1024, 1024);
  const iconCtx = iconCanvas.getContext('2d');

  // Background gradient
  const iconGradient = iconCtx.createLinearGradient(0, 0, 1024, 1024);
  iconGradient.addColorStop(0, PRIMARY_COLOR);
  iconGradient.addColorStop(1, SECONDARY_COLOR);
  iconCtx.fillStyle = iconGradient;
  iconCtx.fillRect(0, 0, 1024, 1024);

  // Rounded corners
  iconCtx.clearRect(0, 0, 40, 40);
  iconCtx.clearRect(984, 0, 40, 40);
  iconCtx.clearRect(0, 984, 40, 40);
  iconCtx.clearRect(984, 984, 40, 40);

  // Center circle (modern design)
  iconCtx.fillStyle = WHITE;
  iconCtx.beginPath();
  iconCtx.arc(512, 512, 380, 0, Math.PI * 2);
  iconCtx.fill();

  // Inner icon - stylized hourglass at center
  drawHourglass(iconCtx, 512, 512, 200, SECONDARY_COLOR);

  // Save icon
  const iconBuffer = iconCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'icon.png'), iconBuffer);
  console.log('✅ Created icon.png (1024×1024px)');

  // 2. ADAPTIVE ICON (For Android 8+) - 1024x1024px
  const adaptiveCanvas = createCanvas(1024, 1024);
  const adaptiveCtx = adaptiveCanvas.getContext('2d');

  // Background
  const adaptiveGradient = adaptiveCtx.createLinearGradient(0, 0, 1024, 1024);
  adaptiveGradient.addColorStop(0, PRIMARY_COLOR);
  adaptiveGradient.addColorStop(1, SECONDARY_COLOR);
  adaptiveCtx.fillStyle = adaptiveGradient;
  adaptiveCtx.fillRect(0, 0, 1024, 1024);

  // Circular center design
  adaptiveCtx.fillStyle = WHITE;
  adaptiveCtx.beginPath();
  adaptiveCtx.arc(512, 512, 350, 0, Math.PI * 2);
  adaptiveCtx.fill();

  // Inner hourglass
  drawHourglass(adaptiveCtx, 512, 512, 180, SECONDARY_COLOR);

  // Save adaptive icon
  const adaptiveBuffer = adaptiveCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), adaptiveBuffer);
  console.log('✅ Created adaptive-icon.png (1024×1024px)');

  // 3. SPLASH SCREEN (1080x1920px - Full Phone Screen)
  const splashCanvas = createCanvas(1080, 1920);
  const splashCtx = splashCanvas.getContext('2d');

  // Gradient background
  const splashGradient = splashCtx.createLinearGradient(0, 0, 1080, 1920);
  splashGradient.addColorStop(0, PRIMARY_COLOR);
  splashGradient.addColorStop(0.5, '#6c5ce7');
  splashGradient.addColorStop(1, SECONDARY_COLOR);
  splashCtx.fillStyle = splashGradient;
  splashCtx.fillRect(0, 0, 1080, 1920);

  // Decorative circles in background
  splashCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  splashCtx.beginPath();
  splashCtx.arc(200, 300, 150, 0, Math.PI * 2);
  splashCtx.fill();

  splashCtx.beginPath();
  splashCtx.arc(950, 500, 200, 0, Math.PI * 2);
  splashCtx.fill();

  splashCtx.beginPath();
  splashCtx.arc(100, 1700, 180, 0, Math.PI * 2);
  splashCtx.fill();

  splashCtx.beginPath();
  splashCtx.arc(1000, 1800, 160, 0, Math.PI * 2);
  splashCtx.fill();

  // Logo circle in center
  splashCtx.fillStyle = WHITE;
  splashCtx.beginPath();
  splashCtx.arc(540, 800, 250, 0, Math.PI * 2);
  splashCtx.fill();

  // Hourglass in logo
  drawHourglass(splashCtx, 540, 800, 150, SECONDARY_COLOR);

  // App name
  splashCtx.font = 'bold 90px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
  splashCtx.fillStyle = WHITE;
  splashCtx.textAlign = 'center';
  splashCtx.textBaseline = 'middle';
  splashCtx.fillText('Expirio', 540, 1150);

  // Tagline
  splashCtx.font = '60px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
  splashCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  splashCtx.fillText('Smart Expiry Tracker', 540, 1250);

  // Loading indicator
  splashCtx.font = 'bold 50px -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif';
  splashCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  splashCtx.fillText('Loading...', 540, 1400);

  // Save splash
  const splashBuffer = splashCanvas.toBuffer('image/png');
  fs.writeFileSync(path.join(assetsDir, 'splash.png'), splashBuffer);
  console.log('✅ Created splash.png (1080×1920px)');

  console.log('\n✨ All assets generated successfully!\n');
}

function drawHourglass(ctx, x, y, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.12;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Outer rectangle
  ctx.strokeRect(x - size * 0.4, y - size * 0.4, size * 0.8, size * 0.8);

  // Top triangle
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.2);
  ctx.lineTo(x + size * 0.3, y - size * 0.2);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.stroke();

  // Bottom triangle
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y + size * 0.2);
  ctx.lineTo(x + size * 0.3, y + size * 0.2);
  ctx.lineTo(x, y);
  ctx.closePath();
  ctx.stroke();

  // Center line
  ctx.beginPath();
  ctx.moveTo(x - size * 0.05, y - size * 0.05);
  ctx.lineTo(x + size * 0.05, y + size * 0.05);
  ctx.stroke();
}

function generateWithFallback() {
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  console.log('📝 Generating placeholder PNG files...');

  // Create minimal valid PNG files (fallback)
  const minimalPNG = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x04, 0x00, 0x00, 0x00, 0x04, 0x00, 0x08, 0x02, 0x00, 0x00, 0x00, 0x9d, 0x37, 0xcd,
    0xf2, 0x00, 0x00, 0x00, 0x19, 0x74, 0x45, 0x58, 0x74, 0x53, 0x6f, 0x66, 0x74, 0x77, 0x61, 0x72,
    0x65, 0x00, 0x41, 0x64, 0x6f, 0x62, 0x65, 0x20, 0x49, 0x6d, 0x61, 0x67, 0x65, 0x52, 0x65, 0x61,
    0x64, 0x79, 0x71, 0xc9, 0x65, 0x3c, 0x00, 0x00, 0x04, 0x00, 0x49, 0x44, 0x41, 0x54, 0x78, 0xda,
    0xec, 0xc1, 0x01, 0x01, 0x00, 0x00, 0x00, 0xc2, 0xa0, 0xf5, 0x4f, 0xed, 0x61, 0x0d, 0xa0, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0xff, 0xff, 0xff, 0x3f, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0xfe, 0xa5, 0xa3, 0x71, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60,
    0x82,
  ]);

  fs.writeFileSync(path.join(assetsDir, 'icon.png'), minimalPNG);
  fs.writeFileSync(path.join(assetsDir, 'adaptive-icon.png'), minimalPNG);
  fs.writeFileSync(path.join(assetsDir, 'splash.png'), minimalPNG);

  console.log('✅ Created icon.png (fallback)');
  console.log('✅ Created adaptive-icon.png (fallback)');
  console.log('✅ Created splash.png (fallback)');
  console.log('⚠️  Install canvas for better quality: npm install canvas\n');
}

// Run generator
generateAssets();
