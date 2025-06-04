#!/bin/bash

echo "🚀 Configurando Dashboard PDN en ambiente local..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Crear directorio data si no existe
echo "📁 Creando directorio data..."
mkdir -p data

# Verificar si existe el archivo CSV original
CSV_ORIGINAL="/home/phoenix/sesna/desarrollo/otros/monitorear_api/resultados_s1/s1_declaraciones.csv"

if [ -f "$CSV_ORIGINAL" ]; then
    echo "📋 Copiando archivo CSV original..."
    cp "$CSV_ORIGINAL" ./data/s1_declaraciones.csv
    echo "✅ Archivo copiado exitosamente"
else
    echo "⚠️  Archivo original no encontrado en: $CSV_ORIGINAL"
    echo "💡 Puedes copiarlo manualmente con:"
    echo "   cp /ruta/a/tu/archivo.csv ./data/s1_declaraciones.csv"
fi

# Verificar archivos en data
echo "📊 Archivos en directorio data:"
ls -la ./data/

# Configurar variables de entorno si no existe .env.local
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creando archivo .env.local..."
    cat > .env.local << EOF
# Configuración para ambiente local
NEXT_PUBLIC_ENV_MODE=local

# Rutas de archivos CSV (relativas al proyecto)
NEXT_PUBLIC_CSV_SISTEMA1_PATH=./data/s1_declaraciones.csv
NEXT_PUBLIC_CSV_SISTEMA2_PATH=./data/s2_contrataciones.csv
NEXT_PUBLIC_CSV_SISTEMA3_PATH=./data/s3_faltas_graves.csv

# URLs para producción (no se usan en local)
NEXT_PUBLIC_CSV_SISTEMA1_URL=
NEXT_PUBLIC_CSV_SISTEMA2_URL=
NEXT_PUBLIC_CSV_SISTEMA3_URL=
EOF
    echo "✅ Archivo .env.local creado"
else
    echo "✅ Archivo .env.local ya existe"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencias instaladas correctamente"
else
    echo "❌ Error al instalar dependencias"
    exit 1
fi

# Verificar permisos de archivos CSV
if [ -f "./data/s1_declaraciones.csv" ]; then
    chmod 644 ./data/s1_declaraciones.csv
    echo "✅ Permisos de archivo CSV configurados"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "Para iniciar el proyecto ejecuta:"
echo "  npm run dev"
echo ""
echo "El proyecto estará disponible en: http://localhost:3000"
