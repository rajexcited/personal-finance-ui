import { defineConfig } from "cypress";
import { config } from "dotenv";

config();

export default defineConfig({
  e2e: {
    baseUrl: process.env.SITE_BASE_URL,
    video: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      console.log("config=", config);
      require("@cypress/grep/src/plugin")(config);
      require("cypress-mochawesome-reporter/plugin")(on);
      return config;
    }
  },
  env: {
    envId: process.env.ENV_ID,
    uiVersion: process.env.UI_VERSION,
    apiVersion: process.env.API_VERSION,
    apiBase: "/api",
    grepTags: process.env.TEST_TYPE,
    grepOmitFiltered: true, // Completely omits filtered-out tests
    grepFilterSpecs: true // Ensures only matching specs run
  },
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports",
    charts: true, // time chart
    embeddedScreenshots: true, // screenshot and video as context
    inlineAssets: true, // to add custom contexts
    saveJson: true, // json report format
    saveHtml: true, // html report format - default enable
    code: false // show/hide spec code
  }
});
