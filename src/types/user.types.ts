export interface User {
  id: string;
  name: string;
  email: string;
  age?: number | null;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  age?: number;
  phone?: string;
  address?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  age?: number | null;
  phone?: string | null;
  address?: string | null;
}

export interface UserResponse {
  message: string;
  user?: User;
  users?: User[];
  count?: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  message: string;
  error?: string;
  errors?: string[];
  statusCode: number;
}
