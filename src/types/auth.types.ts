import { User } from "../entity/User";

export interface UserResponse {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    isActive: boolean;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
    // Fechas formateadas para mostrar al usuario
    createdAtFormatted?: string;
    updatedAtFormatted?: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    user: UserResponse;
}
