import { ConfigBelongsTo, ConfigStatus } from "../../../support/api-resource-types";
import { ConfigDetailType } from "../../../support/fixture-utils/read-config-type";

export type ValidateConfigTypeCallbackFn = (belongsTo: ConfigBelongsTo, ref: string) => Cypress.Chainable<JQuery<HTMLElement>>;
export type ConfigTypeOptions = { ref: string; status: ConfigStatus };
export type DeviceModeType = "large" | "small";
type ConfigDataStatus = { data: ConfigDetailType; status: ConfigStatus };

const validateViewSection = (dataStatus: ConfigDataStatus) => {
  cy.get(".view-config-settings")
    .should("be.visible")
    .within(() => {
      const viewDataList = [
        { label: "Name", outValue: dataStatus.data.name },
        { label: "Status", outValue: dataStatus.status },
        { label: "Color", outValue: "-" },
        { label: "Description", outValue: dataStatus.data.description || "-" },
        { label: "Tags", outValue: dataStatus.data.tags.join("") || "-" },
        { label: "Created Date", outValue: null },
        { label: "Last Updated Date", outValue: null }
      ];

      cy.get(".column").each(($cel, ind) => {
        cy.wrap($cel.find(".label")).should("be.visible").should("contain.text", viewDataList[ind].label);
        if (viewDataList[ind].outValue === null) {
          cy.wrap($cel.find('[data-test="outvalue"]')).should("be.visible");
        } else {
          cy.wrap($cel.find('[data-test="outvalue"]')).should("be.visible").should("have.text", viewDataList[ind].outValue);
        }
      });
    });
};

const validateEllipsisActions = (status: ConfigStatus) => {
  cy.get('[data-test="actions-before-ellipsis"]')
    .should("have.length", 1)
    .should("be.visible")
    .should("have.attr", "data-action-id", "view")
    .should("contain.text", "View");

  cy.get('[data-test="ellipsis-dropdown-menu"]').should("not.be.visible");
  cy.get('button[data-test="action-ellipsis"]').should("be.visible");
  cy.get(".dropdown.is-hoverable").realHover();
  cy.get('[data-test="ellipsis-dropdown-menu"]')
    .should("be.visible")
    .within(() => {
      const actionsInEllipsis = [
        { id: "update", text: "Edit" },
        { id: "delete", text: "Delete" }
      ];

      if (status === "enable") {
        actionsInEllipsis.push({ id: "toggleDisable", text: "Change to Disable" });
      }

      if (status === "disable") {
        actionsInEllipsis.push({ id: "toggleEnable", text: "Change to Enable" });
      }

      cy.get('[data-test="actions-in-ellipsis"]')
        .should("have.length", 3)
        .each(($el, ind) => {
          cy.wrap($el)
            .should("be.visible")
            .should("have.attr", "data-action-id", actionsInEllipsis[ind].id)
            .should("contain.text", actionsInEllipsis[ind].text);
        });
    });
  cy.get(".dropdown.is-hoverable").realMouseMove(10, 10, { position: "right" });
};

export const validateActions = (isAddOnly: boolean) => {
  cy.get('[data-test="add-action"]').should("be.visible");
  if (isAddOnly) {
    cy.get('[data-test="edit-action"]').should("not.exist");
    cy.get('[data-test="delete-action"]').should("not.exist");
  } else {
    cy.get('[data-test="edit-action"]').should("be.visible");
    cy.get('[data-test="delete-action"]').should("be.visible");
  }
};

const validateCardActions = (status: ConfigStatus) => {
  const cardActions = [
    { id: "update", text: "Edit" },
    { id: "delete", text: "Delete" }
  ];
  if (status === "enable") {
    cardActions.push({ id: "toggleDisable", text: "Change to Disable" });
  }
  if (status === "disable") {
    cardActions.push({ id: "toggleEnable", text: "Change to Enable" });
  }
  cardActions.push({ id: "view", text: "" });
  cy.get('[data-test="card-header-actions"]')
    .should("have.length", 4)
    .each(($el, ind) => {
      cy.wrap($el).should("be.visible").should("have.attr", "data-action-id", cardActions[ind].id).should("contain.text", cardActions[ind].text);
    });
};

