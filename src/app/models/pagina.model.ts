import { Tipo } from "./tipo.model";

export class Pagina {
    id: number;
    nombre: string;
    estado: number; // 0: Borrador, 1: Publicado, 2: Archivado
    secciones: Seccion[];
    recursos: Recurso[];
    lastModifiedDate: string;
    creationDate: string;
    tipo:Tipo;
    
    constructor() {
        this.id = 0;
        this.nombre = '';
        this.estado = 0;
        this.secciones = [];
        this.recursos = [];
    }
}

export class Recurso {
    id: number;
    url: string;
    tipo: number; // 0: Imagen, 1: Video, 2: Texto, 3: Enlace
    nombre : string;
    formato  : string;
    size : number;
    creationDate: string;
    pagina: Pagina
      constructor() {
        this.id = 0;
        this.url = '';
        this.nombre = '';
        this.tipo = 0;
        this.formato = '';
        this.size = 0;
    }
}

// Modelo extendido para Seccion
export class Seccion {
    
    id: number;
    nombre: string;
    orden: number;
    contenido: any[];
    
    // Ahora usa EstiloContenido para consistencia
    estilos: EstiloContenido;
    
    constructor() {
        this.id = 0;
        this.nombre = '';
        this.orden = 0;
        this.contenido = [];
        
        // Inicializar estilos con valores por defecto específicos para sección
        this.estilos = new EstiloContenido();
        
        // Sobrescribir algunos valores por defecto para secciones
        this.estilos.backgroundColor = '#ffffff';
        this.estilos.width = '100%';
        this.estilos.height = 'auto';
        this.estilos.marginBottom = 20;
        this.estilos.paddingTop = 15;
        this.estilos.paddingRight = 15;
        this.estilos.paddingBottom = 15;
        this.estilos.paddingLeft = 15;
        this.estilos.borderRadius = 8;
    }
}

// Base para propiedades de estilo de contenido
export class EstiloContenido {

    width: string;
    height: string;
    
    // Alineación
    textAlign: string;
    
    // Márgenes
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
    
    // Bordes
    borderWidth: number;
    borderRadius: number;

    borderColor: string;

    backgroundColor: string;

    paddingTop: number;

    paddingRight: number;

    paddingBottom: number;

    paddingLeft: number;
    
   constructor() {
        this.textAlign = 'left';
        this.marginTop = 0;
        this.marginRight = 0;
        this.marginBottom = 10;
        this.marginLeft = 0;
        this.borderWidth = 0;
        this.borderColor = '';
        this.borderRadius = 4;
        this.backgroundColor = '';
        this.width = '100%';
        this.height = '50px';
        this.paddingBottom =0;
        this.paddingLeft =0;
        this.paddingRight =0;
        this.paddingTop =0;
    }
}

// Extiende la clase Contenido para incluir propiedades de estilo
export class Contenido {
    id: number;
    tipo: number; // 0: Imagen, 1: Video, 2: Texto, 3: Enlace
    orden: number;
    // Propiedades de estilo
    estilos: EstiloContenido;

        type: string

    
    constructor() {
        this.id = 0;
        this.orden = 0;
        this.tipo = 0;
        this.estilos = new EstiloContenido();
    }
}

// Propiedades específicas para Texto
export class Texto extends Contenido {
    
    descripcion: string;
    // Propiedades de texto específicas
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    lineHeight: number;
    color: string;
    
    constructor() {
        super();
        this.descripcion = 'Texto';
        this.tipo = 2;
        
        // Propiedades de texto por defecto
        this.fontSize = 16;
        this.fontWeight = 'normal';
        this.fontStyle = 'normal';
        this.lineHeight = 1.5;
        this.color = '#000000';
        this.type = 'texto'
    }
}

// Propiedades específicas para Imagen
export class Imagen extends Contenido {
    recurso: Recurso;

    //Hiperviculo al que apunta la imagen
    target: string;
    objectFit: string;


    
    constructor() {
        super();
        this.objectFit = 'contain';
        this.tipo = 0;
        this.type = 'imagen'
    }
}

// Propiedades específicas para Video
export class Video extends Contenido {
    // Recurso principal del video
    recurso: Recurso;
    
    // Opciones de reproducción
    autoplay: boolean;     // Reproducción automática
    bucle: boolean;         // Reproducción en bucle
    controls: boolean;     // Mostrar controles de reproducción
    muted: boolean;        // Silenciar por defecto
   
    
    constructor() {
        super();
        this.tipo = 1;     // Tipo 1 corresponde a video
        
        // Valores por defecto
        this.autoplay = false;
        this.bucle = false;
        this.controls = true;
        this.muted = false;
        this.estilos = new EstiloContenido();

        this.estilos.height = '300px'; // Altura por defecto del video

        this.type = 'video'
    }
}

// Propiedades específicas para Enlace
export class Enlace extends Contenido {
    url: string;
    texto: string;
    target: string;
    color: string;
    fontSize: number
    
    constructor() {
        super();
        this.url = '';
        this.texto = '';
        this.color = '#007bff';
        this.tipo = 3;
        this.target = '_self';
        this.fontSize = 16;
        this.estilos = new EstiloContenido();
        this.type = 'enlace'
    }
}