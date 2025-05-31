const { defineConfig } = require("cypress");
require('dotenv').config({ path: 'server/.env' });
const PORT = process.env.PORT || 3001;

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: `http://localhost:${PORT}`,
    pageLoadTimeout: 6000,
  },
});
