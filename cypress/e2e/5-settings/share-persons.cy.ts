import { ConfigBelongsTo, ConfigStatus } from "../../support/api-resource-types";
import { getSharePerson, SharePersonType } from "../../support/fixture-utils/read-share-person";
import { DeviceModeType, NavBarSelectors } from "../../support/resource-types";
import {
  triggerEllipsisAction,
  validateActions,
  validateListItem2,
  validateListItemCard2,
  validateSwitch,
  validateViewSection2
} from "./utils/view-config-type-utils";

const validateDeleteConfirmDialog = (
  confirmActionDataSelector: "close-confirm-button" | "no-confirm-button" | "yes-confirm-button",
  deviceMode: DeviceModeType
) => {
  if (deviceMode === "large") {
    triggerEllipsisAction("delete");
  } else {
    cy.get('[data-test="card-header-actions"][data-action-id="delete"]').click();
    cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.exist");
  }

  cy.get("#delete-share-person-confirm-dialog")
    .should("be.visible")
    .within(() => {
      cy.get('[data-test="close-confirm-button"]').should("be.visible");
      cy.get(".modal-card-title").should("be.visible").should("have.text", "Remove Share Person");
      cy.get(".modal-card-body").should("be.visible").should("contain.text", "Are you sure that you want to delete Share Person");

      cy.get('[data-test="no-confirm-button"]').should("be.visible").should("contain.text", "No");
      cy.get('[data-test="yes-confirm-button"]').should("be.visible").should("contain.text", "Yes");
      cy.get('[data-test="' + confirmActionDataSelector + '"]')
        .should("be.visible")
        .click();
    });

  cy.get("#delete-share-person-confirm-dialog").should("not.be.visible");
};

const addSharePersonForm = (data: SharePersonType) => {
  cy.get('[data-test="add-action"]').should("be.visible").click();
  cy.get('[data-test="update-form"]')
    .should("be.visible")
    .within(() => {
      cy.get("#sp-email").should("be.visible").should("have.value", "").type(data.emailId);
      cy.get(`[data-switch-container-id="sp-statusswitchcheck"]`).should("be.visible").should("contain.text", "Status is Enable");

      cy.get("#sp-fn").should("be.visible").should("have.value", "").type(data.firstName);
      cy.get("#sp-ln").should("be.visible").should("have.value", "").type(data.lastName);

      if (data.nickName) {
        cy.get("#sp-nickname").should("be.visible").should("have.value", "").type(data.nickName);
      } else {
        cy.get("#sp-nickname").should("be.visible").should("have.value", "");
      }
      if (data.description) {
        cy.get("#sp-description").should("be.visible").should("have.value", "").type(data.description);
      } else {
        cy.get("#sp-description").should("be.visible").should("have.value", "");
      }
      cy.selectTags({ tagsSelectorId: "cfg-tags", addTagValues: data.tags, existingTagValues: [], removeTagValues: [] });

      // wait for debounce events to complete for inputs
      cy.wait(500);
      cy.get('[data-test="cancel-action"]').should("be.visible").should("contain.text", "Cancel");
      cy.get('[data-test="save-action"]').should("be.visible").should("contain.text", "Save").click();
    });

  cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.exist");
};

const validateSpViewSection = (data: SharePersonType, status: ConfigStatus) => {
  const viewDataList = [
    { label: "Email Id", outValue: data.emailId },
    { label: "Status", outValue: status },
    { label: "First Name", outValue: data.firstName },
    { label: "Last Name", outValue: data.lastName },
    { label: "Nick name", outValue: data.nickName || "-" },
    { label: "Phone no", outValue: "-" },
    { label: "Description", outValue: data.description || "-" },
    { label: "Tags", outValue: data.tags.join("") || "-" },
    { label: "Created Date", outValue: null },
    { label: "Last Updated Date", outValue: null }
  ];
  validateViewSection2(".view-share-person-settings", viewDataList);
};

const sharePersonTitleExtractor = (itemData: SharePersonType, itemStatus: ConfigStatus) => {
  const name = itemData.nickName || `${itemData.firstName} ${itemData.lastName}`;
  const title = `${name} - ${itemStatus}`;
  return title;
};
export const validateSpListItem = (sharePersonData: SharePersonType, sharePersonStatus: ConfigStatus, expected: "all" | "enable") => {
  validateListItem2(sharePersonData, sharePersonStatus, expected, sharePersonTitleExtractor, validateSpViewSection);
};

