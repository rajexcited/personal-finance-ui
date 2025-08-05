import { ConfigBelongsTo } from "../../support/api-resource-types";
import { getRefundReasonList } from "../../support/fixture-utils/read-config-type";
import { DeviceModeType, NavBarSelectors } from "../../support/resource-types";
import { createOrUpdateRefundReason } from "./utils/config-type-utils";
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
    cy.clickNavLinkAndWait(NavBarSelectors.RefundReasonSettingsNavlink);
    cy.url().should("include", "/settings/refund-reason");
  }
};

const getRefundReasonSection = (deviceMode: DeviceModeType) => {
  if (deviceMode === "large") {
    cy.get("#refund-reason-stngs-tabhead-li").should("be.visible").click();
    cy.waitForPageLoad();
    return cy.get("#refund-reason-stngs-tabcontent").should("be.visible").find(`[data-test="refund-reason"]`);
  }

  return cy.get(`[data-test="${ConfigBelongsTo.RefundReason}"]`);
};

const runViewRefundReasonsTest = (deviceMode: DeviceModeType, refOptions: Array<ConfigTypeOptions>) => {
  cy.loginThroughUI("user1-success");

  for (let refOption of refOptions) {
    createOrUpdateRefundReason(refOption);
  }
  clickNavLinkAndWait(deviceMode);

  getRefundReasonSection(deviceMode)
    .should("be.visible")
    .within(() => {
      cy.get('[data-test="title"]').should("be.visible").should("contain.text", "List of Refund Reason");
      validateActions(true);
      cy.get('[data-test="error-message"]').should("not.exist");

      cy.get('[data-test="list-section"]').should("be.visible");
      getRefundReasonList(refOptions.map((opt) => opt.ref)).then((refundReasonList) => {
        cy.get('[data-test="no-refund-reason-message"]').should("not.exist");
        const refundReasonStatusList = buildConfigDataListWithStatus(refundReasonList, refOptions);
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length.at.least", 1);
        validateSwitch(ConfigBelongsTo.RefundReason, true, true);

        cy.get('[data-test="no-refund-reason-message"]').should("not.exist");
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length.at.least", 2);

        const validateItemFunction = deviceMode === "large" ? validateListItem : validateListItemCard;
        for (let refundReasonDataStatus of refundReasonStatusList) {
          validateItemFunction(refundReasonDataStatus, "all");
        }

        validateSwitch(ConfigBelongsTo.RefundReason, false, true);
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length.at.least", 1);
        for (let refundReasonDataStatus of refundReasonStatusList) {
          validateItemFunction(refundReasonDataStatus, "enable");
        }
      });
    });
};

describe("Settings - Refund Reason - View Flow", () => {
  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in user can view refund reasons verifying details and actions",
    { tags: ["settings", "refund-reason", "refund", "expense", "regression", "positive", "view", "view-list", "view-refund-reasons-tc1"] },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runViewRefundReasonsTest("small", [
          { ref: "billing-error", status: "enable" },
          { ref: "cancelled", status: "disable" }
        ]);
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runViewRefundReasonsTest("large", [
          { ref: "overprice", status: "enable" },
          { ref: "product-defect", status: "disable" }
        ]);
      });
    }
  );
});
