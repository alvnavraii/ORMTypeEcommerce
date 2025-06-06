export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  isActive?: boolean;
  isAdmin?: boolean;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface AdminUpdateUserDto extends UpdateUserDto {
  email?: string;
}

export interface CreateUserByAdminDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  isAdmin?: boolean;
}