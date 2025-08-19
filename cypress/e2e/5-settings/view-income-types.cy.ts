import { ConfigBelongsTo } from "../../support/api-resource-types";
import { getIncomeTypeList } from "../../support/fixture-utils/read-config-type";
import { DeviceModeType, NavBarSelectors } from "../../support/resource-types";
import { createOrUpdateIncomeType } from "./utils/config-type-utils";
import {
  buildConfigDataListWithStatus,
  ConfigTypeOptions,
  validateActions,
  validateListItem,
  validateListItemCard,
  validateSwitch
} from "./utils/view-config-type-utils";

const clickNavLinkAndWait = (deviceMode: DeviceModeType) => {
  if (deviceMode === "large") {
    cy.clickNavLinkAndWait(NavBarSelectors.SettingsNavlink);
    cy.url().should("include", "/settings");
  } else {
    cy.clickNavLinkAndWait(NavBarSelectors.IncomeTypeSettingsNavlink);
    cy.url().should("include", "/settings/income-type");
  }
};

const getIncomeTypeSection = (deviceMode: DeviceModeType) => {
  if (deviceMode === "large") {
    cy.get("#income-type-stngs-tabhead-li").should("be.visible").click();
    cy.waitForPageLoad();
    return cy.get("#income-type-stngs-tabcontent").should("be.visible").find(`[data-test="income-type"]`);
  }

  return cy.get(`[data-test="${ConfigBelongsTo.IncomeType}"]`);
};

const runViewIncomeTypesTest = (deviceMode: DeviceModeType, refOptions: Array<ConfigTypeOptions>) => {
  cy.loginThroughUI("user1-success");

  for (let refOption of refOptions) {
    createOrUpdateIncomeType(refOption);
  }
  clickNavLinkAndWait(deviceMode);

  getIncomeTypeSection(deviceMode)
    .should("be.visible")
    .within(() => {
      cy.get('[data-test="title"]').should("be.visible").should("contain.text", "List of Income Type");
      validateActions(true);
      cy.get('[data-test="error-message"]').should("not.exist");

      cy.get('[data-test="list-section"]').should("be.visible");
      getIncomeTypeList(refOptions.map((opt) => opt.ref)).then((incomeTypeList) => {
        cy.get('[data-test="no-income-type-message"]').should("not.exist");
        const incomeTypeStatusList = buildConfigDataListWithStatus(incomeTypeList, refOptions);
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length.at.least", 1);
        validateSwitch(ConfigBelongsTo.IncomeType, true, true);

        cy.get('[data-test="no-income-type-message"]').should("not.exist");
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length.at.least", 2);

        const validateItemFunction = deviceMode === "large" ? validateListItem : validateListItemCard;
        for (let incomeTypeDataStatus of incomeTypeStatusList) {
          validateItemFunction(incomeTypeDataStatus, "all");
        }

        validateSwitch(ConfigBelongsTo.IncomeType, false, true);
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length.at.least", 1);
        for (let incomeTypeDataStatus of incomeTypeStatusList) {
          validateItemFunction(incomeTypeDataStatus, "enable");
        }
      });
    });
};

describe("Settings - Income Type - View Flow", () => {
  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in user can view income types verifying details and actions",
    { tags: ["settings", "income-type", "income", "expense", "regression", "positive", "view", "view-list", "view-income-types-tc1"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runViewIncomeTypesTest("small", [
          { ref: "rental-income", status: "enable" },
          { ref: "passive-income", status: "disable" }
        ]);
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runViewIncomeTypesTest("large", [
          { ref: "dividend", status: "enable" },
          { ref: "salary", status: "disable" }
        ]);
      });
    }
  );
});
