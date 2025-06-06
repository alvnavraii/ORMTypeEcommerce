import { Request, Response } from 'express';
import { UsersService } from '../services/users.service';
import { 
  UpdateUserDto, 
  UpdateProfileDto, 
  ChangePasswordDto, 
  AdminUpdateUserDto, 
  CreateUserByAdminDto 
} from '../dto/user.dto';
import { UserQueryParams } from '../types/user.types';

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  /**
   * GET /api/users - Obtener todos los usuarios (solo admin)
   */
  getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const queryParams: UserQueryParams = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
        search: req.query.search as string,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        isAdmin: req.query.isAdmin ? req.query.isAdmin === 'true' : undefined,
        sortBy: req.query.sortBy as any || 'id',
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC' || 'ASC'
      };

      const result = await this.usersService.getAllUsers(queryParams);
      
      res.status(200).json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener los usuarios'
      });
    }
  };

  /**
   * GET /api/users/:id - Obtener usuario por ID
   */
  getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
          message: 'El ID del usuario debe ser un número'
        });
        return;
      }

      // Solo admin puede ver cualquier usuario, usuarios normales solo pueden verse a sí mismos
      if (!req.user?.isAdmin && req.user?.id !== userId) {
        res.status(403).json({
          success: false,
          error: 'Acceso denegado',
          message: 'No tienes permisos para ver este usuario'
        });
        return;
      }

      const user = await this.usersService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El usuario con el ID especificado no existe'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el usuario'
      });
    }
  };

  /**
   * POST /api/users - Crear nuevo usuario (solo admin)
   */
  createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userData: CreateUserByAdminDto = req.body;

      // Validaciones básicas
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        res.status(400).json({
          success: false,
          error: 'Datos incompletos',
          message: 'Email, contraseña, nombre y apellido son requeridos'
        });
        return;
      }

      const newUser = await this.usersService.createUser(userData);

      res.status(201).json({
        success: true,
        data: newUser,
        message: 'Usuario creado exitosamente'
      });

    } catch (error) {
      console.error('Error al crear usuario:', error);
      
      if (error instanceof Error && error.message === 'El email ya está registrado') {
        res.status(409).json({
          success: false,
          error: 'Email duplicado',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo crear el usuario'
      });
    }
  };

  /**
   * PUT /api/users/:id - Actualizar usuario (solo admin)
   */
  updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const updateData: AdminUpdateUserDto = req.body;

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
          message: 'El ID del usuario debe ser un número'
        });
        return;
      }

      const updatedUser = await this.usersService.updateUser(userId, updateData);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El usuario con el ID especificado no existe'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Usuario actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      
      if (error instanceof Error && error.message === 'El email ya está registrado') {
        res.status(409).json({
          success: false,
          error: 'Email duplicado',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar el usuario'
      });
    }
  };

  /**
   * DELETE /api/users/:id - Eliminar usuario (desactivar)
   */
  deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
          message: 'El ID del usuario debe ser un número'
        });
        return;
      }

      // Evitar que un admin se elimine a sí mismo
      if (req.user?.id === userId) {
        res.status(400).json({
          success: false,
          error: 'Operación no permitida',
          message: 'No puedes desactivar tu propia cuenta'
        });
        return;
      }

      const deleted = await this.usersService.deleteUser(userId);

      if (!deleted) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El usuario con el ID especificado no existe'
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Usuario desactivado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo desactivar el usuario'
      });
    }
  };

  /**
   * PUT /api/users/profile - Actualizar perfil propio
   */
  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const updateData: UpdateProfileDto = req.body;
      const userId = req.user!.id;

      const updatedUser = await this.usersService.updateProfile(userId, updateData);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'Tu usuario no existe en el sistema'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Perfil actualizado exitosamente'
      });

    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo actualizar el perfil'
      });
    }
  };

  /**
   * PUT /api/users/change-password - Cambiar contraseña
   */
  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const passwordData: ChangePasswordDto = req.body;
      const userId = req.user!.id;

      if (!passwordData.currentPassword || !passwordData.newPassword) {
        res.status(400).json({
          success: false,
          error: 'Datos incompletos',
          message: 'La contraseña actual y nueva son requeridas'
        });
        return;
      }

      await this.usersService.changePassword(userId, passwordData);

      res.status(200).json({
        success: true,
        message: 'Contraseña cambiada exitosamente'
      });

    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      
      if (error instanceof Error && error.message === 'La contraseña actual es incorrecta') {
        res.status(400).json({
          success: false,
          error: 'Contraseña incorrecta',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo cambiar la contraseña'
      });
    }
  };

  /**
   * PUT /api/users/:id/reactivate - Reactivar usuario (solo admin)
   */
  reactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
          message: 'El ID del usuario debe ser un número'
        });
        return;
      }

      const reactivatedUser = await this.usersService.reactivateUser(userId);

      if (!reactivatedUser) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El usuario con el ID especificado no existe'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: reactivatedUser,
        message: 'Usuario reactivado exitosamente'
      });

    } catch (error) {
      console.error('Error al reactivar usuario:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo reactivar el usuario'
      });
    }
  };

  /**
   * PUT /api/users/:id/toggle-admin - Alternar estado de administrador
   */
  toggleAdminStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          error: 'ID inválido',
          message: 'El ID del usuario debe ser un número'
        });
        return;
      }

      // Evitar que un admin se quite permisos a sí mismo
      if (req.user?.id === userId) {
        res.status(400).json({
          success: false,
          error: 'Operación no permitida',
          message: 'No puedes cambiar tus propios permisos de administrador'
        });
        return;
      }

      const updatedUser = await this.usersService.toggleAdminStatus(userId);

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'El usuario con el ID especificado no existe'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: `Permisos de administrador ${updatedUser.isAdmin ? 'otorgados' : 'revocados'} exitosamente`
      });

    } catch (error) {
      console.error('Error al cambiar estado de admin:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo cambiar el estado de administrador'
      });
    }
  };

  /**
   * GET /api/users/stats - Obtener estadísticas de usuarios (solo admin)
   */
  getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.usersService.getUserStats();

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudieron obtener las estadísticas'
      });
    }
  };

  /**
   * GET /api/users/me - Obtener perfil del usuario autenticado
   */
  getMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user!.id;
      const user = await this.usersService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
          message: 'Tu usuario no existe en el sistema'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: 'No se pudo obtener el perfil'
      });
    }
  };
}