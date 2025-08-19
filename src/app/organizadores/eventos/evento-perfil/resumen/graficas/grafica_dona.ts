export interface GraficaDona {
  /** Método de pago: 'punto_fisico' | 'tarjeta' | 'pse' */
  metodo: string;
  
  /** Total recaudado por este método según tickets */
  totalRecaudado: number;
  
  /** Total recaudado por este método según transacciones */
  totalRecaudadoTransacciones: number;
}