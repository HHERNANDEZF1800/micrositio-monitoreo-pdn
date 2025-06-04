# Dashboard PDN - Plataforma Digital Nacional

## Configuración del Proyecto

### 1. Instalación

\`\`\`bash
# Instalar dependencias
npm install

# Crear directorio para datos
mkdir data

# Copiar archivos CSV al directorio data
cp /ruta/a/tu/archivo/s1_declaraciones.csv ./data/
cp /ruta/a/tu/archivo/s2_contrataciones.csv ./data/
cp /ruta/a/tu/archivo/s3_faltas_graves.csv ./data/
\`\`\`

### 2. Configuración de Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

\`\`\`env
# Modo de desarrollo
NEXT_PUBLIC_ENV_MODE=local

# Rutas de archivos CSV (relativas al proyecto)
NEXT_PUBLIC_CSV_SISTEMA1_PATH=./data/s1_declaraciones.csv
NEXT_PUBLIC_CSV_SISTEMA2_PATH=./data/s2_contrataciones.csv
NEXT_PUBLIC_CSV_SISTEMA3_PATH=./data/s3_faltas_graves.csv

# URLs para producción (opcional)
NEXT_PUBLIC_CSV_SISTEMA1_URL=
NEXT_PUBLIC_CSV_SISTEMA2_URL=
NEXT_PUBLIC_CSV_SISTEMA3_URL=
\`\`\`

### 3. Estructura de Directorios

\`\`\`
proyecto/
├── app/
├── data/                    # ← Directorio para archivos CSV
│   ├── s1_declaraciones.csv
│   ├── s2_contrataciones.csv
│   └── s3_faltas_graves.csv
├── .env.local              # ← Variables de entorno
├── package.json
└── README.md
\`\`\`

### 4. Ejecutar el Proyecto

\`\`\`bash
# Modo desarrollo
npm run dev

# El proyecto estará disponible en http://localhost:3000
\`\`\`

### 5. Comandos Útiles

\`\`\`bash
# Verificar que los archivos están en su lugar
ls -la ./data/

# Verificar permisos
chmod 644 ./data/*.csv

# Ver contenido de un archivo CSV
head -5 ./data/s1_declaraciones.csv
\`\`\`

## Características

- ✅ **Configuración flexible**: Usa rutas relativas al proyecto
- ✅ **Modo dual**: Local y producción
- ✅ **Diagnóstico automático**: Detecta problemas de configuración
- ✅ **Búsqueda inteligente**: Sugiere rutas alternativas
- ✅ **Validación CSV**: Verifica formato y contenido

## Solución de Problemas

### Error: Archivo no encontrado

1. Verifica que el directorio `data` existe:
   \`\`\`bash
   mkdir -p data
   \`\`\`

2. Copia tu archivo CSV:
   \`\`\`bash
   cp /ruta/completa/a/tu/archivo.csv ./data/
   \`\`\`

3. Verifica la configuración en `.env.local`

4. Reinicia el servidor:
   \`\`\`bash
   npm run dev
   \`\`\`

### Error: Sin permisos

\`\`\`bash
chmod 644 ./data/*.csv
\`\`\`

### Error: Formato CSV inválido

Verifica que tu archivo CSV tiene:
- Encabezados en la primera línea
- Datos separados por comas
- Codificación UTF-8
