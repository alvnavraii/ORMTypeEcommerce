#!/bin/bash

# 🧪 Script de Testing para CRUD de Usuarios y Middleware JWT
# Este script prueba todas las funcionalidades implementadas

# Configuración
BASE_URL="http://localhost:3001"
TOKEN=""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Testing del Sistema de Usuarios y Middleware JWT${NC}"
echo "=================================================="

# Función para hacer requests
make_request() {
    local method=$1
    local endpoint=$2
    local data=$3
    local use_token=$4
    
    if [ "$use_token" = "true" ] && [ -n "$TOKEN" ]; then
        curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data"
    else
        curl -s -X $method "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

# Función para extraer token de respuesta
extract_token() {
    echo "$1" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4
}

echo -e "\n${YELLOW}📋 1. Verificando que el servidor esté corriendo...${NC}"
health_check=$(curl -s "$BASE_URL/" 2>/dev/null)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Servidor corriendo correctamente${NC}"
else
    echo -e "${RED}❌ Error: Servidor no responde. Asegúrate de que esté corriendo en puerto 3001${NC}"
    exit 1
fi

echo -e "\n${YELLOW}📋 2. Registrando usuario de prueba...${NC}"
register_data='{
    "email": "testuser@example.com",
    "password": "Test123!",
    "firstName": "Test",
    "lastName": "User"
}'

register_response=$(make_request "POST" "/api/auth/register" "$register_data" "false")
if echo "$register_response" | grep -q '"accessToken"'; then
    echo -e "${GREEN}✅ Usuario registrado exitosamente${NC}"
    TOKEN=$(extract_token "$register_response")
    echo -e "${BLUE}🔑 Token obtenido: ${TOKEN:0:20}...${NC}"
else
    echo -e "${YELLOW}⚠️  Usuario ya existe, intentando login...${NC}"
    
    # Intentar login
    login_data='{
        "email": "testuser@example.com",
        "password": "Test123!"
    }'
    
    login_response=$(make_request "POST" "/api/auth/login" "$login_data" "false")
    if echo "$login_response" | grep -q '"accessToken"'; then
        echo -e "${GREEN}✅ Login exitoso${NC}"
        TOKEN=$(extract_token "$login_response")
        echo -e "${BLUE}🔑 Token obtenido: ${TOKEN:0:20}...${NC}"
    else
        echo -e "${RED}❌ Error en login: $login_response${NC}"
        exit 1
    fi
fi

echo -e "\n${YELLOW}📋 3. Probando middleware JWT - Ver perfil propio${NC}"
profile_response=$(make_request "GET" "/api/users/me" "" "true")
if echo "$profile_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Middleware JWT funcionando - Perfil obtenido${NC}"
    echo -e "${BLUE}👤 Usuario: $(echo "$profile_response" | grep -o '"firstName":"[^"]*"' | cut -d'"' -f4) $(echo "$profile_response" | grep -o '"lastName":"[^"]*"' | cut -d'"' -f4)${NC}"
else
    echo -e "${RED}❌ Error obteniendo perfil: $profile_response${NC}"
fi

echo -e "\n${YELLOW}📋 4. Probando actualización de perfil${NC}"
update_profile_data='{
    "firstName": "Updated",
    "lastName": "Name",
    "phone": "+34 600 123 456"
}'

update_response=$(make_request "PUT" "/api/users/profile" "$update_profile_data" "true")
if echo "$update_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Perfil actualizado exitosamente${NC}"
else
    echo -e "${RED}❌ Error actualizando perfil: $update_response${NC}"
fi

echo -e "\n${YELLOW}📋 5. Probando cambio de contraseña${NC}"
change_password_data='{
    "currentPassword": "Test123!",
    "newPassword": "NewTest123!"
}'

password_response=$(make_request "PUT" "/api/users/change-password" "$change_password_data" "true")
if echo "$password_response" | grep -q '"success":true'; then
    echo -e "${GREEN}✅ Contraseña cambiada exitosamente${NC}"
    
    # Probar login con nueva contraseña
    echo -e "${YELLOW}🔄 Verificando login con nueva contraseña...${NC}"
    new_login_data='{
        "email": "testuser@example.com",
        "password": "NewTest123!"
    }'
    
    new_login_response=$(make_request "POST" "/api/auth/login" "$new_login_data" "false")
    if echo "$new_login_response" | grep -q '"accessToken"'; then
        echo -e "${GREEN}✅ Login con nueva contraseña exitoso${NC}"
        TOKEN=$(extract_token "$new_login_response")
    else
        echo -e "${RED}❌ Error en login con nueva contraseña${NC}"
    fi
else
    echo -e "${RED}❌ Error cambiando contraseña: $password_response${NC}"
fi

