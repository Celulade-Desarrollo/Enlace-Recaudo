export interface Banco {
  id: string;
  nombre: string;
  codigo: string;
  icono: string;
  tipo?: 'banco' | 'billetera';
}

export type TipoLlave = 'celular' | 'documento' | 'correo' | 'codigo';

export interface MedioDePago {
  id: string;
  bancoId: string;
  nombre: string;
  icono: string;
  tipo: 'llave' | 'bolsillo';
  valorLlave?: string;
  saldoDisponible?: string;
  tipoLlave?: TipoLlave;
  fechaInscripcion?: string;
  esPrincipal?: boolean;
}

const BANCOS_FALLBACK: Banco[] = [
  {
    id: 'nequi',
    nombre: 'Nequi',
    codigo: '1507',
    icono: '/nequi_icon.png',
    tipo: 'billetera'
  },
  {
    id: 'bancobogota',
    nombre: 'Banco de Bogotá',
    codigo: '1001',
    icono: '/bancobogota_icon.png',
    tipo: 'banco'
  },
  {
    id: 'bancolombia',
    nombre: 'Bancolombia',
    codigo: '1007',
    icono: '/bancolombia_icon.jpg',
    tipo: 'banco'
  },
  {
    id: 'davivienda',
    nombre: 'Davivienda',
    codigo: '1051',
    icono: '/davivienda_icon.png',
    tipo: 'banco'
  },
  {
    id: 'bbva',
    nombre: 'BBVA Colombia',
    codigo: '1013',
    icono: '/bbva_icon.png',
    tipo: 'banco'
  },
  {
    id: 'nu',
    nombre: 'Nu Colombia',
    codigo: '1552',
    icono: '/nubank_icon.png',
    tipo: 'banco'
  }
];

const INITIAL_MEDIOS_DE_PAGO: MedioDePago[] = [
  {
    id: 'nequi-1',
    bancoId: 'nequi',
    nombre: 'Nequi',
    icono: '/nequi_icon.png',
    tipo: 'llave',
    valorLlave: '311 387 7395',
    tipoLlave: 'celular',
    fechaInscripcion: '12 Ene 2025',
    esPrincipal: true
  },
  {
    id: 'bogota-2',
    bancoId: 'bancobogota',
    nombre: 'Banco de Bogotá',
    icono: '/bancobogota_icon.png',
    tipo: 'llave',
    valorLlave: '10073598',
    tipoLlave: 'documento',
    fechaInscripcion: '04 Feb 2025',
    esPrincipal: false
  },
  {
    id: 'bolsillo-3',
    bancoId: 'bolsillo',
    nombre: 'Saldo en mi bolsillo',
    icono: 'wallet',
    tipo: 'bolsillo',
    saldoDisponible: '$157,433.58'
  }
];

// Mapeo para actualizar iconos antiguos si estaban en localStorage
const ICON_MAP: Record<string, string> = {
  nequi: '/nequi_icon.png',
  bancobogota: '/bancobogota_icon.png',
  bancolombia: '/bancolombia_icon.jpg',
  davivienda: '/davivienda_icon.png',
  bbva: '/bbva_icon.png',
  nu: '/nubank_icon.png',
};

// Deducir el tipo de llave según el valor ingresado
export const inferirTipoLlave = (valor: string): TipoLlave => {
  const clean = valor.trim();
  if (clean.includes('@')) return 'correo';
  const digits = clean.replace(/\D/g, '');
  if (digits.length === 10 && (digits.startsWith('3') || digits.startsWith('573'))) {
    return 'celular';
  }
  if (/^\d{6,11}$/.test(digits)) {
    return 'documento';
  }
  return 'codigo';
};

/**
 * SEMIAPI para consultar lista de bancos y medios de pago inscritos.
 */
