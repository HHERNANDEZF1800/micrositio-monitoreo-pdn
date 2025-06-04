"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Configuración de sistemas desde variables de entorno
const ENV_MODE = process.env.NEXT_PUBLIC_ENV_MODE || "production"

const RUTAS_CSV = {
  sistema1: {
    nombre: "Sistema 1: Declaraciones",
    archivo: "s1_declaraciones2.csv",
    localPath: process.env.NEXT_PUBLIC_CSV_SISTEMA1_PATH,
    url: process.env.NEXT_PUBLIC_CSV_SISTEMA1_URL,
  },
  sistema2: {
    nombre: "Sistema 2: Contrataciones",
    archivo: "s2_procedimientos.csv",
    localPath: process.env.NEXT_PUBLIC_CSV_SISTEMA2_PATH,
    url: process.env.NEXT_PUBLIC_CSV_SISTEMA2_URL,
  },
  sistema3_graves: {
    nombre: "Sistema 3: Faltas Administrativas Graves",
    archivo: "s3_faltas_administrativas_graves.csv",
    localPath: process.env.NEXT_PUBLIC_CSV_SISTEMA3_GRAVES_PATH,
    url: process.env.NEXT_PUBLIC_CSV_SISTEMA3_GRAVES_URL,
  },
  sistema3_no_graves: {
    nombre: "Sistema 3: Faltas Administrativas No Graves",
    archivo: "s3_faltas_administrativas_no_graves.csv",
    localPath: process.env.NEXT_PUBLIC_CSV_SISTEMA3_NO_GRAVES_PATH,
    url: process.env.NEXT_PUBLIC_CSV_SISTEMA3_NO_GRAVES_URL,
  },
  sistema3_personas_fisicas: {
    nombre: "Sistema 3: Faltas Graves Personas Físicas",
    archivo: "s3_faltas_graves_personas_fisicas.csv",
    localPath: process.env.NEXT_PUBLIC_CSV_SISTEMA3_PERSONAS_FISICAS_PATH,
    url: process.env.NEXT_PUBLIC_CSV_SISTEMA3_PERSONAS_FISICAS_URL,
  },
  sistema3_personas_morales: {
    nombre: "Sistema 3: Faltas Graves Personas Morales",
    archivo: "s3_faltas_graves_personas_morales.csv",
    localPath: process.env.NEXT_PUBLIC_CSV_SISTEMA3_PERSONAS_MORALES_PATH,
    url: process.env.NEXT_PUBLIC_CSV_SISTEMA3_PERSONAS_MORALES_URL,
  },
} as const

// Tipo para los sistemas disponibles
type SistemaKey = keyof typeof RUTAS_CSV

// Tipos para los datos
interface RegistroSistema {
  FECHA_EJECUCION: string
  HORA_EJECUCION: string
  ENTE: string
  TOTAL_REGISTROS: string | number
  ESTATUS: string
}

interface EstadisticasEnte {
  ente: string
  totalRegistros: number
  disponibilidad: number
  ultimaActualizacion: string
  tendencia: number
}

interface AlertaCritica {
  ente: string
  sistema: string
  alerta: string
  nivel: "alta" | "media" | "baja"
  fecha: string
}

interface DatosSistema {
  datos: RegistroSistema[]
  nombre: string
  configurado: boolean
}

// Función para procesar datos CSV
const procesarCSV = (csvText: string): RegistroSistema[] => {
  const lines = csvText.split("\n")
  const headers = lines[0].split(",")

  return lines
    .slice(1)
    .filter((line) => line.trim())
    .map((line) => {
      const values = line.split(",")
      return {
        FECHA_EJECUCION: values[0],
        HORA_EJECUCION: values[1],
        ENTE: values[2],
        TOTAL_REGISTROS: values[3] === "ERROR" ? "ERROR" : Number.parseInt(values[3]) || 0,
        ESTATUS: values[4],
      }
    })
}

