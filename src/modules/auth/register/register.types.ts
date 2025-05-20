export interface RegisterUserDto {
  email: string;
  name: string;
  password: string;
  roles?: string[];
}

export interface RegisterResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
    roles: string[];
  };
} 