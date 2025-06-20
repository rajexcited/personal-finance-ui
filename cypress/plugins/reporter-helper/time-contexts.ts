import addContext from "mochawesome/addContext";

type TestConfig = { testConfigList?: Array<{ overrides: { tags?: Array<string> } }> };

Cypress.on("test:before:run", (test) => {
  addContext({ test } as Mocha.Context, { title: "StartTime", value: new Date().toISOString() });
});

Cypress.on("test:after:run", (test) => {
  addContext({ test } as Mocha.Context, { title: "EndTime", value: new Date().toISOString() });
});
