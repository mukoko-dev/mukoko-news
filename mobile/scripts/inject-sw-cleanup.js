#!/usr/bin/env node
/**
 * Post-build script to inject service worker cleanup into index.html
 * This ensures the cleanup runs before ANY cached JavaScript
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');

// The cleanup script that runs immediately
const cleanupScript = `
    <!-- CRITICAL: Service worker cleanup for mobile users - runs BEFORE any JS -->
    <script>
      (function() {
        console.log('[Mukoko] Startup cleanup running...');
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(function(r) {
            console.log('[Mukoko] Found ' + r.length + ' service worker(s)');
            r.forEach(function(reg) { reg.unregister(); });
          });
        }
        if ('caches' in window) {
          caches.keys().then(function(n) {
            console.log('[Mukoko] Clearing ' + n.length + ' cache(s)');
            n.forEach(function(name) { caches.delete(name); });
          });
        }
      })();
    </script>
`;

try {
  let html = fs.readFileSync(indexPath, 'utf8');

  // Check if cleanup script already exists
  if (html.includes('[Mukoko] Startup cleanup')) {
    console.log('Cleanup script already present, skipping...');
    process.exit(0);
  }

  // Inject after <title> tag
  html = html.replace('</title>', '</title>' + cleanupScript);

  fs.writeFileSync(indexPath, html);
  console.log('Successfully injected service worker cleanup script into index.html');
} catch (error) {
  console.error('Error injecting cleanup script:', error.message);
  process.exit(1);
}
