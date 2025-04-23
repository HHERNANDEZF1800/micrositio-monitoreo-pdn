-- mysql-init/init.sql
CREATE DATABASE IF NOT EXISTS monitoreo_pdn;
USE monitoreo_pdn;

CREATE TABLE IF NOT EXISTS registros_ejecucion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sistema_origen VARCHAR(50) NOT NULL,
    fecha_ejecucion DATE NOT NULL,
    hora_ejecucion TIME NOT NULL,
    ente VARCHAR(100) NOT NULL,
    total_registros INT NOT NULL,
    estatus VARCHAR(50) NOT NULL,
    fecha_importacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_sistema_origen (sistema_origen),
    INDEX idx_fecha_ejecucion (fecha_ejecucion),
    INDEX idx_ente (ente)
);

-- Usa el nombre de usuario y contraseña que definiste en tu .env
GRANT ALL PRIVILEGES ON registros_db.* TO 'registros_user'@'%' IDENTIFIED BY 'password_segura';
FLUSH PRIVILEGES;