import {
  CreateUserRequest,
  UpdateUserRequest,
  ValidationError,
} from "../types/index.js";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+\d{1,3}[-\s]?\d{3,4}[-\s]?\d{3,4}[-\s]?\d{3,4}$/;
  return phoneRegex.test(phone);
};

export const validateAge = (age: number): boolean => {
  return age > 0 && age <= 120;
};

export const validateCreateUser = (userData: CreateUserRequest): string[] => {
  const errors: string[] = [];

  if (!userData.name || userData.name.trim().length === 0) {
    errors.push("Name is required");
  } else if (userData.name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  } else if (userData.name.trim().length > 50) {
    errors.push("Name must be less than 50 characters");
  }

  if (!userData.email || userData.email.trim().length === 0) {
    errors.push("Email is required");
  } else if (!validateEmail(userData.email.trim())) {
    errors.push("Please provide a valid email address");
  }

  if (userData.age !== undefined && userData.age !== null) {
    if (!validateAge(userData.age)) {
      errors.push("Age must be between 1 and 120");
    }
  }

  if (userData.phone && userData.phone.trim().length > 0) {
    if (!validatePhone(userData.phone.trim())) {
      errors.push(
        "Please provide a valid phone number (e.g., +51 123 456 789)"
      );
    }
  }

  if (userData.address && userData.address.trim().length > 200) {
    errors.push("Address must be less than 200 characters");
  }

  return errors;
};

export const validateUpdateUser = (userData: UpdateUserRequest): string[] => {
  const errors: string[] = [];

  if (userData.name !== undefined) {
    if (!userData.name || userData.name.trim().length === 0) {
      errors.push("Name cannot be empty");
    } else if (userData.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    } else if (userData.name.trim().length > 50) {
      errors.push("Name must be less than 50 characters");
    }
  }

  if (userData.email !== undefined) {
    if (!userData.email || userData.email.trim().length === 0) {
      errors.push("Email cannot be empty");
    } else if (!validateEmail(userData.email.trim())) {
      errors.push("Please provide a valid email address");
    }
  }

  if (userData.age !== undefined && userData.age !== null) {
    if (!validateAge(userData.age)) {
      errors.push("Age must be between 1 and 120");
    }
  }

  if (
    userData.phone !== undefined &&
    userData.phone !== null &&
    userData.phone.trim().length > 0
  ) {
    if (!validatePhone(userData.phone.trim())) {
      errors.push(
        "Please provide a valid phone number (e.g., +51 123 456 789)"
      );
    }
  }

  if (
    userData.address !== undefined &&
    userData.address !== null &&
    userData.address.trim().length > 200
  ) {
    errors.push("Address must be less than 200 characters");
  }

  return errors;
};
