import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../../data-source';
import { User } from '../entity/User';

// Extender la interfaz Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface JwtPayload {
  userId: number;
  email: string;
  isAdmin: boolean;
}

export class AuthMiddleware {
  /**
   * Middleware para verificar JWT token
   */
  static async verifyToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(401).json({
          error: 'Token de acceso requerido',
          message: 'Debe proporcionar un token de autorización'
        });
        return;
      }

      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

      if (!token) {
        res.status(401).json({
          error: 'Token inválido',
          message: 'Formato de token incorrecto'
        });
        return;
      }

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      // Buscar el usuario en la base de datos
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId, isActive: true }
      });

      if (!user) {
        res.status(401).json({
          error: 'Usuario no encontrado',
          message: 'El usuario asociado al token no existe o está inactivo'
        });
        return;
      }

      // Agregar el usuario a la request
      req.user = user;
      next();

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
          error: 'Token expirado',
          message: 'El token de acceso ha expirado'
        });
        return;
      }

      if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
          error: 'Token inválido',
          message: 'El token de acceso no es válido'
        });
        return;
      }

      console.error('Error en middleware de autenticación:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Error al verificar el token de acceso'
      });
    }
  }

  /**
   * Middleware para verificar permisos de administrador
   */
  static async requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'No autenticado',
          message: 'Debe estar autenticado para acceder a este recurso'
        });
        return;
      }

      if (!req.user.isAdmin) {
        res.status(403).json({
          error: 'Acceso denegado',
          message: 'Se requieren permisos de administrador para acceder a este recurso'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Error en middleware de administrador:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: 'Error al verificar permisos de administrador'
      });
    }
  }

  /**
   * Middleware opcional - verifica token si está presente pero no requiere autenticación
   */
  static async optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        next();
        return;
      }

      const token = authHeader.startsWith('Bearer ') 
        ? authHeader.slice(7) 
        : authHeader;

      if (!token) {
        next();
        return;
      }

      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      // Buscar el usuario en la base de datos
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
        where: { id: decoded.userId, isActive: true }
      });

      if (user) {
        req.user = user;
      }

      next();

    } catch (error) {
      // En caso de error, simplemente continúa sin autenticar
      next();
    }
  }
}