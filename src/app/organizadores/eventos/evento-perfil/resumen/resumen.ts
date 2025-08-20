export class ResumenEvento {
  eventoId: number;
  nombre: string;
  asistentes: number;
  ingresos: number;
  totalRecaudado: number;
  servicioRecaudado: number;
  precioRecaudado: number;
  ivaRecaudado: number;
  totalCortesias: number;
  asistentesTaquilla: number;
  pagosTaquilla: number;
  pagosPse: number;
  pagosTc: number;
  totalTransacciones: number;
  totalCompradores: number;
  asistentesPse: number;
  asistentesTc: number;
  ticketsVendidosHoy: number;
  totalRecaudadoHoy: number;
  retefuente: number;
  reteica: number;
  parafiscal: number;
  comisionAlltickets: number;
  comisionPasarela: number;
  comision3ds: number;
  totalComisiones: number;
  totalRetenciones: number;
  porcentajeOcupacion: number;

  getNeto(): number {
    return this.totalRecaudado - this.totalComisiones - this.totalRetenciones;
  }
}


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
export interface GraficaDona {
  /** Método de pago: 'punto_fisico' | 'tarjeta' | 'pse' */
  metodo: string;
  
  /** Total recaudado por este método según tickets */
  totalRecaudado: number;
  
  /** Total recaudado por este método según transacciones */
  totalRecaudadoTransacciones: number;
}


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
