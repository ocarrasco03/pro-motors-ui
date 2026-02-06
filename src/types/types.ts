export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  data: {
    access_token: string;
    expires_in: number;
  };
  errors?: {
    [key: string]: string[];
  };
}

export interface AuthUser {
  message: string;
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  active: boolean;
  lastLoginAt: string | null;
  updatedBy: string | null;
  updatedAt: string;
  company: UserCompany | null;
  roles: Role[];
  permissions: Permission[] | null;
}

export interface Role {
  id: string;
  name: string;
}

export interface Permission {
  id: string;
  name: string;
}

export interface UserCompany {
  id: string;
  name: string;
  slug: string;
}