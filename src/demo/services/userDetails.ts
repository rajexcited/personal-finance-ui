import { UserStatus } from "../../pages/auth/services";
import { formatTimestamp, getLogger } from "../../shared";

const rootLogger = getLogger("mock.service.userDetails", null, null, "DISABLED");

export type UserDataType = Record<"firstName" | "lastName" | "emailId" | "password" | "countryCode" | "status" | "id", string>;
const sessionUserDetails: UserDataType = {
  id: "",
  firstName: "",
  lastName: "",
  emailId: "",
  password: "",
  countryCode: "",
  status: UserStatus.ACTIVE_USER
};
const prevUserSessionDetails: UserDataType = { ...sessionUserDetails };

export const userSessionDetails = (setter?: Partial<UserDataType>, saveAsPrevBeforeSet?: boolean) => {
  if (saveAsPrevBeforeSet) {
    Object.assign(prevUserSessionDetails, sessionUserDetails);
  }
  sessionUserDetails.id = setter?.id || sessionUserDetails.id;
  sessionUserDetails.emailId = setter?.emailId || sessionUserDetails.emailId;
  sessionUserDetails.firstName = setter?.firstName || sessionUserDetails.firstName;
  sessionUserDetails.lastName = setter?.lastName || sessionUserDetails.lastName;
  sessionUserDetails.password = setter?.password || sessionUserDetails.password;
  sessionUserDetails.countryCode = setter?.countryCode || sessionUserDetails.countryCode;
  sessionUserDetails.status = setter?.status || sessionUserDetails.status;

  return { ...sessionUserDetails };
};

export const getPreviousUserSessionDetails = () => {
  return { ...prevUserSessionDetails };
};

export const fullName = () => {
  if (sessionUserDetails.firstName) {
    return [sessionUserDetails.lastName, sessionUserDetails.firstName].join(", ");
  }
  return "-";
};

export const auditData = (createdBy?: string, createdOn?: Date | string) => {
  return {
    createdBy: createdBy || fullName(),
    updatedBy: fullName(),
    createdOn: typeof createdOn === "string" ? createdOn : formatTimestamp(createdOn || new Date()),
    updatedOn: formatTimestamp(new Date())
  };
};

type TokenDataType = { expiresIn: number; accessToken: string; expiryTime: number };
const tokenData: TokenDataType = { expiresIn: 0, accessToken: "", expiryTime: -1 };

export const tokenSessionData = (data?: TokenDataType) => {
  if (data) {
    tokenData.expiresIn = data.expiresIn;
    tokenData.accessToken = data.accessToken;
    tokenData.expiryTime = data.expiryTime;
  }

  return { ...tokenData };
};

const reloadHandlerWhileLoggedIn = () => {
  const prevusrkey = "fin-usr-demo-prev";
  const usrkey = "fin-usr-demo";
  const tknkey = "fin-tkn-demo";
  const logger = getLogger("reloadHandlerWhileLoggedIn", rootLogger);
  window.addEventListener("beforeunload", (_event) => {
    const itemDetails = JSON.stringify(sessionUserDetails);
    logger.debug("before reload, local storage item details", itemDetails);
    sessionStorage.setItem(usrkey, itemDetails);

    const prevItemDetails = JSON.stringify(prevUserSessionDetails);
    logger.debug("before reload, local storage item details", prevItemDetails);
    sessionStorage.setItem(prevusrkey, prevItemDetails);

    sessionStorage.setItem(tknkey, JSON.stringify(tokenData));
  });

  const authUsr = sessionStorage.getItem(usrkey);
  if (authUsr) {
    logger.debug("after reload, local storage user details", authUsr);
    const authUsrSession = JSON.parse(authUsr) as UserDataType;
    if (authUsrSession.firstName) {
      sessionUserDetails.emailId = authUsrSession.emailId;
      sessionUserDetails.firstName = authUsrSession.firstName;
      sessionUserDetails.lastName = authUsrSession.lastName;
      sessionUserDetails.password = authUsrSession.password;
      sessionUserDetails.countryCode = authUsrSession.countryCode;
    }
  }
  const authTkn = sessionStorage.getItem(tknkey);
  if (authTkn) {
    logger.debug("after reload, local storage token details", authTkn);
    const authTknSession = JSON.parse(authTkn) as TokenDataType;
    if (authTknSession.accessToken) {
      tokenSessionData({
        accessToken: authTknSession.accessToken,
        expiresIn: authTknSession.expiresIn,
        expiryTime: authTknSession.expiryTime
      });
    }
  }
};

reloadHandlerWhileLoggedIn();
