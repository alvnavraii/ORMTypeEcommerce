// src/controllers/auth.controller.ts
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { AuthService } from '../services/auth.service';

// Inicializamos el servicio como nulo inicialmente
let authService: AuthService | null = null;

// Función para inicializar el servicio de autenticación
export const initializeAuthService = async (dataSource: DataSource) => {
    console.log('🔄 Inicializando AuthService...');
    if (!authService) {
        const userRepository = dataSource.getRepository(User);
        authService = new AuthService(userRepository);
        console.log('✅ AuthService creado exitosamente');
    } else {
        console.log('ℹ️  AuthService ya existe, reutilizando...');
    }
    return authService;
};

export class AuthController {
    private static instance: AuthController;
    private authService: AuthService;

    private constructor(authService: AuthService) {
        this.authService = authService;
        console.log('🎮 AuthController instanciado');
    }

    public static getInstance(authService: AuthService): AuthController {
        console.log('🔄 Obteniendo instancia de AuthController...');
        if (!AuthController.instance) {
            AuthController.instance = new AuthController(authService);
            console.log('✅ Nueva instancia de AuthController creada');
        } else {
            console.log('ℹ️  Reutilizando instancia existente de AuthController');
        }
        return AuthController.instance;
    }

    register = async (req: Request, res: Response) => {
        console.log('🚀 Ejecutando register - datos recibidos:', req.body);
        try {
            const result = await this.authService.register(req.body);
            console.log('✅ Usuario registrado exitosamente');
            res.status(201).json(result);
        } catch (error: any) {
            console.error('❌ Error en register:', error.message);
            res.status(400).json({ error: error.message });
        }
    };

    login = async (req: Request, res: Response) => {
        console.log('🔐 Ejecutando login para:', req.body.email);
        try {
            const result = await this.authService.login(req.body);
            console.log('✅ Login exitoso');
            res.status(200).json(result);
        } catch (error: any) {
            console.error('❌ Error en login:', error.message);
            res.status(401).json({ error: error.message });
        }
    };
}
