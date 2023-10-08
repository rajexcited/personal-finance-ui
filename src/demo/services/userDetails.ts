export const UserSessionDetails = {
  firstName: "",
  lastName: "",
  emailId: "",
};

export const fullName = () => {
  return [UserSessionDetails.lastName, UserSessionDetails.firstName].join(", ");
};

export const auditData = (createdBy?: string, createdOn?: Date) => {
  return {
    createdBy: createdBy || fullName(),
    updatedBy: fullName(),
    createdOn: createdOn || new Date(),
    updatedOn: new Date(),
  };
};
