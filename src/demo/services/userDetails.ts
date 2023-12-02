const UserSessionDetails = {
  firstName: " ",
  lastName: " ",
  emailId: " ",
  password: " ",
};

export const userSessionDetails = (setter?: any) => {
  UserSessionDetails.emailId = setter?.emailId || UserSessionDetails.emailId;
  UserSessionDetails.firstName = setter?.firstName || UserSessionDetails.firstName;
  UserSessionDetails.lastName = setter?.lastName || UserSessionDetails.lastName;
  UserSessionDetails.password = setter?.password || UserSessionDetails.password;

  return { ...UserSessionDetails };
};

export const fullName = () => {
  return [UserSessionDetails.lastName, UserSessionDetails.firstName].join(", ");
};

export const auditData = (createdBy?: string, createdOn?: Date) => {
  const created = new Date(createdOn || "");
  return {
    createdBy: createdBy || fullName(),
    updatedBy: fullName(),
    createdOn: isNaN(created.getTime()) ? new Date() : created,
    updatedOn: new Date(),
  };
};

const reloadHandlerWhileLoggedIn = () => {
  const key = "fin-auth-demo";
  window.addEventListener("beforeunload", (event) => {
    const itemDetails = JSON.stringify(UserSessionDetails);
    console.log("before reload, local storage item details", itemDetails);
    localStorage.setItem(key, itemDetails);
  });

  const authUsr = localStorage.getItem(key);
  if (!authUsr) return;
  console.log("after reload, local storage item details", authUsr);
  const authUsrSession = JSON.parse(authUsr);
  if (!authUsrSession.firstName) return;

  UserSessionDetails.emailId = authUsrSession.emailId;
  UserSessionDetails.firstName = authUsrSession.firstName;
  UserSessionDetails.lastName = authUsrSession.lastName;
  UserSessionDetails.password = authUsrSession.password;
};

reloadHandlerWhileLoggedIn();
