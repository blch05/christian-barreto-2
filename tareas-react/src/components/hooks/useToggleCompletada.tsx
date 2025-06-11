import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useToggleCompletada(id: string, estadoActual: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const ahora = new Date().toISOString();
      return axios.patch(`http://localhost:8008/tareas/${id}`, {
        completada: !estadoActual,
        fecha_modificacion: ahora,
        fecha_realizada: !estadoActual ? ahora : null,
      });
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["tareas"] });

      // Snapshot previo para rollback
      const previousTareas = queryClient.getQueryData(["tareas"]);

      // Actualizar datos optimísticamente
      queryClient.setQueryData(["tareas"], (old: any) => {
        if (!old) return old;
        return old.map((tarea: any) =>
          tarea.id === id
            ? {
                ...tarea,
                completada: !estadoActual,
                fecha_modificacion: new Date().toISOString(),
                fecha_realizada: !estadoActual ? new Date().toISOString() : null,
              }
            : tarea
        );
      });

      return { previousTareas };
    },
    onError: (_err, _variables, context: any) => {
      // Rollback a estado previo si falla la mutación
      if (context?.previousTareas) {
        queryClient.setQueryData(["tareas"], context.previousTareas);
      }
    },
    onSettled: () => {
      // Siempre invalidar queries para sincronizar con el backend
      queryClient.invalidateQueries({ queryKey: ["tareas"] });
    },
  });
}
