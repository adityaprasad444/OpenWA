const fs = require('fs');
const path = require('path');

function findFiles(dir, filename, results = []) {
  if (!fs.existsSync(dir)) return results;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== '.bin') {
          findFiles(fullPath, filename, results);
        }
      } else if (entry.name === filename) {
        results.push(fullPath);
      }
    }
  } catch {
    /* ignore read errors */
  }
  return results;
}

const root = path.join(__dirname, '..');
const nodeModules = path.join(root, 'node_modules');
const files = findFiles(nodeModules, 'ChromeLauncher.js');

let patchedCount = 0;
for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('@puppeteer/browsers')) {
      content = content.replace(
        /require\(['"]@puppeteer\/browsers[^'"]*['"]\)/g,
        '({ computeExecutablePath: () => "", computeSystemExecutablePath: () => "", getInstalledBrowsers: async () => [], canDownload: async () => false, download: async () => {}, Browser: {}, ChromeReleaseChannel: {}, CDP_WEBSOCKET_ENDPOINT_REGEX: /^$/, WEBDRIVER_BIDI_WEBSOCKET_ENDPOINT_REGEX: /^$/ })'
      );
      fs.writeFileSync(file, content, 'utf8');
      patchedCount++;
      console.log('[patch-puppeteer-browsers] Patched:', file);
    }
  } catch (err) {
    console.warn('[patch-puppeteer-browsers] Failed patching:', file, err.message);
  }
}

if (patchedCount === 0) {
  console.log('[patch-puppeteer-browsers] No ChromeLauncher.js required patching.');
}
