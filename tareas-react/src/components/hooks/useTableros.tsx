import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_TABLEROS_URL = "http://localhost:8008/tableros";

export function useTableros() {
  return useQuery({
    queryKey: ["tableros"],
    queryFn: async () => {
      const res = await axios.get(API_TABLEROS_URL);
      return res.data;
    },
  });
}

export function useTablero(id: string) {
  return useQuery({
    queryKey: ["tablero", id],
    queryFn: async () => {
      const res = await axios.get(`${API_TABLEROS_URL}/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}
