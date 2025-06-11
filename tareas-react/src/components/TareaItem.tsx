import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNotificacionesStore } from "./store/useNotificacionesStore";
import { useConfigStore } from "./store/useConfigStore";
import type { Props } from "../types";

const CheckIcon = ({ completed }: { completed: boolean }) => (
  <svg
    className={`w-6 h-6 transition-colors duration-300 ${
      completed ? "text-blue-500" : "text-white hover:text-blue-300"
    }`}
    fill="none"
    stroke="currentColor"
    strokeWidth={3}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    {completed ? (
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    ) : (
      <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

const TrashIcon = () => (
  <svg
    className="w-6 h-6 text-white hover:text-red-600 transition-colors duration-300 cursor-pointer"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z"
    />
  </svg>
);

const TareaItem = ({
  id,
  texto,
  completada,
  fecha_creacion,
  fecha_modificacion,
  fecha_realizada,
}: Props) => {
  const queryClient = useQueryClient();
  const [editando, setEditando] = useState(false);
  const [nuevoTexto, setNuevoTexto] = useState(texto);

  // Notificaciones desde el store global
  const { agregar: notificar } = useNotificacionesStore();

  // Configuración global (mayúsculas)
  const descripcionMayusculas = useConfigStore((state) => state.descripcionMayusculas);

  // Mutación para alternar completada
  const toggleMutation = useMutation({
    mutationFn: async () => {
      const ahora = new Date().toISOString();
      const nuevoEstado = !completada;
      await axios.patch(`http://localhost:8008/tareas/${id}`, {
        completada: nuevoEstado,
        fecha_modificacion: ahora,
        fecha_realizada: nuevoEstado ? ahora : null,
      });
      return nuevoEstado;
    },
    onSuccess: (nuevoEstado) => {
      queryClient.invalidateQueries({ queryKey: ["tareas"] });
      notificar(
        nuevoEstado ? "Tarea completada" : "Tarea marcada como pendiente",
        "success"
      );
    },
    onError: () => {
      notificar("Error al cambiar el estado de la tarea", "error");
    },
  });

  // Mutación para eliminar tarea
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`http://localhost:8008/tareas/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas"] });
      notificar("Tarea eliminada", "error");
    },
    onError: () => {
      notificar("Error al eliminar tarea", "error");
    },
  });

  // Mutación para editar texto
  const editarMutation = useMutation({
    mutationFn: async () => {
      const ahora = new Date().toISOString();
      await axios.patch(`http://localhost:8008/tareas/${id}`, {
        texto: nuevoTexto,
        fecha_modificacion: ahora,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas"] });
      notificar("Tarea editada", "success");
      setEditando(false);
    },
    onError: () => {
      notificar("Error al editar tarea", "error");
    },
  });

  const handleEditarTexto = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (nuevoTexto.trim()) {
        editarMutation.mutate();
      } else {
        setNuevoTexto(texto);
        setEditando(false);
      }
    } else if (e.key === "Escape") {
      setNuevoTexto(texto);
      setEditando(false);
    }
  };

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return "N/A";
    const date = new Date(fecha);
    return isNaN(date.getTime())
      ? "Fecha inválida"
      : date.toLocaleString("es-ES", {
          dateStyle: "medium",
          timeStyle: "short",
        });
  };

  return (
    <div className="flex flex-col gap-2 bg-black/80 backdrop-blur-lg rounded-xl border border-white/20 p-4 shadow-md shadow-black/20 hover:shadow-lg transition-shadow duration-300 text-white">
      <div className="flex items-center justify-between">
        <button
          onClick={() => toggleMutation.mutate()}
          aria-label="Toggle complete"
          className="focus:outline-none"
          disabled={toggleMutation.isPending}
        >
          <CheckIcon completed={completada} />
        </button>

        <div className="flex-1 mx-4 text-center">
          {editando ? (
            <input
              autoFocus
              value={nuevoTexto}
              onChange={(e) => setNuevoTexto(e.target.value)}
              onKeyDown={handleEditarTexto}
              onBlur={() => {
                setNuevoTexto(texto);
                setEditando(false);
              }}
              className="bg-transparent border-b border-gray-500 text-white text-center outline-none"
            />
          ) : (
            <p
              className={`font-medium transition-colors duration-300 cursor-pointer ${
                completada ? "line-through text-gray-400" : ""
              }`}
              onClick={() => setEditando(true)}
              title="Haz clic para editar"
            >
              {descripcionMayusculas ? texto.toUpperCase() : texto}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditando(true)}
            aria-label="Edit task"
            className="focus:outline-none"
            disabled={editando}
          >
            <EditIcon />
          </button>

          <button
            onClick={() => deleteMutation.mutate()}
            aria-label="Delete task"
            className="focus:outline-none"
            disabled={deleteMutation.isPending}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="text-xs text-gray-400 flex flex-col sm:flex-row sm:justify-between sm:gap-4">
        <p>Creada: {formatFecha(fecha_creacion)}</p>
        <p>Última modificación: {formatFecha(fecha_modificacion)}</p>
        <p>Realizada: {formatFecha(fecha_realizada)}</p>
      </div>
    </div>
  );
};

export default TareaItem;