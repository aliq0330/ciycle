export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
  full_name: string;
  vehicle_type: "motorcycle" | "bicycle" | "both";
}

export interface ResetPasswordPayload {
  email: string;
}

export interface UpdatePasswordPayload {
  password: string;
}

export interface AuthSession {
  user_id: string;
  email: string;
  profile_id: string;
}
