import { formatTimestamp } from "../../services";

type UserDataType = { firstName: string; lastName: string; emailId: string; password: string; countryCode: string };
const UserSessionDetails: UserDataType = {
  firstName: "",
  lastName: "",
  emailId: "",
  password: "",
  countryCode: "",
};

export const userSessionDetails = (setter?: Partial<UserDataType>) => {
  UserSessionDetails.emailId = setter?.emailId || UserSessionDetails.emailId;
  UserSessionDetails.firstName = setter?.firstName || UserSessionDetails.firstName;
  UserSessionDetails.lastName = setter?.lastName || UserSessionDetails.lastName;
  UserSessionDetails.password = setter?.password || UserSessionDetails.password;
  UserSessionDetails.countryCode = setter?.countryCode || UserSessionDetails.countryCode;

  return { ...UserSessionDetails };
};

export const fullName = () => {
  if (UserSessionDetails.firstName) {
    return [UserSessionDetails.lastName, UserSessionDetails.firstName].join(", ");
  }
  return "-";
};

export const auditData = (createdBy?: string, createdOn?: Date) => {
  const created = new Date(createdOn || "");
  return {
    createdBy: createdBy || fullName(),
    updatedBy: fullName(),
    createdOn: isNaN(created.getTime()) ? formatTimestamp(new Date()) : formatTimestamp(created),
    updatedOn: formatTimestamp(new Date()),
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
  const usrkey = "fin-usr-demo";
  const tknkey = "fin-tkn-demo";
  window.addEventListener("beforeunload", (event) => {
    const itemDetails = JSON.stringify(UserSessionDetails);
    console.log("before reload, local storage item details", itemDetails);
    sessionStorage.setItem(usrkey, itemDetails);

    sessionStorage.setItem(tknkey, JSON.stringify(tokenData));
  });

  const authUsr = sessionStorage.getItem(usrkey);
  if (authUsr) {
    console.trace("after reload, local storage user details", authUsr);
    const authUsrSession = JSON.parse(authUsr) as UserDataType;
    if (authUsrSession.firstName) {
      UserSessionDetails.emailId = authUsrSession.emailId;
      UserSessionDetails.firstName = authUsrSession.firstName;
      UserSessionDetails.lastName = authUsrSession.lastName;
      UserSessionDetails.password = authUsrSession.password;
      UserSessionDetails.countryCode = authUsrSession.countryCode;
    }
  }
  const authTkn = sessionStorage.getItem(tknkey);
  if (authTkn) {
    console.trace("after reload, local storage token details", authTkn);
    const authTknSession = JSON.parse(authTkn) as TokenDataType;
    if (authTknSession.accessToken) {
      tokenSessionData({
        accessToken: authTknSession.accessToken,
        expiresIn: authTknSession.expiresIn,
        expiryTime: authTknSession.expiryTime,
      });
    }
  }
};

reloadHandlerWhileLoggedIn();
