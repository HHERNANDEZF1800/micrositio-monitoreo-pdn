CREATE DATABASE IF NOT EXISTS monitoreo_pdn
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE monitoreo_pdn;

-- Tabla de catálogo de sistemas
CREATE TABLE IF NOT EXISTS catalogo_sistemas (
    id INT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,  -- Añadido UNIQUE para poder hacerlo FK
    nombre VARCHAR(255) NOT NULL,
    INDEX idx_codigo (codigo)
) ENGINE=InnoDB;

-- Inserción de datos en el catálogo de sistemas
INSERT IGNORE INTO catalogo_sistemas (id, codigo, nombre) VALUES 
(1, 'S1', 'Sistema de evolución patrimonial, de declaración de intereses y constancia de presentación de declaración fiscal'),
(2, 'S2', 'Sistema de los servidores públicos que intervengan en procedimientos de contrataciones públicas'),
(3, 'S3_graves', 'Sistema nacional de servidores públicos y particulares sancionados - Faltas graves'),
(4, 'S3_no_graves', 'Sistema nacional de servidores públicos y particulares sancionados - Faltas no graves'),
(5, 'S3_personas_fisicas', 'Sistema nacional de servidores públicos y particulares sancionados - Personas físicas'),
(6, 'S3_personas_morales', 'Sistema nacional de servidores públicos y particulares sancionados - Personas morales');

CREATE TABLE IF NOT EXISTS registros_ejecucion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fecha_ejecucion DATE NOT NULL,
    hora_ejecucion TIME NOT NULL,
    ente VARCHAR(100) NOT NULL,
    total_registros VARCHAR(30) NOT NULL,
    estatus VARCHAR(100) NOT NULL,
    sistema_origen VARCHAR(30) NOT NULL,
    
    INDEX idx_fecha (fecha_ejecucion),
    INDEX idx_ente (ente),
    INDEX idx_sistema_origen (sistema_origen),
    
    CONSTRAINT fk_sistema_origen FOREIGN KEY (sistema_origen) 
    REFERENCES catalogo_sistemas(codigo) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Creación de usuario separada del GRANT (forma recomendada)
CREATE USER IF NOT EXISTS 'registros_user'@'%' IDENTIFIED BY 'password_segura';
GRANT ALL PRIVILEGES ON monitoreo_pdn.* TO 'registros_user'@'%';
FLUSH PRIVILEGES;