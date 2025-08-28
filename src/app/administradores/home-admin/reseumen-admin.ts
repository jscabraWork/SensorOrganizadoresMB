export interface ResumenAdmin {
  /** Total de asistentes al evento */
  totalAsistentes: number;
  
  /** Total de ingresos brutos */
  totalIngresos: number;
  
  /** Total de tickets cortesía otorgados */
  totalCortesias: number;
  
  /** Total de asistentes que compraron en taquilla */
  totalAsistentesTaquilla: number;
  
  /** Total de pagos realizados en taquilla */
  totalPagosTaquilla: number;
  
  /** Total de pagos realizados por PSE */
  totalPagosPse: number;
  
  /** Total de pagos realizados con tarjeta de crédito */
  totalPagosTc: number;
  
  /** Total de transacciones procesadas */
  totalTransacciones: number;
  
  /** Total de compradores únicos */
  totalCompradores: number;
  
  /** Total de asistentes que compraron por PSE */
  totalAsistentesPse: number;
  
  /** Total de asistentes que compraron con tarjeta */
  totalAsistentesTc: number;
  
  /** Total de tickets vendidos en el día de hoy */
  totalTicketsVendidosHoy: number;
  
  /** Total recaudado por venta de tickets */
  totalRecaudado: number;
  
  /** Total recaudado incluyendo todas las transacciones */
  totalRecaudadoTransacciones: number;
  
  /** Total recaudado por servicios */
  totalServicioRecaudado: number;
  
  /** Total recaudado por precio base de tickets */
  totalPrecioRecaudado: number;
  
  /** Total recaudado por IVA */
  totalIvaRecaudado: number;
  
  /** Total recaudado en el día de hoy */
  totalRecaudadoHoy: number;
  
  /** Total de retención en la fuente */
  totalRetefuente: number;
  
  /** Total de retención de ICA */
  totalReteica: number;
  
  /** Total de contribución parafiscal */
  totalParafiscal: number;
  
  /** Total de comisión de AllTickets */
  totalComisionAlltickets: number;
  
  /** Total de comisión de la pasarela de pagos */
  totalComisionPasarela: number;
  
  /** Total de comisión por 3DS */
  totalComision3ds: number;
}


export interface LocalidadesPorAcabar {
  localidadId: number;
  nombre: string;
  evento: string;
  totalTickets: number;
  ticketsVendidos: number;
  ticketsDisponibles: number;
  porcentajeVendido: number;
}