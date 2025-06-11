import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const TAREAS_POR_PAGINA = 3;
const API_URL = "http://localhost:8008/tareas";

export function usePaginatedTareas(tableroId: string, filtro: string, pagina: number) {
  return useQuery({
    queryKey: ["tareas", tableroId, filtro, pagina],
    queryFn: async () => {
      let url = `${API_URL}?tableroId=${tableroId}&_page=${pagina}&_limit=${TAREAS_POR_PAGINA}`;
      if (filtro === "activas") url += "&completada=false";
      else if (filtro === "completadas") url += "&completada=true";

      const res = await axios.get(url);
      return {
        tareas: res.data,
        total: Number(res.headers["x-total-count"]),
      };
    },
    enabled: !!tableroId,
    keepPreviousData: true, // mantiene la data anterior mientras carga la nueva
  });
}
