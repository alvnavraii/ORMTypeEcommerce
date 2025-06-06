import bcrypt from 'bcrypt';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { AppDataSource } from '../../data-source';
import { User } from '../entity/User';
import { 
  UpdateUserDto, 
  UpdateProfileDto, 
  ChangePasswordDto, 
  AdminUpdateUserDto, 
  CreateUserByAdminDto 
} from '../dto/user.dto';
import { 
  UserResponse, 
  UsersListResponse, 
  UserQueryParams, 
  UserResponseMapper 
} from '../types/user.types';

export class UsersService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  /**
   * Obtener todos los usuarios con paginación y filtros
   */
  async getAllUsers(params: UserQueryParams): Promise<UsersListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      isAdmin,
      sortBy = 'id',
      sortOrder = 'ASC'
    } = params;

    const offset = (page - 1) * limit;

    // Construir condiciones WHERE
    const where: any = {};
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (isAdmin !== undefined) {
      where.isAdmin = isAdmin;
    }

    // Configurar opciones de búsqueda
    const findOptions: FindManyOptions<User> = {
      where,
      skip: offset,
      take: limit,
      order: { [sortBy]: sortOrder }
    };

    // Agregar búsqueda por texto si se proporciona
    if (search) {
      findOptions.where = [
        { ...where, firstName: Like(`%${search}%`) },
        { ...where, lastName: Like(`%${search}%`) },
        { ...where, email: Like(`%${search}%`) }
      ];
    }

    const [users, total] = await this.userRepository.findAndCount(findOptions);

    const totalPages = Math.ceil(total / limit);

    return {
      users: UserResponseMapper.toResponseList(users),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(id: number): Promise<UserResponse | null> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      return null;
    }

    return UserResponseMapper.toResponse(user);
  }

  /**
   * Crear usuario (solo admin)
   */
  async createUser(userData: CreateUserByAdminDto): Promise<UserResponse> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Hashear password
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // Crear usuario
    const user = this.userRepository.create({
      email: userData.email,
      passwordHash,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone || null,
      isAdmin: userData.isAdmin || false
    });

    const savedUser = await this.userRepository.save(user);
    return UserResponseMapper.toResponse(savedUser);
  }

  /**
   * Actualizar usuario (solo admin)
   */
  async updateUser(id: number, updateData: AdminUpdateUserDto): Promise<UserResponse | null> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      return null;
    }

    // Verificar email único si se actualiza
    if (updateData.email && updateData.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateData.email }
      });

      if (existingUser) {
        throw new Error('El email ya está registrado');
      }
    }

    // Actualizar campos
    Object.assign(user, updateData);

    const updatedUser = await this.userRepository.save(user);
    return UserResponseMapper.toResponse(updatedUser);
  }

  /**
   * Actualizar perfil propio (usuario autenticado)
   */
  async updateProfile(userId: number, updateData: UpdateProfileDto): Promise<UserResponse | null> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return null;
    }

    // Actualizar campos específicos de manera segura
    if (updateData.firstName !== undefined) {
      user.firstName = updateData.firstName;
    }
    
    if (updateData.lastName !== undefined) {
      user.lastName = updateData.lastName;
    }
    
    if (updateData.phone !== undefined) {
      user.phone = updateData.phone;
    }

    const updatedUser = await this.userRepository.save(user);
    return UserResponseMapper.toResponse(updatedUser);
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId: number, passwordData: ChangePasswordDto): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return false;
    }

    // Verificar contraseña actual
    const isCurrentPasswordValid = await bcrypt.compare(passwordData.currentPassword, user.passwordHash);
    
    if (!isCurrentPasswordValid) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Hashear nueva contraseña
    const newPasswordHash = await bcrypt.hash(passwordData.newPassword, 10);

    // Actualizar contraseña
    user.passwordHash = newPasswordHash;
    await this.userRepository.save(user);

    return true;
  }

  /**
   * Eliminar usuario (desactivar)
   */
  async deleteUser(id: number): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      return false;
    }

    // En lugar de eliminar, desactivamos el usuario
    user.isActive = false;
    await this.userRepository.save(user);

    return true;
  }

  /**
   * Reactivar usuario
   */
  async reactivateUser(id: number): Promise<UserResponse | null> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      return null;
    }

    user.isActive = true;
    const updatedUser = await this.userRepository.save(user);
    
    return UserResponseMapper.toResponse(updatedUser);
  }

  /**
   * Alternar estado de administrador
   */
  async toggleAdminStatus(id: number): Promise<UserResponse | null> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      return null;
    }

    user.isAdmin = !user.isAdmin;
    const updatedUser = await this.userRepository.save(user);
    
    return UserResponseMapper.toResponse(updatedUser);
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { isActive: true } });
    const adminUsers = await this.userRepository.count({ where: { isAdmin: true } });
    const inactiveUsers = totalUsers - activeUsers;

    return {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      admins: adminUsers,
      activePercentage: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
      adminPercentage: totalUsers > 0 ? Math.round((adminUsers / totalUsers) * 100) : 0
    };
  }
}