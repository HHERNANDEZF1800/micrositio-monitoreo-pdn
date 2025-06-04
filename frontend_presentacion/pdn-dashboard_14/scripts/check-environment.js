const fs = require("fs")
const path = require("path")

console.log("🔍 Verificando ambiente local...\n")

// Verificar Node.js
console.log(`📦 Node.js: ${process.version}`)
console.log(`📦 NPM: ${process.env.npm_version || "No disponible"}`)

// Verificar directorio actual
console.log(`📁 Directorio actual: ${process.cwd()}`)

// Verificar archivos importantes
const archivosImportantes = ["package.json", ".env.local", "data/s1_declaraciones.csv"]

console.log("\n📋 Verificando archivos:")
archivosImportantes.forEach((archivo) => {
  const existe = fs.existsSync(archivo)
  const estado = existe ? "✅" : "❌"
  console.log(`${estado} ${archivo}`)

  if (existe && archivo.endsWith(".csv")) {
    const stats = fs.statSync(archivo)
    console.log(`   📊 Tamaño: ${(stats.size / 1024).toFixed(2)} KB`)
    console.log(`   📅 Modificado: ${stats.mtime.toLocaleDateString()}`)
  }
})

// Verificar variables de entorno
console.log("\n⚙️  Variables de entorno:")
const envVars = [
  "NEXT_PUBLIC_ENV_MODE",
  "NEXT_PUBLIC_CSV_SISTEMA1_PATH",
  "NEXT_PUBLIC_CSV_SISTEMA2_PATH",
  "NEXT_PUBLIC_CSV_SISTEMA3_PATH",
]

envVars.forEach((varName) => {
  const valor = process.env[varName]
  const estado = valor ? "✅" : "⚠️ "
  console.log(`${estado} ${varName}: ${valor || "No configurada"}`)
})

// Verificar dependencias
console.log("\n📦 Verificando dependencias...")
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))
  const nodeModulesExiste = fs.existsSync("node_modules")

  console.log(`${nodeModulesExiste ? "✅" : "❌"} node_modules`)
  console.log(`📊 Dependencias definidas: ${Object.keys(packageJson.dependencies || {}).length}`)
  console.log(`📊 DevDependencies definidas: ${Object.keys(packageJson.devDependencies || {}).length}`)
} catch (error) {
  console.log("❌ Error al leer package.json")
}

console.log("\n🎯 Próximos pasos:")
if (!fs.existsSync(".env.local")) {
  console.log("1. Crear archivo .env.local con las variables de entorno")
}
if (!fs.existsSync("data/s1_declaraciones.csv")) {
  console.log("2. Copiar archivo CSV al directorio data/")
}
if (!fs.existsSync("node_modules")) {
  console.log("3. Ejecutar: npm install")
}
console.log("4. Ejecutar: npm run dev")
console.log("5. Abrir: http://localhost:3000")
