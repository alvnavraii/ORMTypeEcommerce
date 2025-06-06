import { Repository } from 'typeorm';
import { User } from "../entity/User";
import * as jt from 'jsonwebtoken';
import { RegisterDto } from "../dto/register.dto";
import { LoginDto } from "../dto/login.dto";
import { AuthResponse } from "../types/auth.types";
import { TimezoneUtil } from "../utils/timezone";
import * as dotenv from 'dotenv';

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || 'defaultSecretKey';

export class AuthService {
    
    constructor(private userRepository: Repository<User>) {}

    async  register(userData:RegisterDto): Promise<AuthResponse> {
        const existingUser = await this.userRepository.findOneBy({email:userData.email});
        if(existingUser){
            throw new Error('User already exists');
        }
       
        const user = new User();
        user.email = userData.email;
        user.firstName = userData.firstName;
        user.lastName = userData.lastName;
        user.phone = userData.phone;
        await user.setPassword(userData.password);
        
        const savedUser = await this.userRepository.save(user);
        const token = jt.sign({id:savedUser.id},jwtSecret,{expiresIn:'24h'});
        
        // Excluir propiedades sensibles y añadir fechas formateadas
        const {passwordHash, setPassword, verifyPassword, ...userResponse} = savedUser;
        
        return {
            accessToken: token,
            user: {
                ...userResponse,
                createdAtFormatted: TimezoneUtil.formatForUser(savedUser.createdAt),
                updatedAtFormatted: TimezoneUtil.formatForUser(savedUser.updatedAt)
            }
        };
            
    }

    async login(userData:LoginDto): Promise<AuthResponse> {
        const user = await this.userRepository.findOneBy({email:userData.email});
        if(!user){
            throw new Error('User not found');
        }
        const isPasswordValid = await user.verifyPassword(userData.password);
        if(!isPasswordValid){
            throw new Error('Invalid password');
        }
        const token = jt.sign({id:user.id},jwtSecret,{expiresIn:'24h'});
        
        // Excluir propiedades sensibles y añadir fechas formateadas
        const {passwordHash, setPassword, verifyPassword, ...userResponse} = user;
        
        return {
            accessToken: token,
            user: {
                ...userResponse,
                createdAtFormatted: TimezoneUtil.formatForUser(user.createdAt),
                updatedAtFormatted: TimezoneUtil.formatForUser(user.updatedAt)
            }
        };
    }
}