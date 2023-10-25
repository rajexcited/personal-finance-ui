import MockAdapter from "axios-mock-adapter";
import { AxiosResponseCreator } from "./mock-response-create";
import { missingValidation, validateUuid } from "./common-validators";
import { UserSessionDetails } from "./userDetails";
import { v4 as uuidv4 } from "uuid";

const MockLogin = (demoMock: MockAdapter) => {
  const passwordRegex = /^(?=.*[\d])(?=.*[A-Z])(?=.*[!@#$%^&*])[\w!@#$%^&\(\)\=*]{8,25}$/;

  const isInvalidDemoEmailId = (emailId: string) => {
    return !emailId.endsWith("@demo.com");
  };

  demoMock.onPost("/signup").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    if (!config.withCredentials) {
      return responseCreator.toForbiddenError("it is not secured");
    }

    const data = JSON.parse(config.data);
    const missingErrors = missingValidation(data, ["emailId", "password", "firstname", "lastname"]);
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

    UserSessionDetails.emailId = data.emailId;
    UserSessionDetails.firstName = data.firstname;
    UserSessionDetails.lastName = data.lastname;

    return responseCreator.toCreateResponse({ ...data, password: null, expiresIn: 180, accessToken: uuidv4() });
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
      firstname: data.emailId.replace("@demo.com", ""),
      lastname: "demo",
      expiresIn: 180,
    };

    UserSessionDetails.emailId = responseData.emailId;
    UserSessionDetails.firstName = responseData.firstname;
    UserSessionDetails.lastName = responseData.lastname;

    return responseCreator.toSuccessResponse(responseData);
  });

  demoMock.onPost("logout").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);

    UserSessionDetails.emailId = "";
    UserSessionDetails.firstName = "";
    UserSessionDetails.lastName = "";

    return responseCreator.toSuccessResponse("successfuly logged out");
  });

  demoMock.onPost("/user/refresh").reply((config) => {
    const responseCreator = AxiosResponseCreator(config);
    const data = JSON.parse(config.data);

    if (data.refreshToken && data.refreshToken.startsWith("Bearer ")) {
      const validErrors = validateUuid(data.refreshToken.replace("Bearer ", ""), "refreshToken");
      if (!validErrors) {
        return responseCreator.toSuccessResponse({ expiresIn: 180, accessToken: uuidv4() });
      }
    }
    return responseCreator.toForbiddenError("You are not authorized");
  });
};

export default MockLogin;
