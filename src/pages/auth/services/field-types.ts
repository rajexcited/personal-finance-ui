export interface AuthDetailType {
  emailId: string;
  isAuthenticated: boolean;
  fullName: string;
  expiryDate: Date;
  firstName: string;
  lastName: string;
}

export interface LoginDataType {
  emailId: string;
  password: string;
}

export interface SignupDetailType {
  emailId: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserDetailType {
  emailId: string;
  fullName: string;
  isAuthenticated: boolean;
  expiryDate: Date;
}

export interface SecurityDetailType {
  emailId?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  newPassword?: string;
}
