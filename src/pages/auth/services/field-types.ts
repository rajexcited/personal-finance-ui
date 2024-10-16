export interface UserLoginResource {
  emailId: string;
  password: string;
}

export interface UserSignupResource {
  emailId: string;
  password: string;
  firstName: string;
  lastName: string;
  countryCode: string;
}

export enum UserStatus {
  ACTIVE_USER = "active-user",
  DELETED_USER = "deleted-user",
  DEACTIVATED_USER = "deactive-user",
}

export interface UserDetailsResource {
  emailId: string;
  isAuthenticated: boolean;
  fullName: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
}

export type UpdateUserDetailsResource = Pick<UserDetailsResource, "firstName" | "lastName">;

export interface UpdateUserPasswordResource {
  password: string;
  newPassword: string;
}

export interface AccessTokenResource {
  accessToken: string;
  expiresIn: number;
  expiryTime: number;
}

export interface CountryResource {
  name: string;
  code: string;
}
