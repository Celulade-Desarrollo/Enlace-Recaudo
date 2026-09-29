import { obtenerFechaHoraActual, obtenerPartesColombia } from '../types/transaccion';

export interface TiendaRuta {
  id: string;
  nombre: string;
  direccion?: string;
  telefono?: string;
  estado: 'pendiente' | 'visitado';
  saldoTotal: string;
  saldoTotalNum: number;
  horaVisita?: string;
  recaudado?: string;
  facturasCount: number;
}

export interface PrefacturaCliente {
  id: string;
  numeroPrefactura: string;
  saldoTotal: string;
  saldoTotalNum: number;
  empresa: string;
  pagador: string;
  medioPago: string;
  fechaHora: string;
  refPago: string;
}

const STORAGE_RUTAS_KEY = 'enlace_transportista_rutas';
const STORAGE_PREFACTURAS_KEY = 'enlace_transportista_prefacturas';

const INITIAL_TIENDAS: TiendaRuta[] = [
  // Pendientes (6)
  {
    id: 'frescura',
    nombre: 'Tiendas Frescura',
    direccion: 'Carrera 45 # 68-20',
    estado: 'pendiente',
    saldoTotal: '$789.900',
    saldoTotalNum: 789900,
    facturasCount: 3
  },
  {
    id: 'comestibles',
    nombre: 'Comestibles La F...',
    direccion: 'Calle 52 # 14-30',
    estado: 'pendiente',
    saldoTotal: '$340.150',
    saldoTotalNum: 340150,
    facturasCount: 2
  },
  {
    id: 'delicias',
    nombre: 'Mercado Delicias',
    direccion: 'Avenida 68 # 22-10',
    estado: 'pendiente',
    saldoTotal: '$215.300',
    saldoTotalNum: 215300,
    facturasCount: 1
  },
  {
    id: 'sanjuan',
    nombre: 'Distribuidora San Juan',
    direccion: 'Carrera 70 # 45-12',
    estado: 'pendiente',
    saldoTotal: '$1.150.000',
    saldoTotalNum: 1150000,
    facturasCount: 4
  },
  {
    id: 'trebol',
    nombre: 'Autoservicio El Trébol',
    direccion: 'Calle 33 # 80-04',
    estado: 'pendiente',
    saldoTotal: '$820.000',
    saldoTotalNum: 820000,
    facturasCount: 3
  },
  {
    id: 'la80',
    nombre: 'Minimarket La 80',
    direccion: 'Carrera 80 # 40-19',
    estado: 'pendiente',
    saldoTotal: '$3.257.895',
    saldoTotalNum: 3257895,
    facturasCount: 5
  },

  // Visitados (10)
  {
    id: 'vecino',
    nombre: 'Tienda El Vecino',
    estado: 'visitado',
    saldoTotal: '$1.250.300',
    saldoTotalNum: 1250300,
    recaudado: '$1.250.300',
    horaVisita: '10:00',
    facturasCount: 2
  },
  {
    id: 'economia',
    nombre: 'Abarrotes La Eco...',
    estado: 'visitado',
    saldoTotal: '$450.000',
    saldoTotalNum: 450000,
    recaudado: '$450.000',
    horaVisita: '09:15',
    facturasCount: 1
  },
  {
    id: 'super-barrio',
    nombre: 'Supermercado Mi...',
    estado: 'visitado',
    saldoTotal: '$600.000',
    saldoTotalNum: 600000,
    recaudado: '$600.000',
    horaVisita: '08:35',
    facturasCount: 2
  },
  {
    id: 'variedades-rosa',
    nombre: 'Variedades Doña Rosa',
    estado: 'visitado',
    saldoTotal: '$310.200',
    saldoTotalNum: 310200,
    recaudado: '$310.200',
    horaVisita: '08:10',
    facturasCount: 1
  },
  {
    id: 'buen-precio',
    nombre: 'El Buen Precio',
    estado: 'visitado',
    saldoTotal: '$520.000',
    saldoTotalNum: 520000,
    recaudado: '$520.000',
    horaVisita: '07:50',
    facturasCount: 2
  },
  {
    id: 'cigarreria-central',
    nombre: 'Cigarrería Central',
    estado: 'visitado',
    saldoTotal: '$240.000',
    saldoTotalNum: 240000,
    recaudado: '$240.000',
    horaVisita: '07:30',
    facturasCount: 1
  },
  {
    id: 'panaderia-esperanza',
    nombre: 'Panadería La Esperanza',
    estado: 'visitado',
    saldoTotal: '$380.000',
    saldoTotalNum: 380000,
    recaudado: '$380.000',
    horaVisita: '07:15',
    facturasCount: 2
  },
  {
    id: 'minimarket-sol',
    nombre: 'Minimarket El Sol',
    estado: 'visitado',
    saldoTotal: '$190.500',
    saldoTotalNum: 190500,
    recaudado: '$190.500',
    horaVisita: '07:00',
    facturasCount: 1
  },
  {
    id: 'frutas-verduras',
    nombre: 'Frutas y Verduras JJ',
    estado: 'visitado',
    saldoTotal: '$415.000',
    saldoTotalNum: 415000,
    recaudado: '$415.000',
    horaVisita: '06:45',
    facturasCount: 3
  },
  {
    id: 'granero-paisa',
    nombre: 'Granero El Paisa',
    estado: 'visitado',
    saldoTotal: '$530.000',
    saldoTotalNum: 530000,
    recaudado: '$530.000',
    horaVisita: '06:30',
    facturasCount: 2
  }
];

