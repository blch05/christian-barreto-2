import React from "react";
import ListaTareas from "./ListaTareas";
import { useUIStore } from "./store/useUIstore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { Tarea } from "../types";

const TableroDeListas = () => {
  // Tableros y tablero activo desde el store global
  const tableros = useUIStore((s) => s.tableros);
  const agregarTablero = useUIStore((s) => s.agregarTablero);
  const tableroActivo = useUIStore((s) => s.tableroActivo);
  const setTableroActivo = useUIStore((s) => s.setTableroActivo);

  // Obtener todas las tareas (puedes usar un hook personalizado si lo tienes)
  const { data: tareas = [], isLoading, isError } = useQuery({
    queryKey: ["tareas"],
    queryFn: () =>
      axios.get("http://localhost:8008/tareas").then((res) => res.data),
  });

  const handleAgregarTablero = () => {
    const nuevo = prompt("Nombre del nuevo tablero:");
    if (nuevo && !tableros.includes(nuevo)) {
      agregarTablero(nuevo);
      setTableroActivo(nuevo);
    }
  };

  if (isLoading) return <p>Cargando tareas...</p>;
  if (isError) return <p>Error al cargar tareas</p>;

  return (
    <div className="p-6 flex flex-col items-center gap-8">
      <button
        onClick={handleAgregarTablero}
        className="px-4 py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
      >
        + Nuevo Tablero
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 w-full">
        {tableros.map((tableroId) => (
          <div key={tableroId} className="w-full">
            <h2
              className={`text-xl font-bold mb-2 text-center capitalize ${
                tableroActivo === tableroId
                  ? "text-blue-400 underline"
                  : "text-white"
              }`}
              style={{ cursor: "pointer" }}
              onClick={() => setTableroActivo(tableroId)}
            >
              {tableroId}
            </h2>
            {/* Filtra las tareas por tablero */}
            <ListaTareas
              tareas={tareas.filter((t: Tarea) => t.tableroId === tableroId)}
              listaId={tableroId}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableroDeListas;