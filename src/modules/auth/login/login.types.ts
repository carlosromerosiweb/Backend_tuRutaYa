export interface LoginUserDto {
  identifier: string; // Puede ser email o nombre
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  };
} 