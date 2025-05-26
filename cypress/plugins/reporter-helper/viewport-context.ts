import addContext from "mochawesome/addContext";

Cypress.on("test:after:run", (test) => {
  const viewportDimension = {
    width: Cypress.config("viewportWidth"),
    height: Cypress.config("viewportHeight")
  };
  addContext({ test } as Mocha.Context, {
    title: "Viewport",
    value: viewportDimension
  });
});
