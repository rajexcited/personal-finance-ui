import { useState, useEffect } from "react";

export enum DeviceMode {
  Mobile = "mobile",
  Desktop = "desktop"
}

export enum OrientationType {
  Potrait = "portrait-primary",
  Landscape = "landscape-primary",
  Unknown = "unknown"
}

interface OrientationOutput {
  type: OrientationType;
  width: number;
  height: number;
  requestedDevice: DeviceMode;
  resultedDevice: DeviceMode;
}
/**
 * screen dimension in positive px. negative value is considered max allowable value
 */
interface DeviceDimension {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
}
const deviceModeScreenMap: Record<DeviceMode, Record<OrientationType, DeviceDimension>> = {
  mobile: {
    "portrait-primary": {
      minWidth: -1,
      maxWidth: 768,
      minHeight: -1,
      maxHeight: -1
    },
    "landscape-primary": {
      minWidth: 768,
      maxWidth: 1100,
      minHeight: -1,
      maxHeight: -1
    },
    unknown: {
      minWidth: -1,
      maxWidth: -1,
      minHeight: -1,
      maxHeight: -1
    }
  },
  desktop: {
    "portrait-primary": {
      minWidth: -1,
      maxWidth: 1100,
      minHeight: -1,
      maxHeight: -1
    },
    "landscape-primary": {
      minWidth: 1100,
      maxWidth: -1,
      minHeight: -1,
      maxHeight: -1
    },
    unknown: {
      minWidth: -1,
      maxWidth: -1,
      minHeight: -1,
      maxHeight: -1
    }
  }
};

/**
 *
 * @param requestedDevice if not provided, desktop is assumed
 * @returns
 */
const getScreenOrientaionOutput = (requestedDevice: DeviceMode): OrientationOutput => {
  const device = requestedDevice || DeviceMode.Desktop;
  return {
    type: window.screen.orientation.type as OrientationType,
    height: window.screen.height,
    width: window.screen.width,
    requestedDevice: device,
    resultedDevice: device
  };
};

const validateOrientaionDevice = (deviceMode: DeviceMode, givenOrientation: OrientationOutput, orientationType: OrientationType) => {
  let myOrientaionType = null;
  const dimension = deviceModeScreenMap[deviceMode][orientationType];
  if (givenOrientation.width >= dimension.minWidth) {
    if (dimension.maxWidth === -1 || givenOrientation.width <= dimension.maxWidth) {
      if (givenOrientation.height >= dimension.minHeight) {
        if (dimension.maxHeight === -1 || givenOrientation.height <= dimension.maxHeight) {
          myOrientaionType = orientationType;
        }
      }
    }
  }
  return myOrientaionType;
};

const defaultOrientaionOutputMap: Partial<Record<DeviceMode, OrientationOutput>> = {};
const getDefaultOrientaionOutput = (requestedDeviceMode: DeviceMode) => {
  if (!defaultOrientaionOutputMap[requestedDeviceMode]) {
    defaultOrientaionOutputMap[requestedDeviceMode] = getScreenOrientaionOutput(requestedDeviceMode);
  }
  return defaultOrientaionOutputMap[requestedDeviceMode] as OrientationOutput;
};

const updateDefaultOrientationOutput = (updatedScreenOrientation: OrientationOutput) => {
  const defaultOrientaionOutput = defaultOrientaionOutputMap[updatedScreenOrientation.requestedDevice];
  if (defaultOrientaionOutput && defaultOrientaionOutput.resultedDevice !== updatedScreenOrientation.resultedDevice) {
    defaultOrientaionOutput.resultedDevice = updatedScreenOrientation.resultedDevice;
    defaultOrientaionOutput.height = updatedScreenOrientation.height;
    defaultOrientaionOutput.width = updatedScreenOrientation.width;
    defaultOrientaionOutput.type = updatedScreenOrientation.type;
  }
};

export const useOrientation = (deviceMode: DeviceMode) => {
  const [orientation, setOrientation] = useState(getDefaultOrientaionOutput(deviceMode));

  useEffect(() => {
    const orientationChangeHandler = () => {
      const screenOrientation = getScreenOrientaionOutput(deviceMode);
      let validatedType = validateOrientaionDevice(deviceMode, screenOrientation, screenOrientation.type);
      if (validatedType === null) {
        if (screenOrientation.type === OrientationType.Potrait) {
          const validatedType = validateOrientaionDevice(deviceMode, screenOrientation, OrientationType.Landscape);
        } else if (screenOrientation.type === OrientationType.Landscape) {
          const validatedType = validateOrientaionDevice(deviceMode, screenOrientation, OrientationType.Potrait);
        }
      }
      let resultDevice = screenOrientation.resultedDevice;
      if (validatedType === null) {
        validatedType = OrientationType.Unknown;
        // toggle device mode
        if (screenOrientation.resultedDevice === DeviceMode.Desktop) {
          resultDevice = DeviceMode.Mobile;
        } else {
          resultDevice = DeviceMode.Desktop;
        }
      }
      setOrientation({ ...screenOrientation, type: validatedType, resultedDevice: resultDevice });
      updateDefaultOrientationOutput({ ...screenOrientation, resultedDevice: resultDevice });
    };

    window.screen.orientation.addEventListener("change", orientationChangeHandler);
    orientationChangeHandler();

    return () => window.screen.orientation.removeEventListener("change", orientationChangeHandler);
  }, []);

  return orientation;
};
