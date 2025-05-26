export type CustomDevicePreset = "desktop" | "pixel9-pro";

interface PresetDetailType {
  width: number;
  height: number;
  viewportOrientation: Cypress.ViewportOrientation;
}

const customViewports: Record<CustomDevicePreset, PresetDetailType> = {
  desktop: {
    width: 1920,
    height: 1080,
    viewportOrientation: "landscape"
  },
  "pixel9-pro": {
    width: 412,
    height: 915,
    viewportOrientation: "portrait"
  }
};

export const setCustomViewPortPreset = (device: CustomDevicePreset | Cypress.ViewportPreset, orientation?: Cypress.ViewportOrientation) => {
  if (device in customViewports) {
    const presetDetails = customViewports[device as CustomDevicePreset];
    if (orientation && orientation !== presetDetails.viewportOrientation) {
      return cy.viewport(presetDetails.height, presetDetails.width, { log: true });
    } else {
      return cy.viewport(presetDetails.width, presetDetails.height, { log: true });
    }
  }
};
