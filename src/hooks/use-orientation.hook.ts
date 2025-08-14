import { useState, useEffect } from "react";
import _ from "lodash";
import { getLogger } from "../shared";

const isDesktopAgent = () => !/Mobi|Android/i.test(navigator.userAgent);

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

const hookLogger = getLogger("Hook.orientation", null, null, "DISABLED");

const observeAndUpdateOrientation = (argMethod: () => void) => {
  let prevWinHeight = window.innerHeight;
  let prevWinWidth = window.innerWidth;
  const debouncedMethod = _.debounce(argMethod, 200);
  if (isDesktopAgent()) {
    const observer = new ResizeObserver(() => {
      if (prevWinHeight !== window.innerHeight || prevWinWidth !== window.innerWidth) {
        prevWinHeight = window.innerHeight;
        prevWinWidth = window.innerWidth;
        debouncedMethod();
      }
    });

    observer.observe(document.body);
    return observer;
  }
  return null;
};

/**
 *
 * @param requestedDevice if not provided, desktop is assumed
 * @returns
 */
const getScreenOrientaionOutput = (requestedDevice: DeviceMode): OrientationOutput => {
  const device = requestedDevice || DeviceMode.Desktop;
  let orientationType = window.screen.orientation.type as OrientationType;
  if (isDesktopAgent()) {
    orientationType = window.innerWidth > window.innerHeight ? OrientationType.Landscape : OrientationType.Potrait;
  }
  return {
    type: orientationType,
    height: window.innerHeight,
    width: window.innerWidth,
    requestedDevice: device,
    resultedDevice: device
  };
};

/**
 * based on given device and orientation type, validates given orientation type needs to be differ or not.
 *
 * @param deviceMode
 * @param givenOrientation
 * @param orientationType
 * @returns
 */
const validateOrientaionDevice = (deviceMode: DeviceMode, givenOrientation: OrientationOutput, orientationType: OrientationType) => {
  const logger = getLogger("validateOrientaionDevice", hookLogger);
  let myOrientaionType = null;
  const dimension = deviceModeScreenMap[deviceMode][orientationType];
  logger.debug("dimension=", dimension, " and givenOrientation=", { width: givenOrientation.width, height: givenOrientation.height });
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
    const logger = getLogger("useEffect.dep[]", hookLogger);
    const orientationChangeHandler = () => {
      const screenOrientation = getScreenOrientaionOutput(deviceMode);
      let validatedType = validateOrientaionDevice(deviceMode, screenOrientation, screenOrientation.type);
      logger.debug("initial screenOrientation.type=", screenOrientation.type, "; and validatedType=", validatedType);
      if (validatedType === null) {
        if (screenOrientation.type === OrientationType.Potrait) {
          validatedType = validateOrientaionDevice(deviceMode, screenOrientation, OrientationType.Landscape);
        } else if (screenOrientation.type === OrientationType.Landscape) {
          validatedType = validateOrientaionDevice(deviceMode, screenOrientation, OrientationType.Potrait);
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
      logger.debug("final screenOrientation.type=", screenOrientation.type, "; and validatedType=", validatedType);
      setOrientation({ ...screenOrientation, type: validatedType, resultedDevice: resultDevice });
      updateDefaultOrientationOutput({ ...screenOrientation, resultedDevice: resultDevice });
    };

    window.screen.orientation.addEventListener("change", orientationChangeHandler);
    const observer = observeAndUpdateOrientation(orientationChangeHandler);
    orientationChangeHandler();

    return () => {
      window.screen.orientation.removeEventListener("change", orientationChangeHandler);
      observer?.disconnect();
    };
  }, []);

  return orientation;
};
