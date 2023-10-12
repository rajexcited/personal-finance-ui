export interface AuthDetailType {
  roles: string[];
  emailId: string;
  isAuthenticated: boolean;
  fullName: string;
  expiryDate: Date;
  firstname: string;
  lastname: string;
}

export interface LoginDataType {
  emailId: string;
  password: string;
}

export interface SignupDetailType {
  emailId: string;
  password: string;
  firstname: string;
  lastname: string;
  roles: string[];
}

export interface UserDetailType {
  emailId: string;
  fullName: string;
  isAuthenticated: boolean;
  expiryDate: Date;
}
