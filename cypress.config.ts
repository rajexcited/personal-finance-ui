import { defineConfig } from "cypress";
import dotenvFlow from "dotenv-flow";

console.log(dotenvFlow.listFiles());
dotenvFlow.config();

// Dynamically extract all CYPRESS_ variables and strip prefix
const cypressEnvVars = Object.fromEntries(
  Object.entries(process.env)
    .filter(([key]) => key.startsWith("CYPRESS_"))
    .map(([key, value]) => [key.replace("CYPRESS_", ""), value])
);

const getDateTimeForReportsDirectory = () => {
  const now = new Date();

  // Extract parts
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(now.getDate()).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Format as MMDDYYYY_HHMMSS
  return `${month}${day}${year}_${hours}${minutes}${seconds}`;
};

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
    grepOmitFiltered: true, // Completely omits filtered-out tests
    grepFilterSpecs: true, // Ensures only matching specs run
    ...cypressEnvVars
  },
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    reportDir: "cypress/reports" + getDateTimeForReportsDirectory(),
    charts: true, // time chart
    embeddedScreenshots: true, // screenshot and video as context
    inlineAssets: true, // to add custom contexts
    saveJson: true, // json report format
    saveHtml: true, // html report format - default enable
    code: false // show/hide spec code
  }
});
