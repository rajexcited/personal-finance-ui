import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateUuid } from "./common-validators";
import { userSessionDetails } from "./userDetails";
import { v4 as uuidv4 } from "uuid";

const MockLogin = (demoMock: MockAdapter) => {
  const passwordRegex = /^(?=.*[\d])(?=.*[A-Z])(?=.*[!@#$%^&*])[\w!@#$%^&\(\)\=*]{8,25}$/;
  const expiresInSec = 30 * 60;

  const isInvalidDemoEmailId = (emailId: string) => {
    return !emailId.endsWith("@demo.com");
  };

  demoMock.onPost("/signup").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    if (!config.withCredentials) {
      return responseCreator.toForbiddenError("it is not secured");
    }

    const data = JSON.parse(config.data);
    const missingErrors = missingValidation(data, ["emailId", "password", "firstName", "lastName"]);
    if (missingErrors) {
      return responseCreator.toValidationError(missingErrors);
    }
    if (!passwordRegex.test(data.password)) {
      return responseCreator.toValidationError([{ loc: ["password"], msg: "pattern is not acceptable" }]);
    }
    if (isInvalidDemoEmailId(data.emailId)) {
      return responseCreator.toValidationError([
        { loc: ["emailId"], msg: "invalid demo email id. email id must ends with '@demo.com'" },
      ]);
    }

    userSessionDetails(data);

    return responseCreator.toCreateResponse({
      ...data,
      password: null,
      expiresIn: expiresInSec,
      accessToken: uuidv4(),
    });
  });

  demoMock.onPost("/login").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    if (!config.withCredentials) {
      return responseCreator.toForbiddenError("it is not secured");
    }

    const data = JSON.parse(config.data);
    const missingErrors = missingValidation(data, ["emailId", "password"]);
    if (missingErrors) {
      return responseCreator.toValidationError(missingErrors);
    }
    if (!passwordRegex.test(data.password)) {
      return responseCreator.toValidationError([{ loc: ["password"], msg: "pattern is not acceptable" }]);
    }
    if (isInvalidDemoEmailId(data.emailId)) {
      return responseCreator.toValidationError([
        { loc: ["emailId"], msg: "invalid demo email id. email id must ends with '@demo.com'" },
      ]);
    }

    const responseData = {
      accessToken: uuidv4(),
      emailId: data.emailId,
      isAuthenticated: true,
      firstName: data.emailId.replace("@demo.com", ""),
      lastName: "demo",
      expiresIn: expiresInSec,
    };

    userSessionDetails({ ...data, ...responseData });

    return responseCreator.toSuccessResponse(responseData);
  });

  demoMock.onPost("logout").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    userSessionDetails({ emailId: " ", firstName: " ", lastName: " ", password: " " });

    return responseCreator.toSuccessResponse("successfuly logged out");
  });

  demoMock.onPost("/user/refresh").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const data = JSON.parse(config.data);

    if (data.refreshToken && data.refreshToken.startsWith("Bearer ")) {
      const validErrors = validateUuid(data.refreshToken.replace("Bearer ", ""), "refreshToken");
      if (!validErrors) {
        return responseCreator.toSuccessResponse({ expiresIn: expiresInSec, accessToken: uuidv4() });
      }
    }
    return responseCreator.toForbiddenError("You are not authorized");
  });

  demoMock.onGet("/security/details").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    return responseCreator.toSuccessResponse(userSessionDetails());
  });

  demoMock.onPost("/security/details").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const data = JSON.parse(config.data);
    if (data.password) {
      // change password logic
      const missingErrors = missingValidation(data, ["newPassword"]);
      if (missingErrors) {
        return responseCreator.toValidationError(missingErrors);
      }
      if (!passwordRegex.test(data.password) || !passwordRegex.test(data.newPassword)) {
        return responseCreator.toValidationError([{ loc: ["password", "newPassword"], msg: "incorrect value" }]);
      }

      if (data.password !== userSessionDetails().password) {
        return responseCreator.toValidationError([{ loc: ["password"], msg: "incorrect value" }]);
      }
      if (data.password === data.newPassword) {
        return responseCreator.toValidationError([{ loc: ["newPassword"], msg: "incorrect value" }]);
      }
      userSessionDetails({ password: data.newPassword });
      return responseCreator.toSuccessResponse("password changed");
    }
    const missingErrors = missingValidation(data, ["firstName", "lastName"]);
    if (missingErrors && missingErrors.length === 1) {
      return responseCreator.toValidationError(missingErrors);
    }
    if (!missingErrors) {
      userSessionDetails(data);
      return responseCreator.toSuccessResponse("Name is changed");
    }

    return responseCreator.toUnknownError("request is not supported");
  });
};

export default MockLogin;
