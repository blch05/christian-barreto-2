import React from "react";
import { useConfigStore } from "./store/useConfigStore";

const Configuracion = () => {
  // Hooks del store global de configuración
  const intervaloRefetch = useConfigStore((s) => s.intervaloRefetch);
  const setIntervaloRefetch = useConfigStore((s) => s.setIntervaloRefetch);
  const descripcionMayusculas = useConfigStore((s) => s.descripcionMayusculas);
  const setDescripcionMayusculas = useConfigStore((s) => s.setDescripcionMayusculas);

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white rounded-xl shadow p-8 flex flex-col gap-6">
      <h2 className="text-2xl font-bold mb-4">Configuraciones</h2>
      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          <span>Intervalo de actualización de tareas (segundos):</span>
          <input
            type="number"
            min={1}
            value={intervaloRefetch / 1000}
            onChange={(e) => setIntervaloRefetch(Number(e.target.value) * 1000)}
            className="border rounded px-2 py-1 w-32"
          />
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={descripcionMayusculas}
            onChange={(e) => setDescripcionMayusculas(e.target.checked)}
          />
          Mostrar descripción de tareas en mayúsculas
        </label>
      </div>
    </div>
  );
};

export default Configuracion;