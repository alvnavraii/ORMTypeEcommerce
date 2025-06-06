import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno primero
dotenv.config();

// Configurar timezone desde variables de entorno
process.env.TZ = process.env.TIMEZONE || 'Europe/Madrid';
import { AuthController, initializeAuthService } from './controllers/auth.controller';
import { createAuthRoutes } from './routes/auth.routes';
import userRoutes from './routes/users.routes';
import { AppDataSource } from '../data-source';
import { TimezoneUtil } from './utils/timezone';
import { User } from './entity/User';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Middleware de logging
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.path} - Body:`, req.body);
    next();
});

// Ruta de prueba
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API funcionando correctamente' });
});

// Inicialización de la aplicación
async function initializeApp() {
    try {
        console.log('🔄 Iniciando conexión a la base de datos...');
        console.log('🌍 Timezone configurado:', TimezoneUtil.getTimezone());
        console.log('🕒 Hora actual:', TimezoneUtil.formatForUser(TimezoneUtil.now()));
        console.log('📊 Configuración de DB:', {
            host: process.env.DB_HOST || "localhost",
            port: process.env.DB_PORT || "5433",
            database: process.env.DB_NAME || "ecommerce"
        });
        
        // 1. Inicializar DataSource
        await AppDataSource.initialize();
        console.log('✅ Conexión a la base de datos establecida');

        // Verificar que la tabla users existe o se crea
        console.log('🔄 Sincronizando esquema de base de datos...');
        await AppDataSource.synchronize();
        console.log('✅ Esquema sincronizado');

        console.log('🔄 Inicializando servicios...');
        
        // 2. Inicializar servicios
        const authService = await initializeAuthService(AppDataSource);
        const authController = AuthController.getInstance(authService);
        
        console.log('✅ Servicios inicializados');
        console.log('🔄 Configurando rutas...');

        // 3. Configurar rutas
        const authRoutes = createAuthRoutes(authController);
        
        // Añadir logging específico para las rutas de auth
        app.use('/api/auth', (req, res, next) => {
            console.log(`🔗 Ruta auth interceptada: ${req.method} /api/auth${req.path}`);
            next();
        }, authRoutes);
        
        // Rutas de usuarios con middleware de autenticación
        app.use('/api/users', (req, res, next) => {
            console.log(`👥 Ruta users interceptada: ${req.method} /api/users${req.path}`);
            next();
        }, userRoutes);
        
        console.log('✅ Rutas configuradas:');
        console.log('   📋 /api/auth (autenticación)');
        console.log('   👥 /api/users (gestión de usuarios)');
        
        // Ruta de test adicional para verificar
        app.get('/api/test', (req, res) => {
            const now = TimezoneUtil.now();
            res.json({ 
                message: 'Rutas funcionando', 
                timezone: TimezoneUtil.getTimezone(),
                timestamp: now,
                formatted: TimezoneUtil.formatForUser(now),
                iso: TimezoneUtil.nowISO(),
                utc: new Date().toISOString()
            });
        });

        // Ruta para información de timezone
        app.get('/api/timezone', (req, res) => {
            const timezoneInfo = TimezoneUtil.getTimezoneInfo();
            res.json({
                message: 'Información de timezone',
                ...timezoneInfo
            });
        });

        // Ruta para probar fechas en base de datos
        app.get('/api/test-dates', async (req, res) => {
            try {
                // Crear un usuario de prueba
                const userRepository = AppDataSource.getRepository(User);
                
                const testUser = new User();
                testUser.email = `test-${Date.now()}@example.com`;
                testUser.firstName = 'Test';
                testUser.lastName = 'Dates';
                testUser.phone = '+34 600 000 000';
                await testUser.setPassword('Test123!');
                
                console.log('🔍 Fechas antes de guardar:');
                console.log('createdAt:', testUser.createdAt);
                console.log('updatedAt:', testUser.updatedAt);
                
                const savedUser = await userRepository.save(testUser);
                
                console.log('🔍 Fechas después de guardar:');
                console.log('createdAt:', savedUser.createdAt);
                console.log('updatedAt:', savedUser.updatedAt);
                
                // Actualizar el usuario para probar updatedAt
                savedUser.firstName = 'Updated';
                const updatedUser = await userRepository.save(savedUser);
                
                console.log('🔍 Fechas después de actualizar:');
                console.log('createdAt:', updatedUser.createdAt);
                console.log('updatedAt:', updatedUser.updatedAt);
                
                // Eliminar el usuario de prueba
                await userRepository.remove(updatedUser);
                
                res.json({
                    message: 'Test de fechas completado',
                    results: {
                        original: {
                            createdAt: savedUser.createdAt,
                            updatedAt: savedUser.updatedAt,
                            createdAtFormatted: TimezoneUtil.formatForUser(savedUser.createdAt),
                            updatedAtFormatted: TimezoneUtil.formatForUser(savedUser.updatedAt)
                        },
                        updated: {
                            createdAt: updatedUser.createdAt,
                            updatedAt: updatedUser.updatedAt,
                            createdAtFormatted: TimezoneUtil.formatForUser(updatedUser.createdAt),
                            updatedAtFormatted: TimezoneUtil.formatForUser(updatedUser.updatedAt)
                        },
                        timezone: TimezoneUtil.getTimezone(),
                        serverTime: TimezoneUtil.formatForUser(TimezoneUtil.now())
                    }
                });
            } catch (error: any) {
                console.error('❌ Error en test de fechas:', error);
                res.status(500).json({ error: error.message });
            }
        });

        // 4. Manejo de errores 404 - DESPUÉS de configurar todas las rutas
        app.use((req, res) => {
            console.log(`❌ Ruta no encontrada: ${req.method} ${req.path}`);
            res.status(404).json({ 
                error: 'Ruta no encontrada',
                path: req.path,
                method: req.method,
                availableRoutes: [
                    'GET /',
                    'GET /api/test',
                    'GET /api/timezone',
                    'GET /api/test-dates',
                    'POST /api/auth/register',
                    'POST /api/auth/login',
                    'GET /api/users/me (requires auth)',
                    'GET /api/users (admin only)',
                    'POST /api/users (admin only)',
                    'PUT /api/users/profile (requires auth)',
                    'PUT /api/users/change-password (requires auth)'
                ]
            });
        });

        // 5. Iniciar servidor
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
            console.log('📋 Rutas disponibles:');
            console.log('   GET  / (test básico)');
            console.log('   GET  /api/test (test de rutas)');
            console.log('   GET  /api/timezone (info timezone)');
            console.log('   GET  /api/test-dates (test fechas BD)');
            console.log('');
            console.log('🔐 Autenticación:');
            console.log('   POST /api/auth/register');
            console.log('   POST /api/auth/login');
            console.log('');
            console.log('👥 Gestión de usuarios:');
            console.log('   GET  /api/users/me (perfil propio)');
            console.log('   PUT  /api/users/profile (actualizar perfil)');
            console.log('   PUT  /api/users/change-password (cambiar contraseña)');
            console.log('   GET  /api/users (listar usuarios - admin)');
            console.log('   POST /api/users (crear usuario - admin)');
            console.log('   GET  /api/users/stats (estadísticas - admin)');
            console.log('');
            console.log('🔍 Prueba primero:');
            console.log(`   curl http://localhost:${PORT}/api/test`);
            console.log('   1. Registra un usuario: POST /api/auth/register');
            console.log('   2. Haz login: POST /api/auth/login');
            console.log('   3. Usa el token en Authorization: Bearer <token>');
        });

        // Añadir manejo de cierre graceful
        process.on('SIGTERM', () => {
            console.log('🛑 Cerrando servidor...');
            server.close(() => {
                AppDataSource.destroy();
            });
        });
        
    } catch (error) {
        console.error('❌ Error al iniciar la aplicación:', error);
        if (error instanceof Error) {
            console.error('Mensaje:', error.message);
            console.error('Stack:', error.stack);
        }
        process.exit(1);
    }
}

// Iniciar la aplicación
initializeApp();
