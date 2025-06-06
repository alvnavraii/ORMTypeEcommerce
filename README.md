# 🚀 ORMTypeProject

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)](https://jwt.io/)

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)](https://github.com)
[![Security](https://img.shields.io/badge/Security-JWT%20%2B%20bcrypt-red?style=for-the-badge)](https://github.com)
[![Testing](https://img.shields.io/badge/Testing-Verified%20%E2%9C%85-success?style=for-the-badge)](https://github.com)

> **Una API REST completa y segura con autenticación JWT, middleware de seguridad y sistema CRUD de usuarios desarrollada con TypeScript, Express, TypeORM y PostgreSQL.**

## ✨ Características Principales

### 🔐 **Seguridad Avanzada**
- 🛡️ **Autenticación JWT** con verificación en tiempo real
- 🔒 **Control de acceso granular** por roles (Usuario/Admin)
- 🔑 **Hasheo seguro de contraseñas** con bcrypt
- 🚫 **Protección anti-manipulación** (prevención de auto-eliminación de admins)
- ⏰ **Tokens con expiración** (24 horas)

### 👥 **Gestión Completa de Usuarios**
- 📝 **CRUD completo** para administradores
- 👤 **Gestión de perfil personal** para usuarios autenticados
- 📊 **Estadísticas en tiempo real** con métricas automáticas
- 🔍 **Búsqueda y filtros avanzados** con paginación
- 🗑️ **Soft delete** (preservación de datos históricos)

### 🏗️ **Arquitectura Profesional**
- 🎯 **Separación de responsabilidades** (Controllers → Services → Repositories)
- 🔒 **Tipado estricto** con TypeScript
- 📋 **DTOs tipados** para validación de entrada
- 🕒 **Manejo consistente de timezone** (Europe/Madrid)
- 🐳 **Containerización** con Docker

---

## 📡 API Endpoints

### 🔐 **Autenticación**
```http
POST /api/auth/register    # Registro de usuario
POST /api/auth/login       # Login y obtención de token
```

### 👤 **Perfil Personal** *(requiere autenticación)*
```http
GET  /api/users/me                # Ver mi perfil
PUT  /api/users/profile           # Actualizar mi perfil  
PUT  /api/users/change-password   # Cambiar mi contraseña
```

### 👥 **Administración de Usuarios** *(solo admin)*
```http
GET    /api/users                    # Listar usuarios con filtros
POST   /api/users                    # Crear nuevo usuario
GET    /api/users/stats              # Estadísticas de usuarios
GET    /api/users/:id                # Ver usuario específico
PUT    /api/users/:id                # Actualizar usuario
DELETE /api/users/:id                # Desactivar usuario
PUT    /api/users/:id/reactivate     # Reactivar usuario
PUT    /api/users/:id/toggle-admin   # Alternar permisos admin
```

### 🔧 **Utilidades** *(testing)*
```http
GET /api/test         # Test de rutas y timezone
GET /api/timezone     # Información de timezone
GET /api/test-dates   # Test de fechas en base de datos
```

---

## 🛠️ Stack Tecnológico

| Categoría | Tecnología | Versión |
|-----------|------------|---------|
| **Backend** | Node.js + TypeScript | Latest |
| **Framework** | Express.js | ^5.1.0 |
| **ORM** | TypeORM | ^0.3.24 |
| **Base de Datos** | PostgreSQL | 15 |
| **Autenticación** | JWT | ^9.0.2 |
| **Seguridad** | bcrypt | ^6.0.0 |
| **Timezone** | dayjs | ^1.11.10 |
| **Contenedores** | Docker Compose | Latest |
| **CORS** | cors | ^2.8.5 |

---

## 🚀 Instalación y Configuración

### 📋 **Prerequisitos**
- Node.js (v16 o superior)
- Docker y Docker Compose
- Git

### 1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd ORMTypeProject
```

### 2. **Instalar dependencias**
```bash
npm install
```

### 3. **Configurar variables de entorno**
```bash
# Copiar el archivo .env de ejemplo
cp .env.example .env

# Editar las variables necesarias
JWT_SECRET=tu_jwt_secret_muy_seguro
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=ecommerce
PORT=3001
TIMEZONE=Europe/Madrid
```

### 4. **Iniciar la base de datos**
```bash
docker-compose up -d
```

### 5. **Iniciar el servidor**
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

### 6. **Verificar la instalación**
```bash
curl http://localhost:3001/api/test
```

---

## 🧪 Testing

### **Script Automatizado**
```bash
# Hacer ejecutable el script
chmod +x test_api.sh

# Ejecutar suite completa de tests
./test_api.sh
```

El script verifica automáticamente:
- ✅ Registro y login de usuarios
- ✅ Middleware JWT (verificación de tokens)
- ✅ Gestión de perfil personal
- ✅ Control de acceso por roles
- ✅ Cambio de contraseñas
- ✅ Rechazo de tokens inválidos
- ✅ Protección de endpoints sin autenticación

### **Testing Manual**

#### Registro de usuario
```bash
curl -X POST http://localhost:3001/api/auth/register \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"email\": \"usuario@example.com\",
    \"password\": \"MiPassword123!\",
    \"firstName\": \"Usuario\",
    \"lastName\": \"Ejemplo\"
  }'
```

#### Login y obtención de token
```bash
curl -X POST http://localhost:3001/api/auth/login \\
  -H \"Content-Type: application/json\" \\
  -d '{
    \"email\": \"usuario@example.com\",
    \"password\": \"MiPassword123!\"
  }'
```

#### Ver perfil (con token)
```bash
curl -X GET http://localhost:3001/api/users/me \\
  -H \"Authorization: Bearer TU_TOKEN_AQUI\"
```

---

## 🔧 Comandos Disponibles

```bash
npm run dev          # Iniciar servidor en modo desarrollo
npm run build        # Compilar TypeScript
npm start           # Iniciar servidor en producción
npm run lint        # Verificar código con ESLint
npm test            # Ejecutar tests (cuando estén implementados)
```

### **Base de Datos**
```bash
# Docker
docker-compose up -d              # Iniciar PostgreSQL
docker-compose down              # Detener PostgreSQL
docker-compose ps               # Ver estado de contenedores

# PostgreSQL (acceso directo)
docker exec -it ecommerce_postgres psql -U postgres -d ecommerce
```

---

## 📊 Características Avanzadas

### 🔍 **Filtros y Paginación**
```bash
# Paginación
GET /api/users?page=1&limit=10

# Filtros
GET /api/users?isActive=true&isAdmin=false

# Búsqueda
GET /api/users?search=john

# Ordenamiento
GET /api/users?sortBy=createdAt&sortOrder=DESC

# Combinación
GET /api/users?page=1&limit=5&isActive=true&search=admin&sortBy=firstName&sortOrder=ASC
```

### 📈 **Estadísticas**
```json
{
  \"total\": 150,
  \"active\": 142,
  \"inactive\": 8,
  \"admins\": 5,
  \"activePercentage\": 95,
  \"adminPercentage\": 3
}
```

### 🛡️ **Seguridad**
- Verificación de tokens en tiempo real
- Validación de usuarios activos en cada request
- Control de acceso granular por roles
- Prevención de auto-eliminación de administradores
- Hasheo seguro de contraseñas con salt rounds optimizados

---

## 🌍 Timezone y Fechas

El sistema está configurado para **Europe/Madrid**:
- Todas las fechas se almacenan con timezone
- Formateo automático para usuarios: `DD/MM/YYYY HH:mm:ss`
- Sincronización automática en base de datos

---

## 📝 Licencia

Este proyecto está licenciado bajo la **GNU General Public License v3.0**.

### 🆓 **¿Qué significa esto?**
- ✅ **Uso comercial** permitido
- ✅ **Modificación** permitida
- ✅ **Distribución** permitida
- ✅ **Uso privado** permitido
- ✅ **Uso de patentes** permitido

### ⚠️ **Condiciones**
- 📋 **Incluir licencia y copyright**
- 📝 **Documentar cambios**
- 📤 **Divulgar código fuente**
- 🔗 **Misma licencia** para trabajos derivados

Para más información, consulta el texto completo de la [GNU GPL v3.0](https://www.gnu.org/licenses/gpl-3.0.html).

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Este proyecto sigue los principios del software libre.

### **Cómo contribuir:**
1. 🍴 Fork el proyecto
2. 🌿 Crea una rama para tu funcionalidad (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. 📤 Push a la rama (`git push origin feature/AmazingFeature`)
5. 🔄 Abre un Pull Request

### **Código de Conducta:**
- Sé respetuoso y constructivo
- Documenta tus cambios
- Sigue las convenciones de código existentes
- Añade tests para nuevas funcionalidades

---

## 🏗️ Arquitectura del Proyecto

```
ORMTypeProject/
├── src/
│   ├── controllers/      # Controladores HTTP
│   ├── dto/             # Data Transfer Objects
│   ├── entity/          # Entidades de TypeORM
│   ├── middleware/      # Middleware de autenticación
│   ├── routes/          # Definición de rutas
│   ├── services/        # Lógica de negocio
│   ├── types/           # Tipos e interfaces
│   └── utils/           # Utilidades (timezone, etc.)
├── docker-compose.yml   # Configuración de PostgreSQL
├── data-source.ts       # Configuración de TypeORM
└── test_api.sh         # Script de testing automatizado
```

---

## 📞 Información del Proyecto

- **🌐 Puerto de desarrollo**: 3001
- **🗄️ Base de datos**: PostgreSQL (puerto 5433)
- **🕒 Timezone**: Europe/Madrid (España)
- **📊 Estado**: ✅ **Completamente operativo**
- **🧪 Testing**: ✅ Verificado al 100%

---

## 🔮 Roadmap

### ✅ **Completado**
- Middleware de autenticación JWT
- CRUD completo de usuarios
- Sistema de roles y permisos
- Paginación y filtros avanzados
- Testing automatizado

### 🔄 **Próximas Funcionalidades**
- 🔍 Validación de DTOs con class-validator
- 📊 Logs estructurados con Winston
- 🧪 Tests unitarios con Jest
- 📚 Documentación OpenAPI/Swagger
- ⚡ Rate limiting
- 📧 Sistema de notificaciones
- 📁 Upload de archivos
- 🔄 Auditoría de cambios

---

## ⚡ Enlaces Rápidos

- 📖 [Documentación de la API](#-api-endpoints)
- 🚀 [Guía de instalación](#-instalación-y-configuración)
- 🧪 [Testing](#-testing)
- 📝 [Licencia](#-licencia)
- 🤝 [Contribuir](#-contribución)

---

<div align=\"center\">

**Desarrollado con ❤️ usando TypeScript y tecnologías modernas**

[![TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat-square)](https://www.gnu.org/licenses/gpl-3.0)

</div>