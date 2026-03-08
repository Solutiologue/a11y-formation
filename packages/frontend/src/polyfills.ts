// Polyfill for process object in browser environment
if (typeof process === 'undefined') {
  (globalThis as any).process = {
    env: {},
    platform: 'browser',
    version: 'v0.0.0',
  }
}
