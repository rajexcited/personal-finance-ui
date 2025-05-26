import addContext from "mochawesome/addContext";

type TestConfig = { testConfigList?: Array<{ overrides: { tags?: Array<string> } }> };

Cypress.on("test:after:run", (test) => {
  const ctx = test as { _testConfig?: TestConfig };
  const allTags = ctx._testConfig?.testConfigList?.flatMap((cfg) => cfg.overrides.tags);
  const uniqueTags = [...new Set(allTags || [])].filter((t) => !!t);
  const tagsStr = uniqueTags.join(", ");
  addContext({ test } as Mocha.Context, { title: "Tags", value: tagsStr });
  test.title += " Tags: [" + tagsStr + "]";
});
