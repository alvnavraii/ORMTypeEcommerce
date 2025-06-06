// src/dto/register.dto.ts
export class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
}