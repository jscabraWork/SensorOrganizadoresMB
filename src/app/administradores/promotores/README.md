# Módulo de Gestión de Promotores (Versión Compacta)

## 📋 Descripción
Componente compacto para gestionar promotores y sus eventos asignados. Utiliza una tabla con filas expandibles para mostrar todos los promotores y un modal para la asignación eficiente de eventos.

## 🎯 Funcionalidades

### 1. Lista de Promotores
- **Tabla principal** con todos los promotores
- **Endpoint:** `GET /api/promotores`
- **Columnas:** ID, Nombre, Documento, Correo, Cantidad de Eventos
- **Paginación** del lado cliente (25 elementos por página)
- **Filas expandibles** con información detallada y subtabla de eventos

### 2. Filtros de Búsqueda
- **SearchFilterComponent** integrado
- **Filtros disponibles:** nombre, documento, correo
- **Búsqueda en tiempo real**

### 3. Gestión de Eventos (Modal Compacto)
- **Modal overlay** para asignación de eventos
- **Endpoint eventos:** `GET /api/eventos/listar-no-estado/3`
- **Lista compacta** con checkboxes
- **Selección múltiple** con "Seleccionar Todo/Deseleccionar Todo"
- **Contador** de eventos seleccionados
- **Permite lista vacía** para remover todos los eventos

### 4. Asignación de Eventos
- **Endpoint:** `PATCH /api/promotores/asignar-eventos/{numeroDocumento}`
- **Body:** Array directo `[1, 2, 3]` (sin wrapper)
- **Reemplaza lista completa** de eventos del promotor

## 🎨 Componentes Utilizados

### Componentes Reutilizables
- `TitleComponent` - Título con navegación
- `TableComponent` - Tabla con expansión y subtablas
- `SearchFilterComponent` - Filtros de búsqueda
- `MensajeComponent` - Modal de mensajes

### Configuración de Tabla
```typescript
expandableConfig: ExpandedRowConfig = {
  infoFields: ['numeroDocumento', 'nombre', 'correo', 'celular', 'eventos.length'],
  actionButtons: [{ text: 'Gestionar Eventos', action: gestionarEventos }],
  subTableConfig: {
    columns: ['id', 'nombre', 'artistas', 'venue.nombre'],
    dataProperty: 'eventos'
  }
}
```

### Filtros de Búsqueda
```typescript
searchFilters: Filter[] = [
  { key: 'nombre', placeholder: 'Buscar por nombre' },
  { key: 'numeroDocumento', placeholder: 'Buscar por documento' },
  { key: 'correo', placeholder: 'Buscar por correo' }
]
```

## 📱 Modal de Asignación

### Características del Modal
- **Overlay con backdrop** para cerrar
- **Header** con título y botón X
- **Body scrolleable** para listas largas
- **Footer** con botones de acción
- **Responsive** para móviles

### Interfaz de Eventos
- **Lista compacta** con checkbox + información
- **Selección visual** con highlights
- **Información resumida**: nombre, ID, artistas, venue
- **Botón toggle** para seleccionar/deseleccionar todo
- **Contador en tiempo real** de seleccionados

## � Estados y Datos

### Estados de Loading
- `cargandoPromotores` - Lista principal
- `cargandoEventos` - Eventos disponibles
- `asignandoEventos` - Proceso de asignación

### Datos Principales
- `promotoresPage` - Página de promotores con paginación
- `eventosDisponibles` - Eventos para asignar
- `eventosSeleccionados` - Array de IDs seleccionados
- `promotorSeleccionado` - Promotor en gestión

## � Flujo de Uso Optimizado

1. **Ver tabla** de todos los promotores
2. **Filtrar** por nombre, documento o correo (opcional)
3. **Expandir fila** para ver eventos actuales del promotor
4. **Clic "Gestionar Eventos"** para abrir modal
5. **Seleccionar/Deseleccionar** eventos en lista compacta
6. **Confirmar cambios** (permite lista vacía)
7. **Ver actualización** automática en tabla principal

## 🎨 Estilos y UX

### Modal Design
- **Overlay semitransparente** con z-index alto
- **Contenido centrado** con max-width responsivo
- **Scrolling interno** para listas largas
- **Animaciones suaves** en hover y selección

### Lista de Eventos
- **Items compactos** con toda la info necesaria
- **Feedback visual** inmediato en selección
- **Checkboxes personalizados** con estilo consistente
- **Hover effects** para mejor UX

### Responsive
- **Modal adaptativo** en móviles (95% width)
- **Botones apilados** en pantallas pequeñas
- **Controles reorganizados** para touch

## ⚡ Optimizaciones

### Performance
- **TrackBy function** en ngFor de eventos
- **Paginación cliente** para conjuntos pequeños
- **Lazy loading** de eventos solo cuando es necesario
- **Estados locales** eficientes

### UX
- **Preselección** de eventos ya asignados
- **Feedback inmediato** en todas las acciones
- **Validaciones preventivas**
- **Mensajes contextuales**

## 🔍 API Integration

### Endpoints Utilizados
```typescript
// Lista todos los promotores
GET /api/promotores
Response: Promotor[] (con eventos anidados)

// Eventos disponibles (estado ≠ 3)
GET /api/eventos/listar-no-estado/3
Response: { eventos: Evento[] }

// Asignación de eventos
PATCH /api/promotores/asignar-eventos/{numeroDocumento}
Body: [1, 2, 3] // Array directo de IDs
Response: { promotor: Promotor }
```

### Características Especiales
- ✅ **Permite lista vacía** para remover todos los eventos
- ✅ **Reemplaza lista completa** en cada asignación
- ✅ **Sin wrapper object** en el body (array directo)
- ✅ **Actualización automática** después de cambios

## 📋 Ventajas de la Nueva Versión

### vs Versión Anterior
- ✅ **Más compacta** - toda la info en una pantalla
- ✅ **Mejor UX** - modal vs múltiples pantallas
- ✅ **Más eficiente** - tabla vs búsqueda individual
- ✅ **Mejor filtrado** - componente especializado
- ✅ **Lista vacía** - posibilidad de remover todos los eventos
- ✅ **Visual feedback** - mejor indicadores de estado

### Preparado para Producción
- ✅ **Error handling** robusto
- ✅ **Loading states** en todas las operaciones
- ✅ **Responsive design** completo
- ✅ **Estilos optimizados** con mínimo CSS local
- ✅ **TypeScript** bien tipado
- ✅ **Documentación** completa