echo -e "\n${YELLOW}📋 6. Probando acceso a funciones de admin (debería fallar)${NC}"
users_list_response=$(make_request "GET" "/api/users" "" "true")
if echo "$users_list_response" | grep -q '"error.*Acceso denegado"'; then
    echo -e "${GREEN}✅ Control de acceso funcionando - Usuario normal no puede acceder a funciones admin${NC}"
elif echo "$users_list_response" | grep -q '"success":true'; then
    echo -e "${YELLOW}⚠️  Usuario ya es admin - Saltando creación de admin${NC}"
    IS_ADMIN=true
else
    echo -e "${RED}❌ Error inesperado: $users_list_response${NC}"
fi

# Crear usuario admin para probar funcionalidades administrativas
echo -e "\n${YELLOW}📋 7. Creando usuario administrador...${NC}"
admin_register_data='{
    "email": "admin@example.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
}'

admin_register_response=$(make_request "POST" "/api/auth/register" "$admin_register_data" "false")
if echo "$admin_register_response" | grep -q '"accessToken"' || echo "$admin_register_response" | grep -q "ya está registrado"; then
    echo -e "${GREEN}✅ Usuario admin creado/existe${NC}"
    
    # Login como admin
    admin_login_data='{
        "email": "admin@example.com",
        "password": "Admin123!"
    }'
    
    admin_login_response=$(make_request "POST" "/api/auth/login" "$admin_login_data" "false")
    if echo "$admin_login_response" | grep -q '"accessToken"'; then
        ADMIN_TOKEN=$(extract_token "$admin_login_response")
        echo -e "${BLUE}🔑 Token admin obtenido: ${ADMIN_TOKEN:0:20}...${NC}"
        
        # NOTA: En un entorno real, necesitarías actualizar la BD para hacer admin al usuario
        echo -e "${YELLOW}⚠️  NOTA: Para probar funciones admin, ejecuta en la BD:${NC}"
        echo -e "${BLUE}   UPDATE users SET is_admin = true WHERE email = 'admin@example.com';${NC}"
    else
        echo -e "${RED}❌ Error en login admin: $admin_login_response${NC}"
    fi
else
    echo -e "${RED}❌ Error registrando admin: $admin_register_response${NC}"
fi

echo -e "\n${YELLOW}📋 8. Probando endpoint sin autenticación (debería fallar)${NC}"
no_auth_response=$(make_request "GET" "/api/users/me" "" "false")
if echo "$no_auth_response" | grep -q '"error.*Token de acceso requerido"'; then
    echo -e "${GREEN}✅ Middleware JWT bloqueando acceso sin token${NC}"
else
    echo -e "${RED}❌ Error: Acceso permitido sin token${NC}"
fi

echo -e "\n${YELLOW}📋 9. Probando token inválido${NC}"
invalid_token_response=$(curl -s -X GET "$BASE_URL/api/users/me" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer token_invalido_12345")

if echo "$invalid_token_response" | grep -q '"error.*Token inválido"'; then
    echo -e "${GREEN}✅ Middleware JWT rechazando tokens inválidos${NC}"
else
    echo -e "${RED}❌ Error: Token inválido aceptado${NC}"
fi

echo -e "\n${YELLOW}📋 10. Probando estadísticas (con usuario normal - debería fallar)${NC}"
stats_response=$(make_request "GET" "/api/users/stats" "" "true")
if echo "$stats_response" | grep -q '"error.*Acceso denegado"'; then
    echo -e "${GREEN}✅ Control de acceso admin funcionando${NC}"
else
    echo -e "${RED}❌ Error en control de acceso admin: $stats_response${NC}"
fi

echo -e "\n${GREEN}🎉 Testing completado!${NC}"
echo "=========================="
echo -e "${BLUE}📝 Resumen de funcionalidades probadas:${NC}"
echo "✅ Registro de usuarios"
echo "✅ Login y obtención de tokens"
echo "✅ Middleware JWT - Verificación de tokens"
echo "✅ Ver perfil propio"
echo "✅ Actualizar perfil"
echo "✅ Cambio de contraseña"
echo "✅ Control de acceso - Usuario normal vs Admin"
echo "✅ Rechazo de tokens inválidos"
echo "✅ Rechazo de acceso sin token"

echo -e "\n${YELLOW}🔄 Para probar funcionalidades de admin:${NC}"
echo "1. Conecta a la base de datos PostgreSQL"
echo "2. Ejecuta: UPDATE users SET is_admin = true WHERE email = 'admin@example.com';"
echo "3. Haz login como admin@example.com / Admin123!"
echo "4. Prueba los endpoints admin con el token obtenido"

echo -e "\n${BLUE}📚 Para más detalles, consulta: CRUD_USERS_GUIDE.md${NC}"