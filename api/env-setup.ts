if (process.env.VERCEL || process.env.NOW_BUILDER) {
  // Intercept CJS require() of ESM @puppeteer/browsers in Node 24 runtime
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (id: string) {
    if (typeof id === 'string' && id.includes('@puppeteer/browsers')) {
      return {
        computeExecutablePath: () => '',
        computeSystemExecutablePath: () => '',
        getInstalledBrowsers: async () => [],
        canDownload: async () => false,
        download: async () => {},
        Browser: {},
        ChromeReleaseChannel: {},
      };
    }
    return originalRequire.apply(this, arguments);
  };

  if (!process.env.OPENWA_DATA_DIR) {
    process.env.OPENWA_DATA_DIR = '/tmp/data';
  }
  if (!process.env.MAIN_DATABASE_NAME) {
    process.env.MAIN_DATABASE_NAME = '/tmp/main.sqlite';
  }
  if (!process.env.DATABASE_NAME && process.env.DATABASE_TYPE !== 'postgres') {
    process.env.DATABASE_NAME = '/tmp/openwa.sqlite';
  }
  if (!process.env.SESSION_DATA_PATH) {
    process.env.SESSION_DATA_PATH = '/tmp/sessions';
  }
  if (!process.env.STORAGE_LOCAL_PATH) {
    process.env.STORAGE_LOCAL_PATH = '/tmp/media';
  }
  if (!process.env.PLUGIN_STATE_DIR) {
    process.env.PLUGIN_STATE_DIR = '/tmp/plugins';
  }
  if (!process.env.REDIS_ENABLED) {
    process.env.REDIS_ENABLED = 'false';
  }
  if (!process.env.QUEUE_ENABLED) {
    process.env.QUEUE_ENABLED = 'false';
  }
  if (!process.env.CACHE_ENABLED) {
    process.env.CACHE_ENABLED = 'false';
  }
  if (!process.env.AUTO_START_SESSIONS) {
    process.env.AUTO_START_SESSIONS = 'false';
  }
  if (!process.env.SERVE_DASHBOARD) {
    process.env.SERVE_DASHBOARD = 'false';
  }
}
