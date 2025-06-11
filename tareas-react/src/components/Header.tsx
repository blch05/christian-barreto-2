import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Link, useMatch } from "@tanstack/react-router";
import { tableroRoute } from "../routes/routes";
import { useUIStore } from "./store/useUIstore";
import { useNotificacionesStore } from "./store/useNotificacionesStore";

type Tablero = {
  id: string;
  nombre: string;
};

const Header = () => {
  const queryClient = useQueryClient();
  const [nuevoNombre, setNuevoNombre] = useState("");

  // Store Zustand para UI
  const { setTableroActivo } = useUIStore();
  // Store Zustand para notificaciones
  const { agregar: notificar } = useNotificacionesStore();

  // Obtener el tablero activo desde la URL
  const match = useMatch({ to: tableroRoute.id });
  const tableroActivo = match?.params.tableroId ?? "";

  // Actualizar el store cuando cambia la URL
  useEffect(() => {
    setTableroActivo(tableroActivo);
  }, [tableroActivo, setTableroActivo]);

  // Obtener tableros desde el backend
  const { data: tableros = [] } = useQuery({
    queryKey: ["tableros"],
    queryFn: () =>
      axios.get("http://localhost:8008/tableros").then((res) => res.data),
  });

  // Mutación para crear tablero
  const crearTableroMutation = useMutation({
    mutationFn: async () => {
      if (!nuevoNombre.trim()) return;
      const nuevo = { nombre: nuevoNombre };
      await axios.post("http://localhost:8008/tableros", nuevo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tableros"] });
      setNuevoNombre("");
      notificar("Tablero creado", "success");
    },
    onError: () => {
      notificar("Error al crear el tablero", "error");
    },
  });

  // Mutación para eliminar tablero
  const eliminarTableroMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`http://localhost:8008/tableros/${id}`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["tableros"] });
      if (tableroActivo === id) {
        queryClient.setQueryData(["tableroActivo"], "");
      }
      notificar("Tablero eliminado", "error");
    },
    onError: () => {
      notificar("Error al eliminar el tablero", "error");
    },
  });

  const handleEliminar = (id: string, nombre: string) => {
    if (tableros.length <= 1) {
      alert("Debe haber al menos un tablero.");
      return;
    }

    const confirmar = confirm(`¿Eliminar el tablero "${nombre}"?`);
    if (confirmar) {
      eliminarTableroMutation.mutate(id);
    }
  };

  return (
    <header className="bg-white text-gray-800 w-full z-50 p-4 fixed top-0 left-0 text-center shadow-sm h-[80px] flex flex-col justify-center respiro-static">
      <h1 className="text-xl font-light tracking-wide select-none">2.DO</h1>
      <nav className="flex justify-center mt-2 space-x-4">
        {tableros.map((t: Tablero) => (
          <div
            key={t.id}
            className="relative group flex items-center space-x-1"
          >
            <Link
              to={`/tablero/${t.id}`}
              className={`text-sm transition-colors duration-200 font-light ${
                tableroActivo === t.id
                  ? "text-black font-semibold underline"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {t.nombre}
            </Link>
            <button
              onClick={() => handleEliminar(t.id, t.nombre)}
              className="text-red-400 hover:text-red-600 text-xs ml-1 transition-opacity duration-150 opacity-0 group-hover:opacity-100"
              title="Eliminar tablero"
              type="button"
            >
              🗑️
            </button>
          </div>
        ))}

        <button
          onClick={() => {
            const nombre = prompt("Nombre del nuevo tablero:");
            if (nombre) {
              setNuevoNombre(nombre);
              crearTableroMutation.mutate();
            }
          }}
          className="text-gray-400 hover:text-blue-500 text-xl font-semibold"
          title="Agregar tablero"
          type="button"
        >
          +
        </button>
      </nav>
      <nav className="flex mt-2 space-x-4">
        <Link
          to="/configuracion"
          className="text-sm text-gray-400 ml-4 -mt-12"
        >
          ⚙️
        </Link>
      </nav>
    </header>
  );
};

export default Header;