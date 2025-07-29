import { ConfigBelongsTo } from "../../support/api-resource-types";
import { getPaymentAccountTypeList } from "../../support/fixture-utils/read-config-type";
import { NavBarSelectors } from "../../support/resource-types";
import { createOrUpdatePaymentAccountType } from "./utils/config-type-utils";
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
    cy.clickNavLinkAndWait(NavBarSelectors.PaymentAccountTypeSettingsNavlink);
    cy.url().should("include", "/settings/payment-account-type");
  }
};

const getPaymentAccountTypeSection = (deviceMode: DeviceModeType) => {
  if (deviceMode === "large") {
    cy.get("#payment-account-type-stngs-tabhead-li").should("be.visible").click();
    cy.waitForPageLoad();
    return cy.get("#payment-account-type-stngs-tabcontent").should("be.visible").find(`[data-test="pymt-account-type"]`);
  }

  return cy.get(`[data-test="${ConfigBelongsTo.PaymentAccountType}"]`);
};

const runViewPaymentAccountTypesTest = (deviceMode: DeviceModeType, refOptions: Array<ConfigTypeOptions>) => {
  cy.loginThroughUI("user1-success");

  for (let refOption of refOptions) {
    createOrUpdatePaymentAccountType(refOption);
  }
  clickNavLinkAndWait(deviceMode);

  getPaymentAccountTypeSection(deviceMode)
    .should("be.visible")
    .within(() => {
      cy.get('[data-test="title"]').should("be.visible").should("contain.text", "List of Payment Account Type");
      validateActions(true);
      cy.get('[data-test="error-message"]').should("not.exist");

      cy.get('[data-test="list-section"]').should("be.visible");
      getPaymentAccountTypeList(refOptions.map((opt) => opt.ref)).then((paymentAccountTypeList) => {
        cy.get('[data-test="no-payment-account-type-message"]').should("not.exist");
        const paymentAccountTypeStatusList = buildConfigDataListWithStatus(paymentAccountTypeList, refOptions);
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length.at.least", 1);
        validateSwitch(ConfigBelongsTo.PaymentAccountType, true, true);

        cy.get('[data-test="no-payment-account-type-message"]').should("not.exist");
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length.at.least", 2);

        const validateItemFunction = deviceMode === "large" ? validateListItem : validateListItemCard;
        for (let paymentAccountTypeDataStatus of paymentAccountTypeStatusList) {
          validateItemFunction(paymentAccountTypeDataStatus, "all");
        }

        validateSwitch(ConfigBelongsTo.PaymentAccountType, false, true);
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length.at.least", 1);
        for (let paymentAccountTypeDataStatus of paymentAccountTypeStatusList) {
          validateItemFunction(paymentAccountTypeDataStatus, "enable");
        }
      });
    });
};

describe("Settings - Payment Account Type - View Flow", () => {
  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in user can view payment account types verifying details and actions",
    {
      tags: ["settings", "payment-account-type", "payment-account", "regression", "positive", "view", "view-list", "view-payment-account-types-tc1"]
    },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runViewPaymentAccountTypesTest("small", [
          { ref: "savings", status: "enable" },
          { ref: "gift-card", status: "disable" }
        ]);
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runViewPaymentAccountTypesTest("large", [
          { ref: "credit-card", status: "enable" },
          { ref: "loan", status: "disable" }
        ]);
      });
    }
  );
});
