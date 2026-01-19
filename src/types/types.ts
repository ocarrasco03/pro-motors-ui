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
  data: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    email_verified_at: string | null;
    username: string;
    active: boolean;
    last_login_at: string | null;
    created_by: string | null;
    created_at: string;
    updated_by: string | null;
    updated_at: string;
    role: string;
  };
}
