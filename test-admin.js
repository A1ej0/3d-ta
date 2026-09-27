const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());

try {
  console.log("Loading firebase-admin...");
  require('./src/lib/firebase-admin.ts');
  console.log("Loaded successfully");
} catch (e) {
  console.error("Error loading firebase-admin:", e);
}
