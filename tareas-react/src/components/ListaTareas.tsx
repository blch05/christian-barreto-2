import React, { useEffect, useState } from "react";
import TareaItem from "./TareaItem";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useUIStore } from "./store/useUIstore";
import { useMatch } from "@tanstack/react-router";
import { tableroRoute } from "../routes/routes";
import { useNotificacionesStore } from "./store/useNotificacionesStore";
import { useConfigStore } from "./store/useConfigStore";
import type { Tarea } from "../types";

const TAREAS_POR_PAGINA = 3;

type ListaTareasProps = {
  tareas: Tarea[];
  listaId: string;
};

const ListaTareas: React.FC<ListaTareasProps> = ({ tareas, listaId }) => {
  const queryClient = useQueryClient();
  const { filtro, setFiltro } = useUIStore();
  const [texto, setTexto] = useState("");

  // Obtener el ID del tablero actual desde la URL
  const match = useMatch({ to: tableroRoute.id });
  const tableroActivo = match?.params.tableroId ?? "";

  // Página actual (almacenada en React Query para persistencia entre renders)
  const { data: currentPage = 1 } = useQuery({
    queryKey: ["pagina"],
    queryFn: () => 1,
  });
  const setPagina = (page: number) => {
    queryClient.setQueryData(["pagina"], page);
  };

  const { agregar: notificar } = useNotificacionesStore();

  // Configuración global
  const intervaloRefetch = useConfigStore((state) => state.intervaloRefetch);
  const descripcionMayusculas = useConfigStore((state) => state.descripcionMayusculas);

  // Mutación para agregar tarea
  const agregarTareaMutation = useMutation({
    mutationFn: (texto: string) => {
      const now = new Date().toISOString();
      return axios.post("http://localhost:8008/tareas", {
        id: crypto.randomUUID(),
        texto,
        completada: false,
        fecha_creacion: now,
        fecha_modificacion: now,
        fecha_realizada: null,
        tableroId: tableroActivo,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas", tableroActivo] });
      setTexto("");
      notificar("Tarea creada", "success");
    },
    onError: () => {
      notificar("Error al crear la tarea", "error");
    },
  });

  const agregarTarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (texto.trim() === "") return;
    agregarTareaMutation.mutate(texto.trim());
  };

  // Si quieres seguir usando las tareas de props, comenta el siguiente bloque:
  /*
  const {
    data: tareas = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tareas", tableroActivo],
    queryFn: () =>
      axios
        .get(`http://localhost:8008/tareas?tableroId=${tableroActivo}`)
        .then((res) => res.data),
    enabled: !!tableroActivo,
    refetchInterval: intervaloRefetch,
  });
  */
  // Y usa estas variables en su lugar:
  const isLoading = false;
  const isError = false;

  // Filtrado y paginación
  const tareasFiltradas = tareas.filter((t: Tarea) =>
    filtro === "activas" ? !t.completada :
    filtro === "completadas" ? t.completada : true
  );

  const totalPaginas = Math.max(1, Math.ceil(tareasFiltradas.length / TAREAS_POR_PAGINA));

  useEffect(() => {
    if (currentPage > totalPaginas) setPagina(1);
  }, [tareasFiltradas.length, totalPaginas]);

  const inicio = (currentPage - 1) * TAREAS_POR_PAGINA;
  const tareasPaginadas = tareasFiltradas.slice(inicio, inicio + TAREAS_POR_PAGINA);

  return (
    <div className="bg-gray-150 bg-opacity-10 backdrop-blur-md border border-white border-opacity-20 rounded-3xl shadow-lg w-[90%] max-w-3xl mx-auto p-8 flex flex-col gap-6 text-gray-800">
      {/* Formulario de nueva tarea */}
      <form onSubmit={agregarTarea} className="flex gap-2 mb-4">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="¿Qué necesitas hacer?"
          className="
            rounded-xl
            h-16
            bg-white bg-opacity-30
            placeholder-gray-300
            text-gray-900
            px-4
            w-full
            focus:outline-none
            transition
            focus:ring-0
            focus:shadow-[0_0_8px_2px_rgba(69,140,255,0.5)]
          "
        />
      </form>

      {/* Filtros */}
      <div className="flex gap-4 justify-center">
        {(["todas", "activas", "completadas"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`text-sm font-semibold transition ${
              filtro === f
                ? "text-blue-600 underline underline-offset-4"
                : "text-gray-500 hover:text-blue-500"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Lista de tareas */}
      {isLoading ? (
        <p className="text-gray-500 text-center mt-4">Cargando tareas...</p>
      ) : isError ? (
        <p className="text-red-500 text-center mt-4">Error al cargar tareas</p>
      ) : tareasPaginadas.length === 0 ? (
        <p className="text-center text-gray-500">No hay tareas para mostrar</p>
      ) : (
        tareasPaginadas.map((tarea: Tarea) => (
          <TareaItem
            key={tarea.id}
            {...tarea}
            fecha_creacion={tarea.fecha_creacion ?? ""}
            fecha_modificacion={tarea.fecha_modificacion ?? ""}
            fecha_realizada={tarea.fecha_realizada ?? ""}
            tableroId={tarea.tableroId ?? ""}
            descripcionMayusculas={descripcionMayusculas}
          />
        ))
      )}

      {/* Paginación */}
      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setPagina(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          ← Anterior
        </button>

        <span className="text-gray-400 font-medium">
          {currentPage} de {totalPaginas}
        </span>

        <button
          onClick={() => setPagina(Math.min(totalPaginas, currentPage + 1))}
          disabled={currentPage === totalPaginas}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
            currentPage === totalPaginas
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
};

export default ListaTareas;