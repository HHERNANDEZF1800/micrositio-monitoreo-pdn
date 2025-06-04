import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync, statSync, readdirSync } from "fs"
import { resolve } from "path"

// Configuración de rutas desde variables de entorno
const CSV_PATHS = {
  sistema1: {
    localPath: process.env.NEXT_PUBLIC_CSV_SISTEMA1_PATH,
    url: process.env.NEXT_PUBLIC_CSV_SISTEMA1_URL,
  },
  sistema2: {
    localPath: process.env.NEXT_PUBLIC_CSV_SISTEMA2_PATH,
    url: process.env.NEXT_PUBLIC_CSV_SISTEMA2_URL,
  },
  sistema3_graves: {
    localPath: process.env.NEXT_PUBLIC_CSV_SISTEMA3_GRAVES_PATH,
    url: process.env.NEXT_PUBLIC_CSV_SISTEMA3_GRAVES_URL,
  },
  sistema3_no_graves: {
    localPath: process.env.NEXT_PUBLIC_CSV_SISTEMA3_NO_GRAVES_PATH,
    url: process.env.NEXT_PUBLIC_CSV_SISTEMA3_NO_GRAVES_URL,
  },
  sistema3_personas_fisicas: {
    localPath: process.env.NEXT_PUBLIC_CSV_SISTEMA3_PERSONAS_FISICAS_PATH,
    url: process.env.NEXT_PUBLIC_CSV_SISTEMA3_PERSONAS_FISICAS_URL,
  },
  sistema3_personas_morales: {
    localPath: process.env.NEXT_PUBLIC_CSV_SISTEMA3_PERSONAS_MORALES_PATH,
    url: process.env.NEXT_PUBLIC_CSV_SISTEMA3_PERSONAS_MORALES_URL,
  },
} as const

type SistemaKey = keyof typeof CSV_PATHS

// Función para buscar archivos CSV en directorios
const buscarArchivosCSV = (directorio: string): string[] => {
  try {
    if (!existsSync(directorio)) {
      return []
    }

    const archivos = readdirSync(directorio)
    return archivos.filter((archivo) => archivo.toLowerCase().endsWith(".csv"))
  } catch (error) {
    console.error(`[API] Error al leer directorio ${directorio}:`, error)
    return []
  }
}

// Función para resolver rutas relativas al proyecto
const resolverRutaProyecto = (rutaRelativa: string): string => {
  // Obtener el directorio raíz del proyecto
  const directorioProyecto = process.cwd()

  // Si la ruta comienza con ./ la resolvemos relativa al proyecto
  if (rutaRelativa.startsWith("./")) {
    return resolve(directorioProyecto, rutaRelativa.substring(2))
  }

  // Si es una ruta absoluta, la usamos tal como está
  if (rutaRelativa.startsWith("/")) {
    return resolve(rutaRelativa)
  }

  // Si no tiene prefijo, asumimos que es relativa al proyecto
  return resolve(directorioProyecto, rutaRelativa)
}

export async function GET(request: NextRequest, { params }: { params: { sistema: string } }) {
  try {
    const sistema = params.sistema as SistemaKey

    console.log(`[API] Solicitud para sistema: ${sistema}`)
    console.log(`[API] Directorio del proyecto: ${process.cwd()}`)

    if (!CSV_PATHS[sistema]) {
      console.error(`[API] Sistema ${sistema} no está definido en CSV_PATHS`)
      return NextResponse.json(
        {
          error: `Sistema ${sistema} no configurado`,
          availableSystems: Object.keys(CSV_PATHS),
          envVars: CSV_PATHS,
        },
        { status: 404 },
      )
    }

    const config = CSV_PATHS[sistema]
    const ENV_MODE = process.env.NEXT_PUBLIC_ENV_MODE || "production"

    let rawPath: string | undefined
    if (ENV_MODE === "local") {
      rawPath = config.localPath
    } else {
      rawPath = config.url
    }

    if (!rawPath) {
      console.error(`[API] Ruta no configurada para ${sistema} en modo ${ENV_MODE}`)
      return NextResponse.json(
        {
          error: `Ruta no configurada para ${sistema} en modo ${ENV_MODE}`,
          modo: ENV_MODE,
          config: config,
        },
        { status: 404 },
      )
    }

    let csvContent: string

    if (ENV_MODE === "local") {
      // Modo local: leer archivo del sistema de archivos
      const resolvedPath = resolverRutaProyecto(rawPath)

      console.log(`[API] Leyendo archivo local: ${resolvedPath}`)

      if (!existsSync(resolvedPath)) {
        console.error(`[API] Archivo no encontrado: ${resolvedPath}`)
        return NextResponse.json(
          {
            error: `Archivo no encontrado: ${resolvedPath}`,
            rutaOriginal: rawPath,
            rutaResuelta: resolvedPath,
          },
          { status: 404 },
        )
      }

      const stats = statSync(resolvedPath)
      if (!stats.isFile()) {
        return NextResponse.json(
          {
            error: `La ruta no es un archivo: ${resolvedPath}`,
          },
          { status: 400 },
        )
      }

      csvContent = await readFile(resolvedPath, "utf-8")
    } else {
      // Modo producción: obtener desde URL
      console.log(`[API] Obteniendo desde URL: ${rawPath}`)

      const response = await fetch(rawPath)
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
      }

      csvContent = await response.text()
    }

    if (!csvContent.trim()) {
      return NextResponse.json(
        {
          error: `El archivo está vacío`,
          sistema: sistema,
        },
        { status: 400 },
      )
    }

    // Validar que el contenido parece ser CSV
    const lineas = csvContent.split("\n").filter((linea) => linea.trim())
    const primeraLinea = lineas[0]

    if (!primeraLinea || !primeraLinea.includes(",")) {
      return NextResponse.json(
        {
          error: `El archivo no parece ser un CSV válido`,
          contenidoMuestra: csvContent.substring(0, 200),
        },
        { status: 400 },
      )
    }

    console.log(`[API] Archivo CSV leído exitosamente: ${lineas.length} líneas`)

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "X-Sistema": sistema,
        "X-File-Lines": lineas.length.toString(),
      },
    })
  } catch (error) {
    console.error("[API] Error interno al procesar archivo CSV:", error)

    const errorMessage = error instanceof Error ? error.message : "Error desconocido"

    return NextResponse.json(
      {
        error: "Error interno del servidor",
        detalles: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
