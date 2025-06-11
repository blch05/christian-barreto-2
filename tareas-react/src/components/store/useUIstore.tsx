// store/useUIstore.ts
import { create } from "zustand";

interface UIState {
  filtro: "todas" | "activas" | "completadas";
  pagina: number;
  tableroActivo: string;
  setFiltro: (filtro: UIState["filtro"]) => void;
  setPagina: (pagina: number) => void;
  setTableroActivo: (id: string) => void;
  agregarTablero: (nombre: string) => void;
  tableros: string[];
}

export const useUIStore = create<UIState>((set) => ({
  filtro: "todas",
  pagina: 1,
  tableroActivo: "Personal",
  tableros: ["Personal", "Trabajo"],
  setFiltro: (filtro) => set({ filtro, pagina: 1 }),
  setPagina: (pagina) => set({ pagina }),
  setTableroActivo: (id) => set({ tableroActivo: id, pagina: 1 }),
  agregarTablero: (nombre) =>
    set((state) => ({
      tableros: [...state.tableros, nombre],
      tableroActivo: nombre,
      pagina: 1,
    })),
}));