export const bancosService = {
  /**
   * Consulta la lista de bancos desde el JSON en /data/bancos.json
   */
  async getBancos(): Promise<Banco[]> {
    try {
      const response = await fetch('/data/bancos.json');
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      const data: Banco[] = await response.json();
      return data;
    } catch (err) {
      console.warn('Usando datos de respaldo para bancos:', err);
      return BANCOS_FALLBACK;
    }
  },

  /**
   * Obtiene los medios de pago (llaves inscritas + bolsillos)
   */
  async getMediosDePago(): Promise<MedioDePago[]> {
    const stored = localStorage.getItem('enlace_medios_pago');
    if (stored) {
      try {
        const parsed: MedioDePago[] = JSON.parse(stored);
        // Actualizar iconos de llaves existentes con los nuevos logos de public/ y asegurar campos
        return parsed.map((m) => {
          let updated = { ...m };
          if (m.tipo === 'llave' && ICON_MAP[m.bancoId]) {
            updated.icono = ICON_MAP[m.bancoId];
          }
          if (m.tipo === 'llave' && !updated.tipoLlave && m.valorLlave) {
            updated.tipoLlave = inferirTipoLlave(m.valorLlave);
          }
          return updated;
        });
      } catch (e) {
        console.error('Error parseando medios de pago guardados', e);
      }
    }
    return INITIAL_MEDIOS_DE_PAGO;
  },

  /**
   * Obtiene exclusivamente las llaves inscritas en el programa Bre-B
   */
  async getLlaves(): Promise<MedioDePago[]> {
    const todos = await this.getMediosDePago();
    return todos.filter((m) => m.tipo === 'llave');
  },

  /**
   * Guarda o actualiza la lista de medios de pago
   */
  async saveMediosDePago(medios: MedioDePago[]): Promise<void> {
    localStorage.setItem('enlace_medios_pago', JSON.stringify(medios));
  },

  /**
   * Inscribe una nueva llave en el programa
   */
  async inscribirLlave(
    banco: Banco,
    valorLlave: string,
    tipoLlave?: TipoLlave
  ): Promise<MedioDePago> {
    const current = await this.getMediosDePago();
    const existingKeys = current.filter((m) => m.tipo === 'llave');
    const tipo = tipoLlave || inferirTipoLlave(valorLlave);

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const now = new Date();
    const fechaInscripcion = `${now.getDate().toString().padStart(2, '0')} ${meses[now.getMonth()]} ${now.getFullYear()}`;

    const nueva: MedioDePago = {
      id: `${banco.id}-${Date.now()}`,
      bancoId: banco.id,
      nombre: banco.nombre,
      icono: banco.icono,
      tipo: 'llave',
      valorLlave,
      tipoLlave: tipo,
      fechaInscripcion,
      esPrincipal: existingKeys.length === 0 // Primera llave es la principal por defecto
    };

    const updated = [nueva, ...current];
    await this.saveMediosDePago(updated);
    return nueva;
  },

  /**
   * Elimina / desvincula una llave del programa
   */
  async eliminarLlave(id: string): Promise<MedioDePago[]> {
    const current = await this.getMediosDePago();
    const eliminada = current.find((m) => m.id === id);
    let updated = current.filter((m) => m.id !== id);

    // Si la llave eliminada era principal y quedan llaves, asignar la principal a la primera restante
    if (eliminada?.esPrincipal) {
      const primeraRestante = updated.find((m) => m.tipo === 'llave');
      if (primeraRestante) {
        primeraRestante.esPrincipal = true;
      }
    }

    await this.saveMediosDePago(updated);
    return updated.filter((m) => m.tipo === 'llave');
  },

  /**
   * Establece una llave como la principal para recepción de pagos
   */
  async setLlavePrincipal(id: string): Promise<MedioDePago[]> {
    const current = await this.getMediosDePago();
    const updated = current.map((m) => {
      if (m.tipo === 'llave') {
        return {
          ...m,
          esPrincipal: m.id === id
        };
      }
      return m;
    });

    await this.saveMediosDePago(updated);
    return updated.filter((m) => m.tipo === 'llave');
  },

  /**
   * Actualiza los datos de una llave existente (editar número, tipo o banco)
   */
  async editarLlave(
    id: string,
    nuevosDatos: {
      valorLlave: string;
      tipoLlave?: TipoLlave;
      banco?: Banco;
    }
  ): Promise<MedioDePago[]> {
    const current = await this.getMediosDePago();
    const updated = current.map((m) => {
      if (m.id === id) {
        const tipo = nuevosDatos.tipoLlave || inferirTipoLlave(nuevosDatos.valorLlave);
        return {
          ...m,
          valorLlave: nuevosDatos.valorLlave,
          tipoLlave: tipo,
          ...(nuevosDatos.banco
            ? {
                bancoId: nuevosDatos.banco.id,
                nombre: nuevosDatos.banco.nombre,
                icono: nuevosDatos.banco.icono
              }
            : {})
        };
      }
      return m;
    });

    await this.saveMediosDePago(updated);
    return updated.filter((m) => m.tipo === 'llave');
  }
};
