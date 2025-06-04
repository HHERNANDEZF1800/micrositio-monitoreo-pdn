#!/bin/bash

echo "🚀 Iniciando despliegue del Dashboard PDN..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar archivos CSV en modo local
if [ "$NEXT_PUBLIC_ENV_MODE" = "local" ]; then
    echo "🔍 Verificando archivos CSV locales..."
    if [ ! -d "data" ]; then
        echo "⚠️  Advertencia: Directorio 'data' no encontrado. Creándolo..."
        mkdir data
    fi
    
    if [ ! -f "data/s1_declaraciones.csv" ]; then
        echo "⚠️  Advertencia: Archivo s1_declaraciones.csv no encontrado en ./data/"
    fi
fi

# Construir el proyecto
echo "🔨 Construyendo el proyecto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Construcción exitosa!"
else
    echo "❌ Error en la construcción. Revisa los errores arriba."
    exit 1
fi

# Verificar variables de entorno
echo "🔧 Verificando configuración..."
if [ -z "$NEXT_PUBLIC_ENV_MODE" ]; then
    echo "⚠️  Advertencia: NEXT_PUBLIC_ENV_MODE no está configurado"
fi

echo "📊 Configuración actual:"
echo "  - Modo: ${NEXT_PUBLIC_ENV_MODE:-'no configurado'}"
echo "  - Sistema 1 Path: ${NEXT_PUBLIC_CSV_SISTEMA1_PATH:-'no configurado'}"
echo "  - Sistema 1 URL: ${NEXT_PUBLIC_CSV_SISTEMA1_URL:-'no configurado'}"

# Iniciar en modo producción local
if [ "$1" = "start" ]; then
    echo "🌟 Iniciando servidor de producción..."
    npm start
elif [ "$1" = "vercel" ]; then
    echo "☁️  Desplegando en Vercel..."
    vercel --prod
else
    echo "✅ Proyecto listo para desplegar!"
    echo ""
    echo "Opciones disponibles:"
    echo "  ./scripts/deploy.sh start   - Iniciar servidor local de producción"
    echo "  ./scripts/deploy.sh vercel  - Desplegar en Vercel"
    echo "  npm start                   - Iniciar servidor de producción"
    echo "  vercel --prod              - Desplegar en Vercel"
fi
