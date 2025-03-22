export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  password: string;
  invested_apps: string[];
}
