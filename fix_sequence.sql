-- Script para ajustar la secuencia de IDs de usuarios
-- Asegura que el próximo usuario insertado tenga ID = 2

-- 1. Verificar el estado actual
SELECT 'Estado actual de la secuencia:' as info;
SELECT last_value, is_called FROM users_id_seq;

-- 2. Verificar el máximo ID actual en la tabla
SELECT 'Máximo ID actual en tabla users:' as info;
SELECT COALESCE(MAX(id), 0) as max_id FROM users;

-- 3. Ajustar la secuencia
SELECT 'Ajustando secuencia...' as info;
SELECT setval('users_id_seq', 1, true);

-- 4. Verificar el cambio
SELECT 'Nuevo estado de la secuencia:' as info;
SELECT last_value, is_called FROM users_id_seq;

-- 5. Mostrar qué ID se asignará al próximo INSERT
SELECT 'El próximo ID será:' as info;
SELECT nextval('users_id_seq') as next_id;

-- 6. Volver a establecer en 1 para que el próximo sea realmente 2
SELECT setval('users_id_seq', 1, true);

-- 7. Confirmación final
SELECT 'Configuración final - próximo ID será 2' as info;
SELECT last_value, is_called FROM users_id_seq;
