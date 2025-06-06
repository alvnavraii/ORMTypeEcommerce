import { User } from '../entity/User';

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  isActive: boolean;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdAtFormatted: string;
  updatedAtFormatted: string;
}

export interface UsersListResponse {
  users: UserResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  isAdmin?: boolean;
  sortBy?: 'id' | 'email' | 'firstName' | 'lastName' | 'createdAt' | 'updatedAt';
  sortOrder?: 'ASC' | 'DESC';
}

export class UserResponseMapper {
  static toResponse(user: User): UserResponse {
    const { TimezoneUtil } = require('../utils/timezone');
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      isActive: user.isActive,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      createdAtFormatted: TimezoneUtil.formatForUser(user.createdAt),
      updatedAtFormatted: TimezoneUtil.formatForUser(user.updatedAt)
    };
  }

  static toResponseList(users: User[]): UserResponse[] {
    return users.map(user => this.toResponse(user));
  }
}