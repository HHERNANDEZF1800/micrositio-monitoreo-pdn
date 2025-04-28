import React from "react";
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
} from "recharts";

// Componente principal
const Dashboard = () => {
  // Datos simulados
  const datosConexion = [
    { name: "Sistema 1", value: 23, color: "#3b82f6" },
    { name: "Sistema 2", value: 28, color: "#8b5cf6" },
    { name: "Sistema 3", value: 18, color: "#ec4899" },
    { name: "Sistema 6", value: 12, color: "#14b8a6" },
  ];

  const datosDisponibilidad = [
    { name: "Alta disponibilidad (≥90%)", value: 24, color: "#22c55e" },
    { name: "Media disponibilidad (70-89%)", value: 4, color: "#f59e0b" },
    { name: "Baja disponibilidad (<70%)", value: 5, color: "#ef4444" },
  ];

  const datosActualizacion = [
    { name: "Con actualización", value: 9, color: "#22c55e" },
    { name: "Sin cambios", value: 23, color: "#94a3b8" },
    { name: "Con disminución", value: 1, color: "#ef4444" },
  ];

  const rankingEntes = [
    {
      name: "Baja California Sur",
      sistemas: 4,
      disponibilidad: 98,
      actualizacion: 0.07,
    },
    {
      name: "Chihuahua",
      sistemas: 4,
      disponibilidad: 100,
      actualizacion: 7.56,
    },
    { name: "Jalisco", sistemas: 4, disponibilidad: 99, actualizacion: 0.0 },
    {
      name: "Michoacán",
      sistemas: 4,
      disponibilidad: 71,
      actualizacion: -100.0,
    },
    { name: "México", sistemas: 4, disponibilidad: 99, actualizacion: 0.2 },
    { name: "Puebla", sistemas: 4, disponibilidad: 94, actualizacion: 3.17 },
    {
      name: "Quintana Roo",
      sistemas: 4,
      disponibilidad: 100,
      actualizacion: 0.02,
    },
    { name: "Tabasco", sistemas: 4, disponibilidad: 93, actualizacion: 6.03 },
  ];

  const alertasCriticas = [
    {
      ente: "Michoacán",
      sistema: "Sistema 1",
      alerta: "Disminución del 100% en registros",
      nivel: "alta",
    },
    {
      ente: "Veracruz",
      sistema: "Sistema 3 - Faltas Graves",
      alerta: "Disminución del 100% en registros",
      nivel: "alta",
    },
    {
      ente: "Oaxaca",
      sistema: "Sistema 2",
      alerta: "Disponibilidad nula (0%)",
      nivel: "alta",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Encabezado */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-blue-900">
                Plataforma Digital Nacional
              </h1>
              <h2 className="text-lg text-gray-700">
                Monitor de Conectividad y Actualización
              </h2>
            </div>
            <div className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Actualizado: 25 de Abril, 2025
            </div>
          </div>
        </div>
      </header>

      {/* Navegación */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 overflow-x-auto py-3">
            <button className="whitespace-nowrap px-3 py-2 font-medium text-sm rounded-md bg-blue-100 text-blue-800">
              Vista General
            </button>
            <button className="whitespace-nowrap px-3 py-2 font-medium text-sm rounded-md text-gray-600 hover:text-gray-900">
              Sistema 1: Declaraciones
            </button>
            <button className="whitespace-nowrap px-3 py-2 font-medium text-sm rounded-md text-gray-600 hover:text-gray-900">
              Sistema 2: Contrataciones
            </button>
            <button className="whitespace-nowrap px-3 py-2 font-medium text-sm rounded-md text-gray-600 hover:text-gray-900">
              Sistema 3: Faltas Graves
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {/* Encabezado de sección */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Visión General
            </h2>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <div className="h-8 w-8 text-blue-600">🏛️</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Entes conectados
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            33
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <div className="h-8 w-8 text-purple-600">🔌</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          APIs conectadas
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            69
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <div className="h-8 w-8 text-green-600">✅</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Alta disponibilidad
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            73%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                      <div className="h-8 w-8 text-red-600">⚠️</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Alertas críticas
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">
                            3
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 mb-8">
            {/* Gráfica de APIs por sistema */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Distribución de APIs por sistema
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={datosConexion}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Número de APIs">
                        {datosConexion.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Gráfica de disponibilidad */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Disponibilidad de APIs
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosDisponibilidad}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {datosDisponibilidad.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Gráfica de actualización */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Actualización de registros
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datosActualizacion}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {datosActualizacion.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Ranking de entes */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Top entes por desempeño
                </h3>
                <div className="h-64 overflow-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ente
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sistemas
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Disp. (%)
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actual. (%)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rankingEntes.map((ente, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                            {ente.name}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {ente.sistemas}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                ente.disponibilidad >= 90
                                  ? "bg-green-100 text-green-800"
                                  : ente.disponibilidad >= 70
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {ente.disponibilidad}%
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                ente.actualizacion > 0
                                  ? "bg-green-100 text-green-800"
                                  : ente.actualizacion === 0
                                  ? "bg-gray-100 text-gray-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {ente.actualizacion > 0 ? "+" : ""}
                              {ente.actualizacion.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Alertas críticas */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                Alertas críticas
              </h3>
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
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {alertasCriticas.map((alerta, idx) => (
                      <tr
                        key={idx}
                        className={
                          alerta.nivel === "alta" ? "bg-red-50" : "bg-yellow-50"
                        }
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {alerta.ente}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {alerta.sistema}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {alerta.alerta}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Alta
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          <button className="text-blue-600 hover:text-blue-900">
                            Ver detalles
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pie de página */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-600">
            Plataforma Digital Nacional - Sistema Nacional Anticorrupción © 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
