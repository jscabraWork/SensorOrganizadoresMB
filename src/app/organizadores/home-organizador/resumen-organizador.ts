export interface ResumenOrganizador {
  /** Número de documento del organizador */
  organizadorNumeroDocumento: string;
  
  /** Nombre o identificación del organizador */
  organizador: string;
  
  /** Cantidad total de eventos creados/gestionados */
  totalEventos: number;
  
  /** Dinero total recaudado por venta de tickets */
  dineroTotalRecaudado: number;
  
  /** Total recaudado incluyendo todas las transacciones */
  totalRecaudadoTransacciones: number;
  
  /** Número total de asistentes a todos los eventos */
  totalAsistentes: number;
  
  /** Promedio de dinero recaudado por evento */
  promedioDineroRecaudado: number;
  
  /** Promedio de asistentes por evento */
  promedioAsistentes: number;
  
  /** Máxima recaudación obtenida en un evento */
  maximoRecaudadoEvento: number;
  
  /** Mínima recaudación obtenida en un evento */
  minimoRecaudadoEvento: number;
  
  /** Máxima cantidad de asistentes en un evento */
  maximoAsistentesEvento: number;
  
  /** Mínima cantidad de asistentes en un evento */
  minimoAsistentesEvento: number;
  
  /** Total de transacciones procesadas */
  totalTransaccionesProcesadas: number;
  
  /** Número de compradores únicos */
  totalCompradoresUnicos: number;
  
  /** Promedio de compradores por evento */
  promedioCompradoresPorEvento: number;
  
  /** Promedio de tickets comprados por comprador */
  ticketsPromedioPorComprador: number;
  
  /** Total de cortesías/tickets gratuitos otorgados */
  totalCortesias: number;
}
