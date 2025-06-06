import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

export const createAuthRoutes = (authController: AuthController) => {
    console.log('📋 Creando rutas de autenticación...');
    
    const router = Router();
    
    console.log('📝 Registrando ruta POST /register');
    router.post('/register', (req, res) => {
        console.log('🔥 Ruta /register llamada');
        return authController.register(req, res);
    });
    
    console.log('📝 Registrando ruta POST /login');
    router.post('/login', (req, res) => {
        console.log('🔥 Ruta /login llamada');
        return authController.login(req, res);
    });
    
    console.log('✅ Router creado con éxito');
    return router;
};
