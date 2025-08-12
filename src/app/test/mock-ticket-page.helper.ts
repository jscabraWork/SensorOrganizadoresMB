import { Page } from '../models/page.mode'
import { Ticket } from '../models/ticket.model';
import { Tarifa } from '../models/tarifa.model';
import { Localidad } from '../models/localidad.model';

// Datos base reutilizables
const mockLocalidad: Localidad = {
  id: 1,
  nombre: 'Localidad General',
  estado: 1,
  aporte_minimo: 0,
  tipo: 1,
  tarifas: [],
  dias: []
};

const mockTarifa: Tarifa = {
  id: 1,
  nombre: 'Tarifa General',
  precio: 100,
  servicio: 1,
  iva: 0.19,
  estado: 1,
  localidad: mockLocalidad
};

// Tickets predefinidos listos para usar
export const MOCK_TICKETS = {
  // Ticket básico disponible
  DISPONIBLE: {
    id: 1,
    numero: '1',
    estado: 0,
    tipo: 0,
    ordenes: [],
    servicios: [],
    asientos: [],
    palco: null,
    cliente: null,
    seguro: null,
    ingresos: null,
    tarifa: mockTarifa,
    localidad: mockLocalidad,
    personasPorTicket: 1
  } as Ticket,

  // Ticket vendido
  VENDIDO: {
    id: 2,
    numero: '2',
    estado: 1,
    tipo: 0,
    ordenes: [],
    servicios: [],
    asientos: [],
    palco: null,
    cliente: null,
    seguro: null,
    ingresos: null,
    tarifa: mockTarifa,
    localidad: mockLocalidad,
    personasPorTicket: 1
  } as Ticket,

  // Palco disponible
  PALCO_DISPONIBLE: {
    id: 3,
    numero: 'P1',
    estado: 0,
    tipo: 1,
    ordenes: [],
    servicios: [],
    asientos: [],
    ingresos: null,
    palco: null,
    cliente: null,
    seguro: null,
    tarifa: { ...mockTarifa, precio: 500 },
    localidad: mockLocalidad,
    personasPorTicket: 4
  } as Ticket,

  // Palco vendido
  PALCO_VENDIDO: {
    id: 4,
    numero: 'P2',
    estado: 1,
    tipo: 1,
    ordenes: [],
    servicios: [],
    asientos: [],
    palco: null,
    ingresos: null,
    cliente: null,
    seguro: null,
    tarifa: { ...mockTarifa, precio: 500 },
    localidad: mockLocalidad,
    personasPorTicket: 4
  } as Ticket,

  // Asientos de palco
  ASIENTO_A1: {
    id: 101,
    numero: 'A1',
    estado: 0,
    tipo: 0,
    ordenes: [],
    servicios: [],
    asientos: [],
    palco: null,
    cliente: null,
    ingresos: null,
    seguro: null,
    tarifa: { ...mockTarifa, precio: 50 },
    localidad: mockLocalidad,
    personasPorTicket: 1
  } as Ticket,

  ASIENTO_A2: {
    id: 102,
    numero: 'A2',
    estado: 0,
    tipo: 0,
    ordenes: [],
    servicios: [],
    asientos: [],
    palco: null,
    cliente: null,
    ingresos: null,
    seguro: null,
    tarifa: { ...mockTarifa, precio: 50 },
    localidad: mockLocalidad,
    personasPorTicket: 1
  } as Ticket
};

// Pages predefinidas
export const MOCK_PAGES = {
  // Página con un ticket
  SINGLE_TICKET: {
    content: [MOCK_TICKETS.DISPONIBLE],
    totalElements: 1,
    totalPages: 1,
    size: 25,
    number: 0
  } as Page<Ticket>,

  // Página con múltiples tickets
  MULTIPLE_TICKETS: {
    content: [
      MOCK_TICKETS.DISPONIBLE,
      MOCK_TICKETS.VENDIDO,
      MOCK_TICKETS.PALCO_DISPONIBLE
    ],
    totalElements: 3,
    totalPages: 1,
    size: 25,
    number: 0
  } as Page<Ticket>,

  // Página vacía
  EMPTY: {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 25,
    number: 0
  } as Page<Ticket>,

  // Solo palcos
  PALCOS_ONLY: {
    content: [MOCK_TICKETS.PALCO_DISPONIBLE, MOCK_TICKETS.PALCO_VENDIDO],
    totalElements: 2,
    totalPages: 1,
    size: 25,
    number: 0
  } as Page<Ticket>
};

// Arrays de asientos predefinidos
export const MOCK_ASIENTOS = {
  PALCO_COMPLETO: [MOCK_TICKETS.ASIENTO_A1, MOCK_TICKETS.ASIENTO_A2],
  SINGLE_ASIENTO: [MOCK_TICKETS.ASIENTO_A1]
};

// Función helper simple para clonar (opcional)
export const cloneTicket = (ticket: Ticket, overrides: Partial<Ticket> = {}): Ticket => ({
  ...ticket,
  ...overrides
});