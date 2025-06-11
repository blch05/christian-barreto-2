export type Tarea = {
  id: string;
  texto: string;
  completada: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;
  fecha_realizada?: string | null;
  tableroId?: string;
};

export type Props = {
  id: string;
  texto: string;
  completada: boolean;
  fecha_creacion: string;
  fecha_modificacion: string;
  fecha_realizada?: string | null;
};