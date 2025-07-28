import { ConfigBelongsTo } from "../../support/api-resource-types";
import { getPurchaseTypeList } from "../../support/fixture-utils/read-config-type";
import { NavBarSelectors } from "../../support/resource-types";
import { createOrUpdatePurchaseType } from "./utils/config-type-utils";
import {
  buildConfigDataListWithStatus,
  ConfigTypeOptions,
  DeviceModeType,
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
    cy.clickNavLinkAndWait(NavBarSelectors.PurchaseTypeSettingsNavlink);
    cy.url().should("include", "/settings/purchase-type");
  }
};

const getPurchaseTypeSection = (deviceMode: DeviceModeType) => {
  if (deviceMode === "large") {
    cy.get("#purchase-type-stngs-tabhead-li").should("be.visible").click();
    cy.waitForPageLoad();
    return cy.get("#purchase-type-stngs-tabcontent").should("be.visible").find(`[data-test="purchase-type"]`);
  }

  return cy.get(`[data-test="${ConfigBelongsTo.PurchaseType}"]`);
};

const runViewPurchaseTypesTest = (deviceMode: DeviceModeType, refOptions: Array<ConfigTypeOptions>) => {
  cy.loginThroughUI("user1-success");

  for (let refOption of refOptions) {
    createOrUpdatePurchaseType(refOption);
  }
  clickNavLinkAndWait(deviceMode);

  getPurchaseTypeSection(deviceMode)
    .should("be.visible")
    .within(() => {
      cy.get('[data-test="title"]').should("be.visible").should("contain.text", "List of Purchase Type");
      validateActions(true);
      cy.get('[data-test="error-message"]').should("not.exist");

      cy.get('[data-test="list-section"]').should("be.visible");
      getPurchaseTypeList(refOptions.map((opt) => opt.ref)).then((purchaseTypeList) => {
        cy.get('[data-test="no-purchase-type-message"]').should("not.exist");
        const purchaseTypeStatusList = buildConfigDataListWithStatus(purchaseTypeList, refOptions);
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length.at.least", 1);
        validateSwitch(ConfigBelongsTo.PurchaseType, true, true);

        cy.get('[data-test="no-purchase-type-message"]').should("not.exist");
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length.at.least", 2);

        const validateItemFunction = deviceMode === "large" ? validateListItem : validateListItemCard;
        for (let purchaseTypeDataStatus of purchaseTypeStatusList) {
          validateItemFunction(purchaseTypeDataStatus, "all");
        }

        validateSwitch(ConfigBelongsTo.PurchaseType, false, true);
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length.at.least", 1);
        for (let purchaseTypeDataStatus of purchaseTypeStatusList) {
          validateItemFunction(purchaseTypeDataStatus, "enable");
        }
      });
    });
};

describe("Settings - Purchase Type - View Flow", () => {
  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in user can view purchase types verifying details and actions",
    { tags: ["settings", "purchase-type", "purchase", "expense", "regression", "positive", "view", "view-list", "view-purchase-types-tc1"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runViewPurchaseTypesTest("small", [
          { ref: "maintenance", status: "enable" },
          { ref: "home-stuffs", status: "disable" }
        ]);
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runViewPurchaseTypesTest("large", [
          { ref: "food-shopping", status: "enable" },
          { ref: "subscription", status: "disable" }
        ]);
      });
    }
  );
});
