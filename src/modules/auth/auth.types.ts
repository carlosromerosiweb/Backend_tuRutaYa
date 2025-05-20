export interface RegisterUserDto {
  email: string;
  name: string;
  password: string;
  roles?: string[];
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    roles: string[];
  };
} 