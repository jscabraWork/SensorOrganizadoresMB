
// Modelo para datos de gráfica de líneas temporales
export interface GraficaLineas {
  /** Número del periodo (1-12 para meses, 1-31 para días) */
  periodo: number;
  
  /** Nombre del periodo en español (ej. "Enero", "Miércoles") */
  nombrePeriodo: string;
  
  /** Total recaudado en el periodo */
  recaudado: number;
  
  /** Número de asistentes/tickets vendidos */
  asistentes: number;
  
  /** Recaudación solo del precio base */
  precioRecaudado: number;
  
  /** Recaudación de cargos por servicio */
  servicioRecaudado: number;
  
  /** Recaudación de IVA */
  ivaRecaudado: number;
  
  /** Recaudación según transacciones procesadas */
  recaudadoTrx: number;
}
