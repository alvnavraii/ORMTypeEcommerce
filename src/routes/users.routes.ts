import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const usersController = new UsersController();

// Rutas para perfil personal (requieren autenticación)
router.get('/me', AuthMiddleware.verifyToken, usersController.getMyProfile);
router.put('/profile', AuthMiddleware.verifyToken, usersController.updateProfile);
router.put('/change-password', AuthMiddleware.verifyToken, usersController.changePassword);

// Rutas administrativas (requieren ser admin)
router.get('/stats', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, usersController.getUserStats);
router.post('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, usersController.createUser);
router.get('/', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, usersController.getAllUsers);

// Rutas por ID - GET puede ser usado por el mismo usuario o admin
router.get('/:id', AuthMiddleware.verifyToken, usersController.getUserById);

// Rutas administrativas por ID (solo admin)
router.put('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, usersController.updateUser);
router.delete('/:id', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, usersController.deleteUser);
router.put('/:id/reactivate', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, usersController.reactivateUser);
router.put('/:id/toggle-admin', AuthMiddleware.verifyToken, AuthMiddleware.requireAdmin, usersController.toggleAdminStatus);

export default router;