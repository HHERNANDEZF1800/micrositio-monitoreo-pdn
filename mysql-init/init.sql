CREATE DATABASE IF NOT EXISTS monitoreo_pdn;
USE monitoreo_pdn;

-- Tabla de catálogo de sistemas
CREATE TABLE IF NOT EXISTS catalogo_sistemas (
    id INT PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    
    INDEX idx_codigo (codigo)
);

-- Inserción de datos en el catálogo de sistemas
INSERT INTO catalogo_sistemas (id, codigo, nombre) VALUES 
(1, 'S1', 'Sistema de evolución patrimonial, de declaración de intereses y constancia de presentación de declaración fiscal'),
(2, 'S2', 'Sistema de los servidores públicos que intervengan en procedimientos de contrataciones públicas'),
(3, 'S3', 'Sistema nacional de servidores públicos y particulares sancionados');

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
    INDEX idx_ente (ente),
    
    CONSTRAINT fk_sistema_origen FOREIGN KEY (sistema_origen) 
    REFERENCES catalogo_sistemas(codigo) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Usa el nombre de usuario y contraseña que definiste en tu .env
GRANT ALL PRIVILEGES ON monitoreo_pdn.* TO 'registros_user'@'%' IDENTIFIED BY 'password_segura';
FLUSH PRIVILEGES;