export const validateListItem = (dataStatus: ConfigDataStatus, expected: "all" | "enable") => {
  const title = dataStatus.data.name + " - " + dataStatus.status;
  if (expected === "enable" && dataStatus.status !== "enable") {
    cy.get(`[data-test="list-section"]`).find(`[data-test="listitem"][data-title="${title}"]`).should("not.exist");
    return;
  }
  cy.get('[data-test="list-section"]').within(() => {
    cy.get(`[data-test="listitem"][data-title="${title}"]`)
      .should("have.length.at.least", 1)
      .first()
      .should("be.visible")
      .within(() => {
        cy.get(".list-item-title").should("contain.text", dataStatus.data.name).should("contain.text", dataStatus.status);
        if (dataStatus.data.description) {
          cy.get(".list-item-description").should("contain.text", dataStatus.data.description.substring(0, 40));
        } else {
          cy.get(".list-item-description").should("have.text", "-");
        }

        validateEllipsisActions(dataStatus.status);
      });

    cy.get(`[data-test="listitem"][data-title="${title}"] [data-action-id="view"]`).should("be.visible").click();
  });
  cy.get('[data-test="edit-action"]').should("be.visible");
  cy.get('[data-test="delete-action"]').should("be.visible");
  validateViewSection(dataStatus);
};

export const validateListItemCard = (dataStatus: ConfigDataStatus, expected: "all" | "enable") => {
  const title = dataStatus.data.name + " - " + dataStatus.status;
  if (expected === "enable" && dataStatus.status !== "enable") {
    cy.get(`[data-test="list-section"]`).find(`[data-test="listitem"][data-title="${title}"]`).should("not.exist");
    return;
  }
  cy.get('[data-test="list-section"]').within(() => {
    cy.get(`[data-test="listitem"][data-title="${title}"]`)
      .should("have.length.at.least", 1)
      .first()
      .should("be.visible")
      .within(() => {
        if (title.length < 25) {
          cy.get(".list-item-title").should("contain.text", dataStatus.data.name).should("contain.text", dataStatus.status);
        } else {
          cy.get(".list-item-title").should("contain.text", title.substring(0, 25));
        }
        if (dataStatus.data.description) {
          cy.get(".list-item-description").should("contain.text", dataStatus.data.description.substring(0, 37));
        } else {
          cy.get(".list-item-description").should("have.text", "-");
        }

        validateCardActions(dataStatus.status);

        cy.get(`[data-test="card-header-actions"][data-action-id="view"]`).should("be.visible").click();
        cy.get(".card-content.is-active").should("be.visible");
        validateViewSection(dataStatus);
        cy.get(`[data-test="card-header-actions"][data-action-id="view"]`).should("be.visible").click();
        cy.get(".card-content.is-active").should("not.exist");
      });
  });
};

export const validateSwitch = (belongsTo: ConfigBelongsTo, isOn: boolean, doToggle?: boolean) => {
  let containerId = "";
  const labelTextOn = "Filtered by enabled";
  let labelTextOff = "All";
  if (belongsTo === ConfigBelongsTo.IncomeType) {
    containerId = "incomeTypeEnableFilterswitchcheck";
    if (!isOn) {
      labelTextOff = "All Income Types";
    }
  } else if (belongsTo === ConfigBelongsTo.PurchaseType) {
    containerId = "purchaseTypeEnableFilterswitchcheck";
    if (!isOn) {
      labelTextOff = "All Purchase Types";
    }
  } else if (belongsTo === ConfigBelongsTo.RefundReason) {
    containerId = "refundReasonEnableFilterswitchcheck";
    if (!isOn) {
      labelTextOff = "All Refund Reasons";
    }
  }
  cy.get(`[data-switch-container-id="${containerId}"]`)
    .should("be.visible")
    .within(() => {
      if (isOn) {
        cy.get('input[type="checkbox"]').should("be.checked");
        cy.get("label").should("contain.text", labelTextOn).should("be.visible");
      } else {
        cy.get('input[type="checkbox"]').should("not.be.checked");
        cy.get("label").should("contain.text", labelTextOff).should("be.visible");
      }
      if (doToggle) {
        cy.get("label").click();
        // previous state isOn ?
        if (isOn) {
          cy.get("label").should("contain.text", labelTextOff).should("be.visible");
        } else {
          cy.get("label").should("contain.text", labelTextOn).should("be.visible");
        }
      }
    });
};

export const buildConfigDataListWithStatus = (configDataList: ConfigDetailType[], refOptions: ConfigTypeOptions[]) => {
  const configMap: Record<string, ConfigDataStatus> = {};
  configDataList.forEach((data) => {
    configMap[data.ref] = {
      data: data,
      status: refOptions.find((ro) => ro.ref === data.ref)?.status || "deleted"
    };
  });
  return Object.values(configMap);
};