export const validateSpListItemCard = (sharePersonData: SharePersonType, sharePersonStatus: ConfigStatus, expected: "all" | "enable") => {
  validateListItemCard2(sharePersonData, sharePersonStatus, expected, sharePersonTitleExtractor, validateSpViewSection);
};

const clickNavLinkAndWait = (deviceMode: DeviceModeType) => {
  if (deviceMode === "large") {
    cy.clickNavLinkAndWait(NavBarSelectors.SettingsNavlink);
    cy.url().should("include", "/settings");
  } else {
    cy.clickNavLinkAndWait(NavBarSelectors.SharePersonSettingsNavlink);
    cy.url().should("include", "/settings/share-person");
  }
};

const getSharePersonSection = (deviceMode: DeviceModeType) => {
  if (deviceMode === "large") {
    cy.get("#share-person-stngs-tabhead-li").should("be.visible").click();
    cy.waitForPageLoad();
    return cy.get("#share-person-stngs-tabcontent").should("be.visible").find(`[data-test="share-person"]`);
  }

  return cy.get(`[data-test="${ConfigBelongsTo.SharePerson}"]`);
};

const runViewSharePersonsTest = (deviceMode: DeviceModeType, ref: string) => {
  cy.loginThroughUI("user1-success");

  clickNavLinkAndWait(deviceMode);

  getSharePersonSection(deviceMode)
    .should("be.visible")
    .within(() => {
      cy.get('[data-test="title"]').should("be.visible").should("contain.text", "List of Persons Sharing");
      validateActions(true);
      cy.get('[data-test="error-message"]').should("not.exist");
      cy.get('[data-test="list-section"]').should("not.exist");
      cy.get('[data-test="no-share-person-message"]').should("be.visible").should("contain.text", "There are no Share Persons configured.");
      validateSwitch(ConfigBelongsTo.SharePerson, true, false);

      getSharePerson(ref).then((sharePersonData) => {
        const validateItemFunction = deviceMode === "large" ? validateSpListItem : validateSpListItemCard;

        addSharePersonForm(sharePersonData);
        cy.get('[data-test="no-share-person-message"]').should("not.exist");
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length", 1);
        // validateSwitch(ConfigBelongsTo.SharePerson, true, false);
        validateItemFunction(sharePersonData, "enable", "enable");

        if (deviceMode === "large") {
          triggerEllipsisAction("toggleDisable");
        } else {
          cy.get('[data-test="card-header-actions"][data-action-id="toggleDisable"]').click();
          cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.exist");
        }
        cy.get('[data-test="no-share-person-message"]').should("be.visible").should("contain.text", "There are no Share Persons configured.");
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length", 0);
        validateSwitch(ConfigBelongsTo.SharePerson, true, true);
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length", 1);
        validateItemFunction(sharePersonData, "disable", "all");

        validateDeleteConfirmDialog("close-confirm-button", deviceMode);
        validateDeleteConfirmDialog("no-confirm-button", deviceMode);
        validateDeleteConfirmDialog("yes-confirm-button", deviceMode);
        cy.get('[data-test="loading-spinner"]', { timeout: 60 * 1000 }).should("not.exist");

        cy.get('[data-test="no-share-person-message"]').should("be.visible").should("contain.text", "There are no Share Persons configured.");
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length", 0);
        validateSwitch(ConfigBelongsTo.SharePerson, false, true);
        cy.get('[data-test="no-share-person-message"]').should("be.visible").should("contain.text", "There are no Share Persons configured.");
        cy.get('[data-test="list-section"] [data-test="listitem"]').should("have.length", 0);
      });
    });
};

describe("Settings - Share Person - View Flow", () => {
  afterEach(() => {
    cy.logoutFromNav();
  });

  context(
    "A logged in user can view share persons verifying details and actions",
    {
      tags: [
        "settings",
        "share-person",
        "regression",
        "positive",
        "view",
        "view-list",
        "view-share-persons-tc1",
        "add",
        "add-share-person-tc2",
        "delete",
        "delete-share-person-tc5"
      ]
    },
    () => {
      it("via Google Pixel 9 Pro", { tags: ["mobile"] }, () => {
        cy.setViewport("pixel9-pro");
        runViewSharePersonsTest("small", "share-person1");
      });

      it("via large desktop view", { tags: ["desktop"] }, () => {
        cy.setViewport("desktop");
        runViewSharePersonsTest("large", "share-person2");
      });
    }
  );
});