const INITIAL_PREFACTURAS: Record<string, PrefacturaCliente[]> = {
  frescura: [
    {
      id: 'pre-frescura-1',
      numeroPrefactura: '9868499',
      saldoTotal: '$177.200',
      saldoTotalNum: 177200,
      empresa: 'Alpina Productos Alimenticios S.A.',
      pagador: 'Tiendas Frescura',
      medioPago: 'Transferencia Bre-B',
      fechaHora: '13 Ago 2026 16:30',
      refPago: 'IJH9947583'
    },
    {
      id: 'pre-frescura-2',
      numeroPrefactura: '9868498',
      saldoTotal: '$267.500',
      saldoTotalNum: 267500,
      empresa: 'Alpina Productos Alimenticios S.A.',
      pagador: 'Tiendas Frescura',
      medioPago: 'Transferencia Bre-B',
      fechaHora: '13 Ago 2026 16:30',
      refPago: 'IJH9947584'
    },
    {
      id: 'pre-frescura-3',
      numeroPrefactura: '9868497',
      saldoTotal: '$345.200',
      saldoTotalNum: 345200,
      empresa: 'Alpina Productos Alimenticios S.A.',
      pagador: 'Tiendas Frescura',
      medioPago: 'Transferencia Bre-B',
      fechaHora: '13 Ago 2026 16:30',
      refPago: 'IJH9947585'
    }
  ]
};

export const transportistaService = {
  getTiendasRuta(): TiendaRuta[] {
    try {
      const data = localStorage.getItem(STORAGE_RUTAS_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return INITIAL_TIENDAS;
  },

  getTiendaById(id: string): TiendaRuta | undefined {
    const tiendas = this.getTiendasRuta();
    return tiendas.find((t) => t.id === id);
  },

  getPrefacturasByTienda(tiendaId: string): PrefacturaCliente[] {
    try {
      const data = localStorage.getItem(STORAGE_PREFACTURAS_KEY);
      if (data) {
        const stored = JSON.parse(data);
        if (stored[tiendaId]) return stored[tiendaId];
      }
    } catch {
      // fallback
    }

    if (INITIAL_PREFACTURAS[tiendaId]) {
      return INITIAL_PREFACTURAS[tiendaId];
    }

    // Si es otra tienda, generamos prefacturas coherentes
    const tienda = this.getTiendaById(tiendaId);
    const nombreTienda = tienda ? tienda.nombre : 'Tienda Asociada';
    return [
      {
        id: `pre-${tiendaId}-1`,
        numeroPrefactura: '9868497',
        saldoTotal: tienda ? tienda.saldoTotal : '$160.975',
        saldoTotalNum: tienda ? tienda.saldoTotalNum : 160975,
        empresa: 'Alpina Productos Alimenticios S.A.',
        pagador: nombreTienda,
        medioPago: 'Transferencia Bre-B',
        fechaHora: obtenerFechaHoraActual(),
        refPago: 'IJH9947583'
      }
    ];
  },

  getPrefacturaById(tiendaId: string, prefacturaIdOrNum: string): PrefacturaCliente | undefined {
    const lista = this.getPrefacturasByTienda(tiendaId);
    return lista.find(
      (p) => p.id === prefacturaIdOrNum || p.numeroPrefactura === prefacturaIdOrNum
    );
  },

  // Registrar pago completado de prefactura
  registrarPagoPrefactura(tiendaId: string, _prefacturaNumero: string, valorPagado: string): void {
    try {
      const { horaFormateada } = obtenerPartesColombia(new Date());
      const tiendas = this.getTiendasRuta();
      const updated = tiendas.map((t) => {
        if (t.id === tiendaId) {
          return {
            ...t,
            estado: 'visitado' as const,
            horaVisita: horaFormateada,
            recaudado: valorPagado
          };
        }
        return t;
      });
      localStorage.setItem(STORAGE_RUTAS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('[transportistaService] Error al registrar pago:', e);
    }
  },

  // Obtener total a recaudar hoy
  getTotalARecaudarHoy(): { formateado: string; totalNum: number } {
    const tiendas = this.getTiendasRuta();
    // Suma de todas las tiendas de la ruta
    const totalNum = tiendas.reduce((acc, t) => acc + t.saldoTotalNum, 0);
    return {
      totalNum,
      formateado: `$${totalNum.toLocaleString('es-CO')}`
    };
  }
};
