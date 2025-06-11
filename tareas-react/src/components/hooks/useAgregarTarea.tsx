import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useAgregarTarea(tableroId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (texto: string) =>
      axios.post("http://localhost:8008/tareas", {
        id: crypto.randomUUID(),
        texto,
        completada: false,
        fecha_creacion: new Date().toISOString(),
        fecha_modificacion: new Date().toISOString(),
        fecha_realizada: null,
        tableroId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tareas", tableroId] });
    },
  });
}
