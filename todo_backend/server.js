"use strict";

/**
 * Minimal bootstrap for backend.
 * NOTE: Full Express API will be added in another step. This only ensures DB is initialized.
 */

const { initDatabase } = require("./db");

function main() {
  initDatabase();
  // Placeholder: actual Express routes will be implemented in subsequent task.
  const port = process.env.PORT || 4000;
  console.log(`[backend] Database initialized. Backend server placeholder on port ${port}.`);
}

if (require.main === module) {
  main();
}
