from typing import List, Dict, Any, Optional, Tuple
from datetime import date, datetime, timedelta
from sqlalchemy import func, desc, text, select, distinct, case
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.sql.expression import cast
from sqlalchemy.types import Float

from app.models.models import CatalogoSistema, RegistroEjecucion


async def get_sistemas(db: AsyncSession) -> List[CatalogoSistema]:
    """
    Obtiene todos los sistemas del catálogo.
    
    Args:
        db: Sesión de base de datos asíncrona
        
    Returns:
        Lista de objetos CatalogoSistema
    """
    result = await db.execute(select(CatalogoSistema))
    return result.scalars().all()


async def get_sistema_by_codigo(db: AsyncSession, codigo: str) -> Optional[CatalogoSistema]:
    """
    Obtiene un sistema por su código.
    
    Args:
        db: Sesión de base de datos asíncrona
        codigo: Código del sistema
        
    Returns:
        Objeto CatalogoSistema o None si no existe
    """
    result = await db.execute(select(CatalogoSistema).where(CatalogoSistema.codigo == codigo))
    return result.scalar_one_or_none()


async def get_ultimo_registro_por_ente_sistema(
    db: AsyncSession, ente: str, sistema_origen: str
) -> Optional[RegistroEjecucion]:
    """
    Obtiene el último registro de ejecución para un ente y sistema específicos.
    
    Args:
        db: Sesión de base de datos asíncrona
        ente: Nombre del ente
        sistema_origen: Código del sistema
        
    Returns:
        Último registro de ejecución o None si no existe
    """
    stmt = (
        select(RegistroEjecucion)
        .where(
            RegistroEjecucion.ente == ente,
            RegistroEjecucion.sistema_origen == sistema_origen
        )
        .order_by(desc(RegistroEjecucion.fecha_ejecucion), desc(RegistroEjecucion.hora_ejecucion))
        .limit(1)
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def get_entes_conectados(db: AsyncSession) -> int:
    """
    Obtiene el número de entes conectados (entes distintos con al menos un registro).
    
    Args:
        db: Sesión de base de datos asíncrona
        
    Returns:
        Número de entes conectados
    """
    result = await db.execute(
        select(func.count(distinct(RegistroEjecucion.ente)))
    )
    return result.scalar_one()


async def get_apis_conectadas(db: AsyncSession) -> int:
    """
    Obtiene el número total de APIs conectadas.
    Consideramos cada combinación única de ente y sistema como una API.
    
    Args:
        db: Sesión de base de datos asíncrona
        
    Returns:
        Número total de APIs conectadas
    """
    stmt = select(
        func.count(distinct(func.concat(RegistroEjecucion.ente, '-', RegistroEjecucion.sistema_origen)))
    )
    result = await db.execute(stmt)
    return result.scalar_one()


async def get_distribucion_apis_por_sistema(db: AsyncSession) -> List[Dict[str, Any]]:
    """
    Obtiene la distribución de APIs por sistema.
    
    Args:
        db: Sesión de base de datos asíncrona
        
    Returns:
        Lista de diccionarios con la distribución de APIs por sistema
    """
    # Consulta para obtener el número de APIs (combinaciones únicas de ente-sistema) por sistema
    stmt = select(
        RegistroEjecucion.sistema_origen,
        func.count(distinct(RegistroEjecucion.ente)).label('count')
    ).group_by(RegistroEjecucion.sistema_origen)
    
    result = await db.execute(stmt)
    rows = result.all()
    
    # Obtener todos los sistemas para incluir su nombre completo
    sistemas = {sistema.codigo: sistema for sistema in await get_sistemas(db)}
    
    # Colores predefinidos para cada sistema
    colores = {
        'S1': '#3b82f6',
        'S2': '#8b5cf6',
        'S3_graves': '#ec4899',
        'S3_no_graves': '#f59e0b',
        'S3_personas_fisicas': '#84cc16',
        'S3_personas_morales': '#14b8a6'
    }
    
    # Transformar resultados al formato esperado por el frontend
    distribucion = []
    for codigo, count in rows:
        sistema_nombre = sistemas.get(codigo).nombre.split(' - ')[0] if codigo in sistemas else codigo
        # Usar un nombre más corto para el sistema
        nombre_corto = f"Sistema {codigo.split('_')[0].replace('S', '')}"
        if '_' in codigo:
            subtipo = codigo.split('_', 1)[1].replace('_', ' ').capitalize()
            nombre_corto = f"{nombre_corto} - {subtipo}"
            
        distribucion.append({
            "name": nombre_corto,
            "value": count,
            "color": colores.get(codigo, '#64748b')  # Color por defecto si no está definido
        })
    
    return distribucion


async def calcular_disponibilidad_apis(db: AsyncSession) -> List[Dict[str, Any]]:
    """
    Calcula la disponibilidad de APIs basado en el estatus de los últimos registros.
    
    Args:
        db: Sesión de base de datos asíncrona
        
    Returns:
        Lista de diccionarios con la distribución de disponibilidad
    """
    # Primero obtenemos todas las combinaciones únicas de ente-sistema
    stmt = select(
        distinct(RegistroEjecucion.ente),
        RegistroEjecucion.sistema_origen
    )
    result = await db.execute(stmt)
    combinaciones = result.all()
    
    # Para cada combinación, obtenemos el último registro
    total_apis = len(combinaciones)
    disponibilidad_alta = 0
    disponibilidad_media = 0
    disponibilidad_baja = 0
    
    for ente, sistema in combinaciones:
        ultimo_registro = await get_ultimo_registro_por_ente_sistema(db, ente, sistema)
        if ultimo_registro:
            # Determinar disponibilidad basado en el estatus
            if 'exitoso' in ultimo_registro.estatus.lower() or 'disponible' in ultimo_registro.estatus.lower():
                disponibilidad_alta += 1
            elif 'parcial' in ultimo_registro.estatus.lower() or 'limitado' in ultimo_registro.estatus.lower():
                disponibilidad_media += 1
            else:
                disponibilidad_baja += 1
        else:
            disponibilidad_baja += 1
    
    # Creamos los datos para el gráfico
    return [
        {
            "name": "Alta disponibilidad (≥90%)",
            "value": disponibilidad_alta,
            "color": "#22c55e"
        },
        {
            "name": "Media disponibilidad (70-89%)",
            "value": disponibilidad_media,
            "color": "#f59e0b"
        },
        {
            "name": "Baja disponibilidad (<70%)",
            "value": disponibilidad_baja,
            "color": "#ef4444"
        }
    ]


async def calcular_actualizacion_registros(db: AsyncSession) -> List[Dict[str, Any]]:
    """
    Calcula las métricas de actualización de registros comparando los totales
    entre los registros actuales y anteriores.
    
    Args:
        db: Sesión de base de datos asíncrona
        
    Returns:
        Lista de diccionarios con las métricas de actualización
    """
    # Obtener todos los entes y sistemas únicos
    stmt = select(
        distinct(RegistroEjecucion.ente),
        RegistroEjecucion.sistema_origen
    )
    result = await db.execute(stmt)
    combinaciones = result.all()
    
    # Fecha actual y fecha hace un mes para comparar
    hoy = datetime.now().date()
    hace_un_mes = hoy - timedelta(days=30)
    
    # Contadores para las categorías
    con_actualizacion = 0
    sin_cambios = 0
    con_disminucion = 0
    
    for ente, sistema in combinaciones:
        # Obtener el registro más reciente
        stmt_actual = (
            select(RegistroEjecucion)
            .where(
                RegistroEjecucion.ente == ente,
                RegistroEjecucion.sistema_origen == sistema
            )
            .order_by(desc(RegistroEjecucion.fecha_ejecucion), desc(RegistroEjecucion.hora_ejecucion))
            .limit(1)
        )
        result_actual = await db.execute(stmt_actual)
        registro_actual = result_actual.scalar_one_or_none()
        
        if not registro_actual:
            continue
        
        # Obtener el registro de hace un mes
        stmt_anterior = (
            select(RegistroEjecucion)
            .where(
                RegistroEjecucion.ente == ente,
                RegistroEjecucion.sistema_origen == sistema,
                RegistroEjecucion.fecha_ejecucion <= hace_un_mes
            )
            .order_by(desc(RegistroEjecucion.fecha_ejecucion), desc(RegistroEjecucion.hora_ejecucion))
            .limit(1)
        )
        result_anterior = await db.execute(stmt_anterior)
        registro_anterior = result_anterior.scalar_one_or_none()
        
        # Si no hay registro anterior, asumimos que no hay cambios
        if not registro_anterior:
            sin_cambios += 1
            continue
        
        # Comparar totales (convertir a enteros para hacer la comparación)
        try:
            total_actual = int(registro_actual.total_registros.replace(',', ''))
            total_anterior = int(registro_anterior.total_registros.replace(',', ''))
            
            if total_actual > total_anterior:
                con_actualizacion += 1
            elif total_actual < total_anterior:
                con_disminucion += 1
            else:
                sin_cambios += 1
        except (ValueError, AttributeError):
            # Si hay error en la conversión, asumimos que no hay cambios
            sin_cambios += 1
    
    # Creamos los datos para el gráfico
    return [
        {
            "name": "Con actualización",
            "value": con_actualizacion,
            "color": "#22c55e"
        },
        {
            "name": "Sin cambios",
            "value": sin_cambios,
            "color": "#94a3b8"
        },
        {
            "name": "Con disminución",
            "value": con_disminucion,
            "color": "#ef4444"
        }
    ]


async def obtener_ranking_entes(db: AsyncSession, limit: int = 8) -> List[Dict[str, Any]]:
    """
    Obtiene un ranking de entes basado en su desempeño (disponibilidad y actualización).
    
    Args:
        db: Sesión de base de datos asíncrona
        limit: Número máximo de entes a devolver
        
    Returns:
        Lista de diccionarios con el ranking de entes
    """
    # Obtener todos los entes únicos
    stmt_entes = select(distinct(RegistroEjecucion.ente))
    result_entes = await db.execute(stmt_entes)
    entes = [ente[0] for ente in result_entes.all()]
    
    # Datos para el ranking
    ranking_data = []
    
    for ente in entes:
        # Contar sistemas conectados
        stmt_sistemas = select(
            func.count(distinct(RegistroEjecucion.sistema_origen))
        ).where(RegistroEjecucion.ente == ente)
        result_sistemas = await db.execute(stmt_sistemas)
        num_sistemas = result_sistemas.scalar_one()
        
        # Calcular disponibilidad promedio (porcentaje de registros exitosos)
        # Obtener todos los registros recientes para este ente
        fecha_reciente = datetime.now().date() - timedelta(days=7)
        stmt_registros = (
            select(RegistroEjecucion)
            .where(
                RegistroEjecucion.ente == ente,
                RegistroEjecucion.fecha_ejecucion >= fecha_reciente
            )
        )
        result_registros = await db.execute(stmt_registros)
        registros = result_registros.scalars().all()
        
        total_registros = len(registros)
        registros_exitosos = sum(1 for r in registros if 'exitoso' in r.estatus.lower() or 'disponible' in r.estatus.lower())
        
        disponibilidad = (registros_exitosos / total_registros * 100) if total_registros > 0 else 0
        
        # Calcular tasa de actualización
        # Comparamos los totales de registros entre hoy y hace un mes
        actualizacion = 0.0
        for sistema in await db.execute(
            select(distinct(RegistroEjecucion.sistema_origen))
            .where(RegistroEjecucion.ente == ente)
        ):
            sistema = sistema[0]
            stmt_actual = (
                select(RegistroEjecucion)
                .where(
                    RegistroEjecucion.ente == ente,
                    RegistroEjecucion.sistema_origen == sistema
                )
                .order_by(desc(RegistroEjecucion.fecha_ejecucion), desc(RegistroEjecucion.hora_ejecucion))
                .limit(1)
            )
            result_actual = await db.execute(stmt_actual)
            registro_actual = result_actual.scalar_one_or_none()
            
            if not registro_actual:
                continue
            
            # Obtener el registro de hace un mes
            hace_un_mes = datetime.now().date() - timedelta(days=30)
            stmt_anterior = (
                select(RegistroEjecucion)
                .where(
                    RegistroEjecucion.ente == ente,
                    RegistroEjecucion.sistema_origen == sistema,
                    RegistroEjecucion.fecha_ejecucion <= hace_un_mes
                )
                .order_by(desc(RegistroEjecucion.fecha_ejecucion), desc(RegistroEjecucion.hora_ejecucion))
                .limit(1)
            )
            result_anterior = await db.execute(stmt_anterior)
            registro_anterior = result_anterior.scalar_one_or_none()
            
            if not registro_anterior:
                continue
            
            # Calculamos la diferencia porcentual
            try:
                total_actual = int(registro_actual.total_registros.replace(',', ''))
                total_anterior = int(registro_anterior.total_registros.replace(',', ''))
                
                if total_anterior > 0:
                    cambio_porcentual = ((total_actual - total_anterior) / total_anterior) * 100
                    actualizacion += cambio_porcentual
                
            except (ValueError, AttributeError):
                pass
        
        # Calculamos el promedio de actualizacion entre todos los sistemas de este ente
        actualizacion = actualizacion / num_sistemas if num_sistemas > 0 else 0.0
        
        # Agregar datos al ranking
        ranking_data.append({
            "name": ente,
            "sistemas": num_sistemas,
            "disponibilidad": round(disponibilidad),
            "actualizacion": round(actualizacion, 2)
        })
    
    # Ordenar por disponibilidad (descendente) y actualizacion (descendente)
    ranking_data.sort(key=lambda x: (-x["disponibilidad"], -x["actualizacion"]))
    
    # Devolver solo los primeros 'limit' elementos
    return ranking_data[:limit]


async def obtener_alertas_criticas(db: AsyncSession) -> List[Dict[str, Any]]:
    """
    Obtiene las alertas críticas basadas en:
    1. Disminución total de registros (100%)
    2. Disponibilidad nula (0%)
    3. Otros criterios críticos
    
    Args:
        db: Sesión de base de datos asíncrona
        
    Returns:
        Lista de diccionarios con las alertas críticas
    """
    alertas = []
    
    # Obtener todos los entes y sistemas únicos
    stmt = select(
        distinct(RegistroEjecucion.ente),
        RegistroEjecucion.sistema_origen
    )
    result = await db.execute(stmt)
    combinaciones = result.all()
    
    # Sistemas para obtener nombres descriptivos
    sistemas = {sistema.codigo: sistema for sistema in await get_sistemas(db)}
    
    for ente, sistema in combinaciones:
        # Verificar disminución total de registros
        # Obtener el registro más reciente y el anterior
        stmt_actual = (
            select(RegistroEjecucion)
            .where(
                RegistroEjecucion.ente == ente,
                RegistroEjecucion.sistema_origen == sistema
            )
            .order_by(desc(RegistroEjecucion.fecha_ejecucion), desc(RegistroEjecucion.hora_ejecucion))
            .limit(1)
        )
        result_actual = await db.execute(stmt_actual)
        registro_actual = result_actual.scalar_one_or_none()
        
        if not registro_actual:
            continue
        
        # Obtener el registro anterior
        stmt_anterior = (
            select(RegistroEjecucion)
            .where(
                RegistroEjecucion.ente == ente,
                RegistroEjecucion.sistema_origen == sistema,
                RegistroEjecucion.fecha_ejecucion < registro_actual.fecha_ejecucion
            )
            .order_by(desc(RegistroEjecucion.fecha_ejecucion), desc(RegistroEjecucion.hora_ejecucion))
            .limit(1)
        )
        result_anterior = await db.execute(stmt_anterior)
        registro_anterior = result_anterior.scalar_one_or_none()
        
        # Nombre descriptivo del sistema
        nombre_sistema = f"Sistema {sistema.split('_')[0].replace('S', '')}"
        if '_' in sistema and sistema in sistemas:
            subtipo = sistema.split('_', 1)[1].replace('_', ' ').capitalize()
            nombre_sistema = f"{nombre_sistema} - {subtipo}"
        
        # Verificar si hay disponibilidad nula
        if 'no disponible' in registro_actual.estatus.lower() or 'error' in registro_actual.estatus.lower():
            alertas.append({
                "ente": ente,
                "sistema": nombre_sistema,
                "alerta": "Disponibilidad nula (0%)",
                "nivel": "alta"
            })
            continue
        
        # Si no hay registro anterior, no podemos verificar disminución
        if not registro_anterior:
            continue
        
        # Verificar disminución total
        try:
            total_actual = int(registro_actual.total_registros.replace(',', ''))
            total_anterior = int(registro_anterior.total_registros.replace(',', ''))
            
            if total_anterior > 0 and total_actual == 0:
                alertas.append({
                    "ente": ente,
                    "sistema": nombre_sistema,
                    "alerta": "Disminución del 100% en registros",
                    "nivel": "alta"
                })
            elif total_anterior > 0 and total_actual < total_anterior * 0.5:  # Disminución de más del 50%
                alertas.append({
                    "ente": ente,
                    "sistema": nombre_sistema,
                    "alerta": f"Disminución del {round((1 - total_actual/total_anterior) * 100)}% en registros",
                    "nivel": "media"
                })
        except (ValueError, AttributeError):
            pass
    
    # Ordenar por nivel (alta primero) y luego por ente
    alertas.sort(key=lambda x: (0 if x["nivel"] == "alta" else 1, x["ente"]))
    
    return alertas


async def calcular_porcentaje_alta_disponibilidad(db: AsyncSession) -> float:
    """
    Calcula el porcentaje de APIs con alta disponibilidad.
    
    Args:
        db: Sesión de base de datos asíncrona
        
    Returns:
        Porcentaje de APIs con alta disponibilidad
    """
    datos_disponibilidad = await calcular_disponibilidad_apis(db)
    
    # Calcular total de APIs
    total_apis = sum(item["value"] for item in datos_disponibilidad)
    
    # Obtener APIs con alta disponibilidad
    alta_disponibilidad = next(
        (item["value"] for item in datos_disponibilidad if "Alta disponibilidad" in item["name"]),
        0
    )
    
    # Calcular porcentaje
    return round((alta_disponibilidad / total_apis * 100) if total_apis > 0 else 0)


async def obtener_datos_dashboard_completo(db: AsyncSession) -> Dict[str, Any]:
    """
    Obtiene todos los datos necesarios para el dashboard.
    
    Args:
        db: Sesión de base de datos asíncrona
        
    Returns:
        Diccionario con todos los datos del dashboard
    """
    entes_conectados = await get_entes_conectados(db)
    apis_conectadas = await get_apis_conectadas(db)
    distribucion_apis = await get_distribucion_apis_por_sistema(db)
    disponibilidad_apis = await calcular_disponibilidad_apis(db)
    alta_disponibilidad = await calcular_porcentaje_alta_disponibilidad(db)
    actualizacion_registros = await calcular_actualizacion_registros(db)
    ranking_entes = await obtener_ranking_entes(db)
    alertas = await obtener_alertas_criticas(db)
    
    return {
        "entes_conectados": entes_conectados,
        "apis_conectadas": apis_conectadas,
        "alta_disponibilidad": alta_disponibilidad,
        "alertas_criticas": len([a for a in alertas if a["nivel"] == "alta"]),
        "distribucion_apis": distribucion_apis,
        "disponibilidad_apis": disponibilidad_apis,
        "actualizacion_registros": actualizacion_registros,
        "ranking_entes": ranking_entes,
        "alertas": alertas
    }