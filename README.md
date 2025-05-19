# Monitor PDN - Backend API

API para el Monitor de Conectividad y Actualización de la Plataforma Digital Nacional.

## Descripción

Este proyecto implementa una API REST con FastAPI para proporcionar los datos necesarios para el dashboard del Monitor de la Plataforma Digital Nacional. La API se conecta a una base de datos MariaDB para obtener información sobre la conectividad y actualización de los sistemas.

## Requisitos

- Python 3.8+
- MariaDB 10.5+
- Pip (gestor de paquetes de Python)
- Virtualenv (opcional, pero recomendado)

## Instalación

1. **Clonar el repositorio**:

```bash
git clone https://tu-repositorio.git
cd monitoreo-pdn-backend
```

2. **Crear un entorno virtual** (opcional pero recomendado):

```bash
python -m venv venv
```

3. **Activar el entorno virtual**:

- En Windows:

```bash
venv\Scripts\activate
```

- En macOS/Linux:

```bash
source venv/bin/activate
```

4. **Instalar dependencias**:

```bash
pip install -r requirements.txt
```

5. **Configurar variables de entorno**:

Copia el archivo `.env.example` a `.env` y configura las variables según tu entorno:

```bash
cp .env.example .env
# Edita el archivo .env con tus configuraciones
```

## Ejecución

### Desarrollo

Para ejecutar el servidor en modo desarrollo:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Producción

Para producción, se recomienda usar Gunicorn con Uvicorn como worker:

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

## Estructura de la API

- Ruta base: `/api/v1`
- Documentación: `/docs` o `/redoc`
- Estado: `/health`

### Endpoints principales:

- `/api/v1/dashboard/resumen` - Datos de resumen para las tarjetas iniciales
- `/api/v1/dashboard/distribucion-apis` - Distribución de APIs por sistema
- `/api/v1/dashboard/disponibilidad-apis` - Disponibilidad de APIs
- `/api/v1/dashboard/actualizacion-registros` - Actualización de registros
- `/api/v1/dashboard/ranking-entes` - Ranking de entes por desempeño
- `/api/v1/dashboard/alertas-criticas` - Alertas críticas del sistema
- `/api/v1/dashboard/dashboard-completo` - Todos los datos del dashboard en una sola llamada

## Desarrollo

### Estructura del proyecto

```
monitoreo-pdn-backend/
│
├── app/
│   ├── __init__.py
│   ├── main.py                  # Punto de entrada principal de la aplicación
│   ├── config.py                # Configuración de la aplicación (BD, entorno, etc.)
│   ├── database.py              # Configuración y conexión a la base de datos
│   │
│   ├── models/                  # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   └── models.py            # Definiciones de los modelos
│   │
│   ├── schemas/                 # Esquemas Pydantic para validación y serialización
│   │   ├── __init__.py
│   │   └── schemas.py           # Definiciones de los esquemas
│   │
│   ├── crud/                    # Operaciones CRUD para los modelos
│   │   ├── __init__.py
│   │   └── operations.py        # Funciones de operaciones de base de datos
│   │
│   ├── api/                     # Endpoints de la API
│   │   ├── __init__.py
│   │   ├── v1/                  # Versión 1 de la API
│   │   │   ├── __init__.py
│   │   │   ├── endpoints/       # Endpoints organizados por recurso
│   │   │   │   ├── __init__.py
│   │   │   │   ├── dashboard.py # Endpoints para las gráficas del dashboard
│   │   │   │   └── sistemas.py  # Endpoints para gestionar sistemas
│   │   │   │
│   │   │   └── api.py           # Router principal para la versión 1
│   │   │
│   │   └── deps.py              # Dependencias compartidas entre endpoints
│   │
│   └── core/                    # Funcionalidades centrales (si es necesario)
│       ├── __init__.py
│       └── security.py          # Configuración de seguridad (si es necesario)
│
├── requirements.txt             # Dependencias del proyecto
├── .env                         # Variables de entorno (no incluir en repositorio)
└── README.md                    # Documentación del proyecto
```

### Ejecutar migraciones (cuando se implemente)

Si en el futuro se implementa un sistema de migraciones con Alembic:

```bash
alembic upgrade head
```

## Licencia

MIT
