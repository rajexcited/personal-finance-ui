import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateAuthorization } from "./common-validators";
import { tokenSessionData, userSessionDetails } from "./userDetails";
import { v4 as uuidv4 } from "uuid";
import datetime from "date-and-time";
import { UserDetailsResource, UserLoginResource } from "../../pages/auth";
import { UserStatus } from "../../pages/auth/services";
import { getLogger } from "../../shared";

type UserDetailsRsc = Omit<UserDetailsResource, "isAuthenticated" | "fullName">;

const _rootLogger = getLogger("mock.api.user", null, null, "DEBUG");

export const MockUser = (demoMock: MockAdapter) => {
  const passwordRegex = /^(?=.*[\d])(?=.*[A-Z])(?=.*[!@#$%^&*])[\w!@#$%^&\(\)\=*]{8,25}$/;
  const expiresInSec = 30 * 60;

  const isInvalidDemoEmailId = (emailId: string) => {
    return !emailId.endsWith("@demo.com");
  };

  demoMock.onPost("/user/signup").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    if (!config.withCredentials) {
      return responseCreator.toForbiddenError("it is not secured");
    }

    const data = JSON.parse(config.data);
    const missingErrors = missingValidation(data, ["emailId", "password", "firstName", "lastName", "countryCode"]);
    if (missingErrors) {
      return responseCreator.toValidationError(missingErrors);
    }

    if (!passwordRegex.test(atob(data.password))) {
      return responseCreator.toValidationError([{ path: "password", message: "pattern is not acceptable" }]);
    }

    if (isInvalidDemoEmailId(data.emailId)) {
      return responseCreator.toValidationError([{ path: "emailId", message: "invalid demo email id. email id must ends with '@demo.com'" }]);
    }

    userSessionDetails(data);
    const response = tokenSessionData({
      expiresIn: expiresInSec,
      accessToken: uuidv4(),
      expiryTime: datetime.addSeconds(new Date(), expiresInSec).getTime(),
    });

    return responseCreator.toCreateResponse(response);
  });

  demoMock.onPost("/user/login").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    const data = JSON.parse(config.data);
    const missingErrors = missingValidation(data, ["emailId", "password"]);
    if (missingErrors.length > 0) {
      return responseCreator.toValidationError(missingErrors);
    }

    if (!passwordRegex.test(atob(data.password))) {
      return responseCreator.toValidationError([{ path: "password", message: "pattern is not acceptable" }]);
    }

    if (isInvalidDemoEmailId(data.emailId)) {
      return responseCreator.toValidationError([{ path: "emailId", message: "invalid demo email id. email id must ends with '@demo.com'" }]);
    }

    const responseData = {
      emailId: data.emailId,
      firstName: data.emailId.replace("@demo.com", ""),
      lastName: "demo",
      countryCode: "USA",
      password: atob(data.password),
    };

    userSessionDetails({ ...responseData });
    const response = tokenSessionData({
      expiresIn: expiresInSec,
      accessToken: uuidv4(),
      expiryTime: datetime.addSeconds(new Date(), expiresInSec).getTime(),
    });

    return responseCreator.toSuccessResponse(response);
  });

  demoMock.onPost("/user/logout").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    userSessionDetails({ emailId: "", firstName: "", lastName: "", password: "", countryCode: "" });
    tokenSessionData({
      expiresIn: expiresInSec,
      accessToken: "",
      expiryTime: -1,
    });

    return responseCreator.toSuccessResponse("successfuly logged out");
  });

  demoMock.onPost("/user/refresh").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const response = tokenSessionData({
      expiresIn: expiresInSec,
      accessToken: uuidv4(),
      expiryTime: datetime.addSeconds(new Date(), expiresInSec).getTime(),
    });
    return responseCreator.toSuccessResponse(response);
  });

  demoMock.onGet("/user/details").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const details = userSessionDetails();
    const response: UserDetailsRsc = {
      emailId: details.emailId,
      firstName: details.firstName,
      lastName: details.lastName,
      status: details.status as UserStatus,
    };
    return responseCreator.toSuccessResponse(response);
  });

  demoMock.onPost("/user/details").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const isAuthorized = validateAuthorization(config.headers);
    if (!isAuthorized) {
      return responseCreator.toForbiddenError("not authorized");
    }

    const data = JSON.parse(config.data);
    if (data.password) {
      // change password logic
      const missingErrors = missingValidation(data, ["newPassword"]);
      if (missingErrors) {
        return responseCreator.toValidationError(missingErrors);
      }
      if (!passwordRegex.test(data.password) || !passwordRegex.test(data.newPassword)) {
        return responseCreator.toValidationError([{ path: "password", message: "incorrect value" }]);
      }

      if (atob(data.password) !== userSessionDetails().password) {
        return responseCreator.toValidationError([{ path: "password", message: "incorrect value" }]);
      }
      if (data.password === data.newPassword) {
        return responseCreator.toValidationError([{ path: "newPassword", message: "incorrect value" }]);
      }
      userSessionDetails({ password: atob(data.newPassword) });
      return responseCreator.toSuccessResponse("password changed");
    }

    const missingErrors = missingValidation(data, ["firstName", "lastName"]);
    if (missingErrors.length > 0) {
      return responseCreator.toValidationError(missingErrors);
    }

    userSessionDetails({ firstName: data.firstName, lastName: data.lastName });
    return responseCreator.toSuccessResponse("Name is changed");
  });

  demoMock.onDelete("/user/details").reply((config) => {
    const logger = getLogger("deleteUser", _rootLogger);
    const responseCreator = AxiosResponseCreator(config);

    logger.debug("mock api called, config =", { ...config });
    const data: UserLoginResource = {
      emailId: config.headers?.emailId,
      password: config.headers?.password,
    };
    const missingErrors = missingValidation(data, ["emailId", "password"]);
    if (missingErrors.length > 0) {
      logger.debug("missingErrors =", missingErrors);
      return responseCreator.toValidationError(missingErrors);
    }

    if (!passwordRegex.test(atob(data.password))) {
      logger.debug("password incorrect format");
      return responseCreator.toValidationError([{ path: "password", message: "pattern is not acceptable" }]);
    }

    if (isInvalidDemoEmailId(data.emailId)) {
      logger.debug("invalid demo email");
      return responseCreator.toValidationError([{ path: "emailId", message: "invalid demo email id. email id must ends with '@demo.com'" }]);
    }

    const userDetails = userSessionDetails();

    if (userDetails.emailId !== data.emailId || userDetails.password !== atob(data.password)) {
      logger.debug("incorrect login credential");
      return responseCreator.toValidationError([{ path: "request", message: "invalid login credential" }]);
    }

    const respDetails = userSessionDetails({
      status: UserStatus.DELETED_USER,
    });

    const response: UserDetailsRsc = {
      emailId: respDetails.emailId,
      firstName: respDetails.firstName,
      lastName: respDetails.lastName,
      status: respDetails.status as UserStatus,
    };

    logger.debug("responding success, response=", response);
    return responseCreator.toSuccessResponse(response);
  });
};
