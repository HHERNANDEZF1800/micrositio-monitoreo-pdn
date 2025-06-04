import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"

// Configuración de rutas desde variables de entorno
const CSV_PATHS = {
  sistema1: process.env.NEXT_PUBLIC_CSV_SISTEMA1_PATH,
  sistema2: process.env.NEXT_PUBLIC_CSV_SISTEMA2_PATH,
  sistema3: process.env.NEXT_PUBLIC_CSV_SISTEMA3_PATH,
} as const

type SistemaKey = keyof typeof CSV_PATHS

export async function GET(request: NextRequest, { params }: { params: { sistema: string } }) {
  try {
    const sistema = params.sistema as SistemaKey

    if (!CSV_PATHS[sistema]) {
      return NextResponse.json({ error: `Sistema ${sistema} no configurado` }, { status: 404 })
    }

    const filePath = CSV_PATHS[sistema]

    if (!filePath) {
      return NextResponse.json({ error: `Ruta no configurada para ${sistema}` }, { status: 404 })
    }

    // Verificar si el archivo existe
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: `Archivo no encontrado: ${filePath}` }, { status: 404 })
    }

    // Leer el archivo CSV
    const csvContent = await readFile(filePath, "utf-8")

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Error al leer archivo CSV:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