// Función para cargar datos de cualquier sistema
const cargarDatosSistema = async (sistemaKey: SistemaKey): Promise<RegistroSistema[]> => {
  const config = RUTAS_CSV[sistemaKey]

  console.log(`Cargando datos de ${config.nombre}`)

  try {
    const response = await fetch(`/api/csv/${sistemaKey}`)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Error HTTP: ${response.status} - ${errorData.error}`)
    }

    const csvText = await response.text()

    if (!csvText.trim()) {
      throw new Error(`El archivo ${config.archivo} está vacío`)
    }

    return procesarCSV(csvText)
  } catch (error) {
    console.error(`Error al cargar ${config.nombre}:`, error)
    throw error
  }
}

// Función para obtener información de configuración de un sistema
const obtenerConfigSistema = (sistemaKey: SistemaKey) => {
  return RUTAS_CSV[sistemaKey]
}

// Función para validar si un sistema tiene configuración completa
const sistemaConfigurado = (sistemaKey: SistemaKey): boolean => {
  const config = RUTAS_CSV[sistemaKey]

  if (ENV_MODE === "local") {
    return !!(config.localPath && config.localPath.trim())
  } else {
    return !!(config.url && config.url.trim())
  }
}

// Función para obtener el estado de configuración
const obtenerEstadoConfiguracion = () => {
  const sistemas = Object.keys(RUTAS_CSV) as SistemaKey[]
  const configurados = sistemas.filter(sistemaConfigurado)

  return {
    modo: ENV_MODE,
    total: sistemas.length,
    configurados: configurados.length,
    pendientes: sistemas.length - configurados.length,
    sistemasConfigurados: configurados,
  }
}

export default function Dashboard() {
  const [datosSistemas, setDatosSistemas] = useState<Record<string, DatosSistema>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estadoConfig, setEstadoConfig] = useState(obtenerEstadoConfiguracion())
  const [estadisticas, setEstadisticas] = useState({
    entesConectados: 0,
    apisConectadas: 0,
    altaDisponibilidad: 0,
    alertasCriticas: 0,
  })
  const [datosGraficas, setDatosGraficas] = useState({
    distribucionAPIs: [] as any[],
    disponibilidad: [] as any[],
    actualizacion: [] as any[],
    tendenciaRegistros: [] as any[],
  })
  const [rankingEntes, setRankingEntes] = useState<EstadisticasEnte[]>([])
  const [alertasCriticas, setAlertasCriticas] = useState<AlertaCritica[]>([])

  // Función para calcular estadísticas consolidadas
  const calcularEstadisticasConsolidadas = (sistemas: Record<string, DatosSistema>) => {
    const todosLosDatos: RegistroSistema[] = []
    const entesUnicos = new Set<string>()
    let totalAPIs = 0

    // Consolidar datos de todos los sistemas
    Object.entries(sistemas).forEach(([key, sistema]) => {
      if (sistema.datos.length > 0) {
        todosLosDatos.push(...sistema.datos)
        sistema.datos.forEach((registro) => entesUnicos.add(registro.ENTE))
        totalAPIs++
      }
    })

    const registrosRecientes = todosLosDatos.filter((d) => {
      const fecha = new Date(d.FECHA_EJECUCION)
      const hoy = new Date()
      const diferenciaDias = (hoy.getTime() - fecha.getTime()) / (1000 * 3600 * 24)
      return diferenciaDias <= 7 // Últimos 7 días
    })

    // Calcular disponibilidad por ente
    const disponibilidadPorEnte = new Map<string, { total: number; disponible: number }>()

    registrosRecientes.forEach((registro) => {
      const ente = registro.ENTE
      if (!disponibilidadPorEnte.has(ente)) {
        disponibilidadPorEnte.set(ente, { total: 0, disponible: 0 })
      }
      const stats = disponibilidadPorEnte.get(ente)!
      stats.total++
      if (registro.ESTATUS === "Disponible" && registro.TOTAL_REGISTROS !== "ERROR") {
        stats.disponible++
      }
    })

    const entesAltaDisponibilidad = Array.from(disponibilidadPorEnte.entries()).filter(
      ([_, stats]) => stats.disponible / stats.total >= 0.9,
    ).length

    // Detectar alertas críticas
    const alertas: AlertaCritica[] = []
    Object.entries(sistemas).forEach(([sistemaKey, sistema]) => {
      const registrosSistema = sistema.datos.filter((d) => {
        const fecha = new Date(d.FECHA_EJECUCION)
        const hoy = new Date()
        const diferenciaDias = (hoy.getTime() - fecha.getTime()) / (1000 * 3600 * 24)
        return diferenciaDias <= 7
      })

      registrosSistema.forEach((registro) => {
        if (registro.TOTAL_REGISTROS === "ERROR") {
          alertas.push({
            ente: registro.ENTE,
            sistema: sistema.nombre,
            alerta: "Error en la conexión",
            nivel: "alta",
            fecha: registro.FECHA_EJECUCION,
          })
        } else if (registro.TOTAL_REGISTROS === 0) {
          alertas.push({
            ente: registro.ENTE,
            sistema: sistema.nombre,
            alerta: "Sin registros disponibles",
            nivel: "alta",
            fecha: registro.FECHA_EJECUCION,
          })
        }
      })
    })

    setEstadisticas({
      entesConectados: entesUnicos.size,
      apisConectadas: totalAPIs,
      altaDisponibilidad: entesUnicos.size > 0 ? Math.round((entesAltaDisponibilidad / entesUnicos.size) * 100) : 0,
      alertasCriticas: alertas.length,
    })

    setAlertasCriticas(alertas.slice(0, 10))

    // Generar datos para gráficas
    const distribucionAPIs = [
      {
        name: "Sistema 1",
        value: sistemas.sistema1?.datos.length > 0 ? entesUnicos.size : 0,
        color: "#3b82f6",
      },
      {
        name: "Sistema 2",
        value: sistemas.sistema2?.datos.length > 0 ? entesUnicos.size : 0,
        color: "#8b5cf6",
      },
      {
        name: "Sistema 3",
        value:
          Object.keys(sistemas).filter((k) => k.startsWith("sistema3") && sistemas[k]?.datos.length > 0).length > 0
            ? entesUnicos.size
            : 0,
        color: "#ec4899",
      },
    ]

    const disponibilidad = [
      {
        name: "Alta disponibilidad (≥90%)",
        value: entesAltaDisponibilidad,
        color: "#22c55e",
      },
      {
        name: "Media disponibilidad (70-89%)",
        value: Math.max(0, entesUnicos.size - entesAltaDisponibilidad - alertas.length),
        color: "#f59e0b",
      },
      {
        name: "Baja disponibilidad (<70%)",
        value: alertas.length,
        color: "#ef4444",
      },
    ]

    // Calcular ranking de entes
    const ranking: EstadisticasEnte[] = Array.from(disponibilidadPorEnte.entries())
      .map(([ente, stats]) => {
        const registrosEnte = registrosRecientes.filter((r) => r.ENTE === ente)
        const ultimoRegistro = registrosEnte[registrosEnte.length - 1]
        const penultimoRegistro = registrosEnte[registrosEnte.length - 2]

        let tendencia = 0
        if (
          ultimoRegistro &&
          penultimoRegistro &&
          typeof ultimoRegistro.TOTAL_REGISTROS === "number" &&
          typeof penultimoRegistro.TOTAL_REGISTROS === "number"
        ) {
          tendencia =
            ((ultimoRegistro.TOTAL_REGISTROS - penultimoRegistro.TOTAL_REGISTROS) / penultimoRegistro.TOTAL_REGISTROS) *
            100
        }

        return {
          ente,
          totalRegistros: typeof ultimoRegistro?.TOTAL_REGISTROS === "number" ? ultimoRegistro.TOTAL_REGISTROS : 0,
          disponibilidad: Math.round((stats.disponible / stats.total) * 100),
          ultimaActualizacion: ultimoRegistro?.FECHA_EJECUCION || "",
          tendencia: Math.round(tendencia * 100) / 100,
        }
      })
      .sort((a, b) => b.disponibilidad - a.disponibilidad)
      .slice(0, 10)

    setRankingEntes(ranking)

    // Tendencia de registros por fecha
    const registrosPorFecha = new Map<string, number>()
    todosLosDatos.forEach((registro) => {
      const fecha = registro.FECHA_EJECUCION
      if (typeof registro.TOTAL_REGISTROS === "number") {
        registrosPorFecha.set(fecha, (registrosPorFecha.get(fecha) || 0) + registro.TOTAL_REGISTROS)
      }
    })

    const tendenciaRegistros = Array.from(registrosPorFecha.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-30) // Últimos 30 días
      .map(([fecha, total]) => ({
        fecha: new Date(fecha).toLocaleDateString("es-MX", { month: "short", day: "numeric" }),
        total,
      }))

    setDatosGraficas({
      distribucionAPIs,
      disponibilidad,
      actualizacion: [
        { name: "Con actualización", value: 15, color: "#22c55e" },
        { name: "Sin cambios", value: 80, color: "#94a3b8" },
        { name: "Con disminución", value: 5, color: "#ef4444" },
      ],
      tendenciaRegistros,
    })
  }

  // Cargar datos de todos los sistemas
  useEffect(() => {
    const cargarTodosLosDatos = async () => {
      try {
        setError(null)
        const sistemasData: Record<string, DatosSistema> = {}

        // Cargar datos de todos los sistemas configurados
        const sistemasConfigurados = (Object.keys(RUTAS_CSV) as SistemaKey[]).filter(sistemaConfigurado)

        console.log("Sistemas configurados:", sistemasConfigurados)

        for (const sistemaKey of sistemasConfigurados) {
          try {
            const datos = await cargarDatosSistema(sistemaKey)
            const config = obtenerConfigSistema(sistemaKey)

            sistemasData[sistemaKey] = {
              datos,
              nombre: config.nombre,
              configurado: true,
            }

            console.log(`${config.nombre}: ${datos.length} registros cargados`)
          } catch (error) {
            console.error(`Error al cargar ${sistemaKey}:`, error)
            const config = obtenerConfigSistema(sistemaKey)
            sistemasData[sistemaKey] = {
              datos: [],
              nombre: config.nombre,
              configurado: false,
            }
          }
        }

        setDatosSistemas(sistemasData)
        calcularEstadisticasConsolidadas(sistemasData)

        console.log("Todos los datos cargados exitosamente")
      } catch (error) {
        console.error("Error general al cargar datos:", error)
        setError(error instanceof Error ? error.message : "Error desconocido al cargar datos")
      } finally {
        setLoading(false)
      }
    }

    cargarTodosLosDatos()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg mb-2">Cargando datos de todos los sistemas...</div>
          <div className="text-sm text-gray-500">Modo: {estadoConfig.modo}</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-lg text-red-600 mb-4">Error al cargar datos</div>
          <div className="text-sm text-gray-700 mb-4">{error}</div>
          <div className="text-xs text-gray-500">
            <p>Modo actual: {estadoConfig.modo}</p>
            <p>
              Sistemas configurados: {estadoConfig.configurados}/{estadoConfig.total}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Encabezado */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">Plataforma Digital Nacional</h1>
              <h2 className="text-lg text-gray-700">Monitor de Conectividad y Actualización</h2>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant={estadoConfig.modo === "local" ? "secondary" : "default"}>Modo: {estadoConfig.modo}</Badge>
              <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Actualizado:{" "}
                {new Date().toLocaleDateString("es-MX", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Vista General</TabsTrigger>
              <TabsTrigger value="sistema1" disabled={!datosSistemas.sistema1?.configurado}>
                Sistema 1: Declaraciones
              </TabsTrigger>
              <TabsTrigger value="sistema2" disabled={!datosSistemas.sistema2?.configurado}>
                Sistema 2: Contrataciones
              </TabsTrigger>
              <TabsTrigger
                value="sistema3"
                disabled={
                  !Object.keys(datosSistemas).some((k) => k.startsWith("sistema3") && datosSistemas[k]?.configurado)
                }
              >
                Sistema 3: Faltas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6">
              {/* Contenido principal */}
              <main className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                  {/* Información de configuración */}
                  <div className="mb-8">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-medium text-blue-900">Estado de Configuración</h3>
                            <p className="text-xs text-blue-700">
                              Modo: {estadoConfig.modo} | Sistemas configurados: {estadoConfig.configurados}/
                              {estadoConfig.total}
                            </p>
                          </div>
                          <Badge variant={estadoConfig.configurados > 0 ? "default" : "destructive"}>
                            {estadoConfig.configurados > 0 ? "Operativo" : "Configuración requerida"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Encabezado de sección */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Visión General</h2>

                    {/* Tarjetas de resumen */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                              <div className="h-8 w-8 text-blue-600 text-2xl">🏛️</div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Entes conectados</dt>
                                <dd>
                                  <div className="text-lg font-medium text-gray-900">
                                    {estadisticas.entesConectados}
                                  </div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                              <div className="h-8 w-8 text-purple-600 text-2xl">🔌</div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">APIs conectadas</dt>
                                <dd>
                                  <div className="text-lg font-medium text-gray-900">{estadisticas.apisConectadas}</div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                              <div className="h-8 w-8 text-green-600 text-2xl">✅</div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Alta disponibilidad</dt>
                                <dd>
                                  <div className="text-lg font-medium text-gray-900">
                                    {estadisticas.altaDisponibilidad}%
                                  </div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                              <div className="h-8 w-8 text-red-600 text-2xl">⚠️</div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                              <dl>
                                <dt className="text-sm font-medium text-gray-500 truncate">Alertas críticas</dt>
                                <dd>
                                  <div className="text-lg font-medium text-gray-900">
                                    {estadisticas.alertasCriticas}
                                  </div>
                                </dd>
                              </dl>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Estado de configuración de sistemas */}
                  <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Sistemas</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Sistema 1 */}
                      <Card className={datosSistemas.sistema1?.configurado ? "border-green-200" : "border-gray-200"}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Sistema 1: Declaraciones</h4>
                              <p className="text-xs text-gray-500">s1_declaraciones2.csv</p>
                            </div>
                            <Badge variant={datosSistemas.sistema1?.configurado ? "default" : "secondary"}>
                              {datosSistemas.sistema1?.configurado ? "Configurado" : "Pendiente"}
                            </Badge>
                          </div>
                          {datosSistemas.sistema1?.configurado && (
                            <div className="mt-2">
                              <p className="text-xs text-green-600">
                                ✓ {datosSistemas.sistema1.datos.length} registros cargados
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Sistema 2 */}
                      <Card className={datosSistemas.sistema2?.configurado ? "border-green-200" : "border-gray-200"}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Sistema 2: Contrataciones</h4>
                              <p className="text-xs text-gray-500">s2_procedimientos.csv</p>
                            </div>
                            <Badge variant={datosSistemas.sistema2?.configurado ? "default" : "secondary"}>
                              {datosSistemas.sistema2?.configurado ? "Configurado" : "Pendiente"}
                            </Badge>
                          </div>
                          {datosSistemas.sistema2?.configurado && (
                            <div className="mt-2">
                              <p className="text-xs text-green-600">
                                ✓ {datosSistemas.sistema2.datos.length} registros cargados
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {/* Sistema 3 - Consolidado */}
                      <Card
                        className={
                          Object.keys(datosSistemas).some(
                            (k) => k.startsWith("sistema3") && datosSistemas[k]?.configurado,
                          )
                            ? "border-green-200"
                            : "border-gray-200"
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Sistema 3: Faltas</h4>
                              <p className="text-xs text-gray-500">4 archivos CSV</p>
                            </div>
                            <Badge
                              variant={
                                Object.keys(datosSistemas).some(
                                  (k) => k.startsWith("sistema3") && datosSistemas[k]?.configurado,
                                )
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {Object.keys(datosSistemas).filter(
                                (k) => k.startsWith("sistema3") && datosSistemas[k]?.configurado,
                              ).length > 0
                                ? "Configurado"
                                : "Pendiente"}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            {Object.keys(datosSistemas)
                              .filter((k) => k.startsWith("sistema3"))
                              .map((sistemaKey) => {
                                const sistema = datosSistemas[sistemaKey]
                                if (sistema?.configurado) {
                                  return (
                                    <p key={sistemaKey} className="text-xs text-green-600">
                                      ✓ {sistema.nombre.split(": ")[1]}: {sistema.datos.length} registros
                                    </p>
                                  )
                                }
                                return null
                              })}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Gráficas */}
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
                    {/* Gráfica de APIs por sistema */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Distribución de APIs por sistema</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={datosGraficas.distribucionAPIs}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Legend />
                              <Bar dataKey="value" name="Número de APIs">
                                {datosGraficas.distribucionAPIs.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Gráfica de disponibilidad */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Disponibilidad de APIs</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={datosGraficas.disponibilidad}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                              >
                                {datosGraficas.disponibilidad.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tendencia de registros */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Tendencia de registros (Todos los sistemas)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={datosGraficas.tendenciaRegistros}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="fecha" />
                              <YAxis />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="total"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                name="Total de registros"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Ranking de entes */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top entes por desempeño</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 overflow-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ente
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Registros
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Disp. (%)
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Tend. (%)
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {rankingEntes.map((ente, idx) => (
                                <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {ente.ente}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    {ente.totalRegistros.toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    <Badge
                                      variant={
                                        ente.disponibilidad >= 90
                                          ? "default"
                                          : ente.disponibilidad >= 70
                                            ? "secondary"
                                            : "destructive"
                                      }
                                    >
                                      {ente.disponibilidad}%
                                    </Badge>
                                  </td>
                                  <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                    <Badge
                                      variant={
                                        ente.tendencia > 0
                                          ? "default"
                                          : ente.tendencia === 0
                                            ? "secondary"
                                            : "destructive"
                                      }
                                    >
                                      {ente.tendencia > 0 ? "+" : ""}
                                      {ente.tendencia}%
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Alertas críticas */}
                  {alertasCriticas.length > 0 && (
                    <Card className="mb-8">
                      <CardHeader>
                        <CardTitle>Alertas críticas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ente
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Sistema
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Alerta
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Nivel
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Fecha
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {alertasCriticas.map((alerta, idx) => (
                                <tr key={idx} className={alerta.nivel === "alta" ? "bg-red-50" : "bg-yellow-50"}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {alerta.ente}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {alerta.sistema}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{alerta.alerta}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    <Badge variant="destructive">
                                      {alerta.nivel.charAt(0).toUpperCase() + alerta.nivel.slice(1)}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(alerta.fecha).toLocaleDateString("es-MX")}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </main>
            </TabsContent>

            {/* Tabs para sistemas individuales */}
            <TabsContent value="sistema1" className="mt-6">
              <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Sistema 1: Declaraciones - Datos Detallados
                </h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Registros recientes del Sistema 1</CardTitle>
                    <CardDescription>
                      Mostrando los últimos {Math.min(datosSistemas.sistema1?.datos.length || 0, 100)} registros
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto max-h-96">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hora
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ente
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Registros
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estatus
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(datosSistemas.sistema1?.datos || [])
                            .slice(-100)
                            .reverse()
                            .map((registro, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(registro.FECHA_EJECUCION).toLocaleDateString("es-MX")}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {registro.HORA_EJECUCION}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {registro.ENTE}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {registro.TOTAL_REGISTROS === "ERROR" ? (
                                    <Badge variant="destructive">ERROR</Badge>
                                  ) : typeof registro.TOTAL_REGISTROS === "number" ? (
                                    registro.TOTAL_REGISTROS.toLocaleString()
                                  ) : (
                                    registro.TOTAL_REGISTROS
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  <Badge variant={registro.ESTATUS === "Disponible" ? "default" : "destructive"}>
                                    {registro.ESTATUS}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sistema2" className="mt-6">
              <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Sistema 2: Contrataciones - Datos Detallados
                </h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Registros recientes del Sistema 2</CardTitle>
                    <CardDescription>
                      Mostrando los últimos {Math.min(datosSistemas.sistema2?.datos.length || 0, 100)} registros
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto max-h-96">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fecha
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Hora
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Ente
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Registros
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Estatus
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {(datosSistemas.sistema2?.datos || [])
                            .slice(-100)
                            .reverse()
                            .map((registro, idx) => (
                              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(registro.FECHA_EJECUCION).toLocaleDateString("es-MX")}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {registro.HORA_EJECUCION}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {registro.ENTE}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {registro.TOTAL_REGISTROS === "ERROR" ? (
                                    <Badge variant="destructive">ERROR</Badge>
                                  ) : typeof registro.TOTAL_REGISTROS === "number" ? (
                                    registro.TOTAL_REGISTROS.toLocaleString()
                                  ) : (
                                    registro.TOTAL_REGISTROS
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  <Badge variant={registro.ESTATUS === "Disponible" ? "default" : "destructive"}>
                                    {registro.ESTATUS}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="sistema3" className="mt-6">
              <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Sistema 3: Faltas - Datos Detallados</h2>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* Faltas Administrativas Graves */}
                  {datosSistemas.sistema3_graves?.configurado && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Faltas Administrativas Graves</CardTitle>
                        <CardDescription>{datosSistemas.sistema3_graves.datos.length} registros</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto max-h-64">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Ente
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Registros
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Estatus
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {datosSistemas.sistema3_graves.datos
                                .slice(-20)
                                .reverse()
                                .map((registro, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                      {registro.ENTE}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                                      {registro.TOTAL_REGISTROS === "ERROR" ? (
                                        <Badge variant="destructive" className="text-xs">
                                          ERROR
                                        </Badge>
                                      ) : typeof registro.TOTAL_REGISTROS === "number" ? (
                                        registro.TOTAL_REGISTROS.toLocaleString()
                                      ) : (
                                        registro.TOTAL_REGISTROS
                                      )}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                                      <Badge
                                        variant={registro.ESTATUS === "Disponible" ? "default" : "destructive"}
                                        className="text-xs"
                                      >
                                        {registro.ESTATUS.length > 20
                                          ? registro.ESTATUS.substring(0, 20) + "..."
                                          : registro.ESTATUS}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Faltas Administrativas No Graves */}
                  {datosSistemas.sistema3_no_graves?.configurado && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Faltas Administrativas No Graves</CardTitle>
                        <CardDescription>{datosSistemas.sistema3_no_graves.datos.length} registros</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto max-h-64">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Ente
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Registros
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Estatus
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {datosSistemas.sistema3_no_graves.datos
                                .slice(-20)
                                .reverse()
                                .map((registro, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                      {registro.ENTE}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                                      {registro.TOTAL_REGISTROS === "ERROR" ? (
                                        <Badge variant="destructive" className="text-xs">
                                          ERROR
                                        </Badge>
                                      ) : typeof registro.TOTAL_REGISTROS === "number" ? (
                                        registro.TOTAL_REGISTROS.toLocaleString()
                                      ) : (
                                        registro.TOTAL_REGISTROS
                                      )}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                                      <Badge
                                        variant={registro.ESTATUS === "Disponible" ? "default" : "destructive"}
                                        className="text-xs"
                                      >
                                        {registro.ESTATUS.length > 20
                                          ? registro.ESTATUS.substring(0, 20) + "..."
                                          : registro.ESTATUS}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Faltas Graves Personas Físicas */}
                  {datosSistemas.sistema3_personas_fisicas?.configurado && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Faltas Graves Personas Físicas</CardTitle>
                        <CardDescription>
                          {datosSistemas.sistema3_personas_fisicas.datos.length} registros
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto max-h-64">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Ente
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Registros
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Estatus
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {datosSistemas.sistema3_personas_fisicas.datos
                                .slice(-20)
                                .reverse()
                                .map((registro, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                      {registro.ENTE}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                                      {registro.TOTAL_REGISTROS === "ERROR" ? (
                                        <Badge variant="destructive" className="text-xs">
                                          ERROR
                                        </Badge>
                                      ) : typeof registro.TOTAL_REGISTROS === "number" ? (
                                        registro.TOTAL_REGISTROS.toLocaleString()
                                      ) : (
                                        registro.TOTAL_REGISTROS
                                      )}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                                      <Badge
                                        variant={registro.ESTATUS === "Disponible" ? "default" : "destructive"}
                                        className="text-xs"
                                      >
                                        {registro.ESTATUS.length > 20
                                          ? registro.ESTATUS.substring(0, 20) + "..."
                                          : registro.ESTATUS}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Faltas Graves Personas Morales */}
                  {datosSistemas.sistema3_personas_morales?.configurado && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Faltas Graves Personas Morales</CardTitle>
                        <CardDescription>
                          {datosSistemas.sistema3_personas_morales.datos.length} registros
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto max-h-64">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                              <tr>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Ente
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Registros
                                </th>
                                <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Estatus
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {datosSistemas.sistema3_personas_morales.datos
                                .slice(-20)
                                .reverse()
                                .map((registro, idx) => (
                                  <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-900">
                                      {registro.ENTE}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                                      {registro.TOTAL_REGISTROS === "ERROR" ? (
                                        <Badge variant="destructive" className="text-xs">
                                          ERROR
                                        </Badge>
                                      ) : typeof registro.TOTAL_REGISTROS === "number" ? (
                                        registro.TOTAL_REGISTROS.toLocaleString()
                                      ) : (
                                        registro.TOTAL_REGISTROS
                                      )}
                                    </td>
                                    <td className="px-2 py-2 whitespace-nowrap text-xs text-gray-500">
                                      <Badge
                                        variant={registro.ESTATUS === "Disponible" ? "default" : "destructive"}
                                        className="text-xs"
                                      >
                                        {registro.ESTATUS.length > 20
                                          ? registro.ESTATUS.substring(0, 20) + "..."
                                          : registro.ESTATUS}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </nav>

      {/* Pie de página */}
      <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600">Plataforma Digital Nacional - Sistema Nacional Anticorrupción © 2025</p>
        </div>
      </footer>
    </div>
  )
}
