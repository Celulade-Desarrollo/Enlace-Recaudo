import { obtenerFechaHoraActual, obtenerPartesColombia } from '../types/transaccion';
import type { ProductoFactura } from '../types/producto';
import { prepararPrefactura, totalProductos, formatearPesos } from './productosService';

export interface FacturaResumenItem {
  numero: string;
  saldo: string;
  saldoNum: number;
  estado: 'cobrada' | 'pendiente';
}

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
  metodoPago?: 'QR Bre-B' | 'Efectivo' | 'Mixto' | 'Dos QR Bre-B' | string;
  montoEfectivo?: number;
  montoDigital?: number;
  facturasDetalle?: FacturaResumenItem[];
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
  productos?: ProductoFactura[];
  productosOriginales?: ProductoFactura[];
  valorOriginalNum?: number;
  esFacturaModificada?: boolean;
}

export type FacturaCliente = PrefacturaCliente;

export interface CierreRutaInfo {
  id: string;
  fechaHora: string;
  totalRecaudado: number;
  totalEfectivo: number;
  totalDigital: number;
  totalPendiente: number;
  totalAsignado: number;
  tiendasVisitadas: number;
  tiendasPendientes: number;
  totalTiendas: number;
  facturasCobradas: number;
  facturasPendientes: number;
  facturasTotal: number;
  transportista: string;
  placaVehiculo: string;
  observaciones?: string;
  cerrada: boolean;
}

export interface ResumenRutaDetallado {
  tiendas: TiendaRuta[];
  totalAsignado: number;
  totalRecaudado: number;
  totalEfectivo: number;
  totalDigital: number;
  totalPendiente: number;
  porcentajeRecaudado: number;
  porcentajeVisitadas: number;
  tiendasVisitadas: number;
  tiendasPendientes: number;
  totalTiendas: number;
  facturasCobradas: number;
  facturasPendientes: number;
  facturasTotal: number;
  cierre: CierreRutaInfo | null;
}

const STORAGE_RUTAS_KEY = 'enlace_transportista_rutas';
const STORAGE_PREFACTURAS_KEY = 'enlace_transportista_prefacturas';
const STORAGE_CIERRE_KEY = 'enlace_transportista_cierre_ruta';

const INITIAL_TIENDAS: TiendaRuta[] = [
  // Pendientes (6)
  {
    id: 'frescura',
    nombre: 'Tiendas Frescura',
    direccion: 'Carrera 45 # 68-20, Manrique',
    telefono: '310 445 8821',
    estado: 'pendiente',
    saldoTotal: '$789.900',
    saldoTotalNum: 789900,
    facturasCount: 3,
    facturasDetalle: [
      { numero: '9868499', saldo: '$177.200', saldoNum: 177200, estado: 'pendiente' },
      { numero: '9868498', saldo: '$267.500', saldoNum: 267500, estado: 'pendiente' },
      { numero: '9868497', saldo: '$345.200', saldoNum: 345200, estado: 'pendiente' }
    ]
  },
  {
    id: 'comestibles',
    nombre: 'Comestibles La F...',
    direccion: 'Calle 52 # 14-30, Boston',
    telefono: '314 556 1290',
    estado: 'pendiente',
    saldoTotal: '$340.150',
    saldoTotalNum: 340150,
    facturasCount: 2,
    facturasDetalle: [
      { numero: '9868496', saldo: '$180.000', saldoNum: 180000, estado: 'pendiente' },
      { numero: '9868495', saldo: '$160.150', saldoNum: 160150, estado: 'pendiente' }
    ]
  },
  {
    id: 'delicias',
    nombre: 'Mercado Delicias',
    direccion: 'Avenida 68 # 22-10, Castilla',
    telefono: '320 889 4432',
    estado: 'pendiente',
    saldoTotal: '$215.300',
    saldoTotalNum: 215300,
    facturasCount: 1,
    facturasDetalle: [
      { numero: '9868494', saldo: '$215.300', saldoNum: 215300, estado: 'pendiente' }
    ]
  },
  {
    id: 'sanjuan',
    nombre: 'Distribuidora San Juan',
    direccion: 'Carrera 70 # 45-12, San Juan',
    telefono: '311 223 9988',
    estado: 'pendiente',
    saldoTotal: '$1.150.000',
    saldoTotalNum: 1150000,
    facturasCount: 4,
    facturasDetalle: [
      { numero: '9868493', saldo: '$350.000', saldoNum: 350000, estado: 'pendiente' },
      { numero: '9868492', saldo: '$300.000', saldoNum: 300000, estado: 'pendiente' },
      { numero: '9868491', saldo: '$250.000', saldoNum: 250000, estado: 'pendiente' },
      { numero: '9868490', saldo: '$250.000', saldoNum: 250000, estado: 'pendiente' }
    ]
  },
  {
    id: 'trebol',
    nombre: 'Autoservicio El Trébol',
    direccion: 'Calle 33 # 80-04, Laureles',
    telefono: '318 667 3344',
    estado: 'pendiente',
    saldoTotal: '$820.000',
    saldoTotalNum: 820000,
    facturasCount: 3,
    facturasDetalle: [
      { numero: '9868489', saldo: '$320.000', saldoNum: 320000, estado: 'pendiente' },
      { numero: '9868488', saldo: '$280.000', saldoNum: 280000, estado: 'pendiente' },
      { numero: '9868487', saldo: '$220.000', saldoNum: 220000, estado: 'pendiente' }
    ]
  },
  {
    id: 'la80',
    nombre: 'Minimarket La 80',
    direccion: 'Carrera 80 # 40-19, Belén',
    telefono: '315 778 5566',
    estado: 'pendiente',
    saldoTotal: '$3.257.895',
    saldoTotalNum: 3257895,
    facturasCount: 5,
    facturasDetalle: [
      { numero: '9868486', saldo: '$750.000', saldoNum: 750000, estado: 'pendiente' },
      { numero: '9868485', saldo: '$650.000', saldoNum: 650000, estado: 'pendiente' },
      { numero: '9868484', saldo: '$620.000', saldoNum: 620000, estado: 'pendiente' },
      { numero: '9868483', saldo: '$600.000', saldoNum: 600000, estado: 'pendiente' },
      { numero: '9868482', saldo: '$637.895', saldoNum: 637895, estado: 'pendiente' }
    ]
  },

  // Visitados (10)
  {
    id: 'vecino',
    nombre: 'Tienda El Vecino',
    direccion: 'Calle 10 # 43A-25, El Poblado',
    telefono: '312 456 7890',
    estado: 'visitado',
    saldoTotal: '$1.250.300',
    saldoTotalNum: 1250300,
    recaudado: '$1.250.300',
    horaVisita: '10:00',
    facturasCount: 2,
    metodoPago: 'QR Bre-B',
    montoDigital: 1250300,
    montoEfectivo: 0,
    facturasDetalle: [
      { numero: '9868481', saldo: '$650.000', saldoNum: 650000, estado: 'cobrada' },
      { numero: '9868480', saldo: '$600.300', saldoNum: 600300, estado: 'cobrada' }
    ]
  },
  {
    id: 'economia',
    nombre: 'Abarrotes La Eco...',
    direccion: 'Carrera 50 # 52-18, Prado Centro',
    telefono: '300 234 5678',
    estado: 'visitado',
    saldoTotal: '$450.000',
    saldoTotalNum: 450000,
    recaudado: '$450.000',
    horaVisita: '09:15',
    facturasCount: 1,
    metodoPago: 'Efectivo',
    montoDigital: 0,
    montoEfectivo: 450000,
    facturasDetalle: [
      { numero: '9868479', saldo: '$450.000', saldoNum: 450000, estado: 'cobrada' }
    ]
  },
  {
    id: 'super-barrio',
    nombre: 'Supermercado Mi...',
    direccion: 'Calle 44 # 65-10, Laureles',
    telefono: '315 987 6543',
    estado: 'visitado',
    saldoTotal: '$600.000',
    saldoTotalNum: 600000,
    recaudado: '$600.000',
    horaVisita: '08:35',
    facturasCount: 2,
    metodoPago: 'QR Bre-B',
    montoDigital: 600000,
    montoEfectivo: 0,
    facturasDetalle: [
      { numero: '9868478', saldo: '$350.000', saldoNum: 350000, estado: 'cobrada' },
      { numero: '9868477', saldo: '$250.000', saldoNum: 250000, estado: 'cobrada' }
    ]
  },
  {
    id: 'variedades-rosa',
    nombre: 'Variedades Doña Rosa',
    direccion: 'Carrera 76 # 32-05, Belén',
    telefono: '311 876 5432',
    estado: 'visitado',
    saldoTotal: '$310.200',
    saldoTotalNum: 310200,
    recaudado: '$310.200',
    horaVisita: '08:10',
    facturasCount: 1,
    metodoPago: 'Efectivo',
    montoDigital: 0,
    montoEfectivo: 310200,
    facturasDetalle: [
      { numero: '9868476', saldo: '$310.200', saldoNum: 310200, estado: 'cobrada' }
    ]
  },
  {
    id: 'buen-precio',
    nombre: 'El Buen Precio',
    direccion: 'Calle 65 # 48-12, Manrique',
    telefono: '314 345 6789',
    estado: 'visitado',
    saldoTotal: '$520.000',
    saldoTotalNum: 520000,
    recaudado: '$520.000',
    horaVisita: '07:50',
    facturasCount: 2,
    metodoPago: 'Mixto',
    montoDigital: 300000,
    montoEfectivo: 220000,
    facturasDetalle: [
      { numero: '9868475', saldo: '$300.000', saldoNum: 300000, estado: 'cobrada' },
      { numero: '9868474', saldo: '$220.000', saldoNum: 220000, estado: 'cobrada' }
    ]
  },
  {
    id: 'cigarreria-central',
    nombre: 'Cigarrería Central',
    direccion: 'Carrera 46 # 54-30, Centro',
    telefono: '310 123 4567',
    estado: 'visitado',
    saldoTotal: '$240.000',
    saldoTotalNum: 240000,
    recaudado: '$240.000',
    horaVisita: '07:30',
    facturasCount: 1,
    metodoPago: 'Efectivo',
    montoDigital: 0,
    montoEfectivo: 240000,
    facturasDetalle: [
      { numero: '9868473', saldo: '$240.000', saldoNum: 240000, estado: 'cobrada' }
    ]
  },
  {
    id: 'panaderia-esperanza',
    nombre: 'Panadería La Esperanza',
    direccion: 'Calle 30 # 70-15, Rosales',
    telefono: '316 234 5678',
    estado: 'visitado',
    saldoTotal: '$380.000',
    saldoTotalNum: 380000,
    recaudado: '$380.000',
    horaVisita: '07:15',
    facturasCount: 2,
    metodoPago: 'QR Bre-B',
    montoDigital: 380000,
    montoEfectivo: 0,
    facturasDetalle: [
      { numero: '9868472', saldo: '$200.000', saldoNum: 200000, estado: 'cobrada' },
      { numero: '9868471', saldo: '$180.000', saldoNum: 180000, estado: 'cobrada' }
    ]
  },
  {
    id: 'minimarket-sol',
    nombre: 'Minimarket El Sol',
    direccion: 'Carrera 82 # 35-40, La Castellana',
    telefono: '318 345 6789',
    estado: 'visitado',
    saldoTotal: '$190.500',
    saldoTotalNum: 190500,
    recaudado: '$190.500',
    horaVisita: '07:00',
    facturasCount: 1,
    metodoPago: 'Efectivo',
    montoDigital: 0,
    montoEfectivo: 190500,
    facturasDetalle: [
      { numero: '9868470', saldo: '$190.500', saldoNum: 190500, estado: 'cobrada' }
    ]
  },
  {
    id: 'frutas-verduras',
    nombre: 'Frutas y Verduras JJ',
    direccion: 'Calle 53 # 73-22, Los Colores',
    telefono: '317 456 7890',
    estado: 'visitado',
    saldoTotal: '$415.000',
    saldoTotalNum: 415000,
    recaudado: '$415.000',
    horaVisita: '06:45',
    facturasCount: 3,
    metodoPago: 'QR Bre-B',
    montoDigital: 415000,
    montoEfectivo: 0,
    facturasDetalle: [
      { numero: '9868469', saldo: '$215.000', saldoNum: 215000, estado: 'cobrada' },
      { numero: '9868468', saldo: '$100.000', saldoNum: 100000, estado: 'cobrada' },
      { numero: '9868467', saldo: '$100.000', saldoNum: 100000, estado: 'cobrada' }
    ]
  },
  {
    id: 'granero-paisa',
    nombre: 'Granero El Paisa',
    direccion: 'Carrera 65 # 48-50, Suramericana',
    telefono: '313 567 8901',
    estado: 'visitado',
    saldoTotal: '$530.000',
    saldoTotalNum: 530000,
    recaudado: '$530.000',
    horaVisita: '06:30',
    facturasCount: 2,
    metodoPago: 'Efectivo',
    montoDigital: 0,
    montoEfectivo: 530000,
    facturasDetalle: [
      { numero: '9868466', saldo: '$330.000', saldoNum: 330000, estado: 'cobrada' },
      { numero: '9868465', saldo: '$200.000', saldoNum: 200000, estado: 'cobrada' }
    ]
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

export interface DetallePagoRegistro {
  tipo: 'digital_completo' | 'dos_qr' | 'parcial' | 'efectivo';
  montoDigital?: number;
  montoEfectivo?: number;
}

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
        if (stored[tiendaId]) return stored[tiendaId].map(prepararPrefactura);
      }
    } catch {
      // fallback
    }

    if (INITIAL_PREFACTURAS[tiendaId]) {
      return INITIAL_PREFACTURAS[tiendaId].map(prepararPrefactura);
    }

    // Si es otra tienda, generamos facturas coherentes
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
    ].map(prepararPrefactura);
  },

  // Alias semántico para evitar el término "prefactura"
  getFacturasByTienda(tiendaId: string): FacturaCliente[] {
    return this.getPrefacturasByTienda(tiendaId);
  },

  guardarPrefactura(tiendaId: string, prefactura: PrefacturaCliente): void {
    const anteriores = this.getPrefacturasByTienda(tiendaId);
    const anterior = anteriores.find((item) => item.id === prefactura.id);
    if (!anterior) throw new Error('No se encontró la factura seleccionada.');
    if (!Number.isSafeInteger(prefactura.saldoTotalNum) || prefactura.saldoTotalNum <= 0 || (prefactura.productos?.length
      && totalProductos(prefactura.productos) !== prefactura.saldoTotalNum)) {
      throw new Error('Revisa los productos y el total de la factura.');
    }

    let guardadas: Record<string, PrefacturaCliente[]> = {};
    const raw = localStorage.getItem(STORAGE_PREFACTURAS_KEY);
    if (raw) {
      try { guardadas = JSON.parse(raw); } catch { /* Recuperar catálogo local dañado. */ }
    }
    const nuevas = anteriores.map((item) => item.id === prefactura.id ? prefactura : item);

    const rutas = this.getTiendasRuta().map((tienda) => {
      if (tienda.id !== tiendaId) return tienda;
      const total = tienda.saldoTotalNum - anterior.saldoTotalNum + prefactura.saldoTotalNum;
      return { ...tienda, saldoTotalNum: total, saldoTotal: formatearPesos(total) };
    });

    const rutasPrevias = localStorage.getItem(STORAGE_RUTAS_KEY);
    try {
      localStorage.setItem(STORAGE_RUTAS_KEY, JSON.stringify(rutas));
      localStorage.setItem(STORAGE_PREFACTURAS_KEY, JSON.stringify({ ...guardadas, [tiendaId]: nuevas }));
    } catch (error) {
      if (rutasPrevias === null) localStorage.removeItem(STORAGE_RUTAS_KEY);
      else localStorage.setItem(STORAGE_RUTAS_KEY, rutasPrevias);
      throw error;
    }
  },

  // Alias semántico
  guardarFactura(tiendaId: string, factura: FacturaCliente): void {
    this.guardarPrefactura(tiendaId, factura);
  },

  getPrefacturaById(tiendaId: string, prefacturaIdOrNum: string): PrefacturaCliente | undefined {
    const lista = this.getPrefacturasByTienda(tiendaId);
    return lista.find(
      (p) => p.id === prefacturaIdOrNum || p.numeroPrefactura === prefacturaIdOrNum
    );
  },

  // Alias semántico
  getFacturaById(tiendaId: string, facturaIdOrNum: string): FacturaCliente | undefined {
    return this.getPrefacturaById(tiendaId, facturaIdOrNum);
  },

  // Registrar pago completado de factura (mantiene firma para retrocompatibilidad de tests)
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

  // Registrar pago con desglose detallado (efectivo, digital, dos QR, etc.)
  registrarPagoFacturaDetallado(
    tiendaId: string,
    facturaNumero: string,
    valorPagado: string,
    detalles?: DetallePagoRegistro
  ): void {
    try {
      const { horaFormateada } = obtenerPartesColombia(new Date());
      const tiendas = this.getTiendasRuta();
      const updated = tiendas.map((t) => {
        if (t.id !== tiendaId) return t;

        let metodo: 'QR Bre-B' | 'Efectivo' | 'Mixto' | 'Dos QR Bre-B' = 'QR Bre-B';
        let montoEfectivo = 0;
        let montoDigital = t.saldoTotalNum;

        if (detalles) {
          if (detalles.tipo === 'efectivo') {
            metodo = 'Efectivo';
            montoEfectivo = detalles.montoEfectivo ?? t.saldoTotalNum;
            montoDigital = 0;
          } else if (detalles.tipo === 'parcial') {
            metodo = 'Mixto';
            montoDigital = detalles.montoDigital ?? 0;
            montoEfectivo = detalles.montoEfectivo ?? 0;
          } else if (detalles.tipo === 'dos_qr') {
            metodo = 'Dos QR Bre-B';
            montoDigital = t.saldoTotalNum;
            montoEfectivo = 0;
          } else {
            metodo = 'QR Bre-B';
            montoDigital = t.saldoTotalNum;
            montoEfectivo = 0;
          }
        }

        // Marcar la factura específica como cobrada en el detalle de la tienda
        const facturasActualizadas = t.facturasDetalle?.map((f) =>
          f.numero === facturaNumero ? { ...f, estado: 'cobrada' as const } : f
        ) ?? [
          {
            numero: facturaNumero,
            saldo: valorPagado,
            saldoNum: t.saldoTotalNum,
            estado: 'cobrada' as const
          }
        ];

        return {
          ...t,
          estado: 'visitado' as const,
          horaVisita: horaFormateada,
          recaudado: valorPagado,
          metodoPago: metodo,
          montoEfectivo,
          montoDigital,
          facturasDetalle: facturasActualizadas
        };
      });
      localStorage.setItem(STORAGE_RUTAS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('[transportistaService] Error al registrar pago detallado:', e);
    }
  },

  // Obtener total a recaudar hoy
  getTotalARecaudarHoy(): { formateado: string; totalNum: number } {
    const tiendas = this.getTiendasRuta();
    const totalNum = tiendas.reduce((acc, t) => acc + t.saldoTotalNum, 0);
    return {
      totalNum,
      formateado: `$${totalNum.toLocaleString('es-CO')}`
    };
  },

  // Obtener información de cierre de ruta si ya fue realizada
  getCierreRuta(): CierreRutaInfo | null {
    try {
      const data = localStorage.getItem(STORAGE_CIERRE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch {
      // fallback
    }
    return null;
  },

  // Guardar o realizar el cierre de la jornada
  realizarCierreRuta(observaciones?: string): CierreRutaInfo {
    const resumen = this.getResumenRutaDetallado();
    const partes = obtenerPartesColombia(new Date());
    const fechaHora = `${partes.dia} ${partes.mesTexto} ${partes.anio} ${partes.horaFormateada}`;
    const idCierre = `CRD-${partes.anio}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(partes.dia).padStart(2, '0')}-001`;

    const cierreInfo: CierreRutaInfo = {
      id: idCierre,
      fechaHora,
      totalRecaudado: resumen.totalRecaudado,
      totalEfectivo: resumen.totalEfectivo,
      totalDigital: resumen.totalDigital,
      totalPendiente: resumen.totalPendiente,
      totalAsignado: resumen.totalAsignado,
      tiendasVisitadas: resumen.tiendasVisitadas,
      tiendasPendientes: resumen.tiendasPendientes,
      totalTiendas: resumen.totalTiendas,
      facturasCobradas: resumen.facturasCobradas,
      facturasPendientes: resumen.facturasPendientes,
      facturasTotal: resumen.facturasTotal,
      transportista: 'Leonardo Moreno',
      placaVehiculo: 'TSK-892',
      observaciones: observaciones || 'Cierre de jornada completado con éxito.',
      cerrada: true
    };

    localStorage.setItem(STORAGE_CIERRE_KEY, JSON.stringify(cierreInfo));
    return cierreInfo;
  },

  // Reabrir ruta (para fines de demo o modificaciones)
  reabrirRuta(): void {
    localStorage.removeItem(STORAGE_CIERRE_KEY);
  },

  // Obtener resumen completo y detallado de todas las rutas y paradas
  getResumenRutaDetallado(): ResumenRutaDetallado {
    const tiendas = this.getTiendasRuta();
    const visitadas = tiendas.filter((t) => t.estado === 'visitado');
    const pendientes = tiendas.filter((t) => t.estado === 'pendiente');

    const totalAsignado = tiendas.reduce((acc, t) => acc + t.saldoTotalNum, 0);
    const totalRecaudado = visitadas.reduce((acc, t) => {
      if (t.recaudado) {
        const val = parseInt(t.recaudado.replace(/\D/g, '') || '0', 10);
        return acc + (val > 0 ? val : t.saldoTotalNum);
      }
      return acc + t.saldoTotalNum;
    }, 0);
    const totalPendiente = pendientes.reduce((acc, t) => acc + t.saldoTotalNum, 0);

    const totalEfectivo = visitadas.reduce((acc, t) => acc + (t.montoEfectivo ?? 0), 0);
    const totalDigital = visitadas.reduce((acc, t) => {
      if (t.montoDigital !== undefined) return acc + t.montoDigital;
      const ef = t.montoEfectivo ?? 0;
      return acc + Math.max(0, t.saldoTotalNum - ef);
    }, 0);

    const facturasTotal = tiendas.reduce((acc, t) => acc + (t.facturasDetalle?.length ?? t.facturasCount), 0);
    const facturasCobradas = visitadas.reduce((acc, t) => acc + (t.facturasDetalle?.length ?? t.facturasCount), 0);
    const facturasPendientes = facturasTotal - facturasCobradas;

    const porcentajeRecaudado = totalAsignado > 0 ? Math.round((totalRecaudado / totalAsignado) * 100) : 0;
    const porcentajeVisitadas = tiendas.length > 0 ? Math.round((visitadas.length / tiendas.length) * 100) : 0;

    const cierre = this.getCierreRuta();

    return {
      tiendas,
      totalAsignado,
      totalRecaudado,
      totalEfectivo,
      totalDigital,
      totalPendiente,
      porcentajeRecaudado,
      porcentajeVisitadas,
      tiendasVisitadas: visitadas.length,
      tiendasPendientes: pendientes.length,
      totalTiendas: tiendas.length,
      facturasCobradas,
      facturasPendientes,
      facturasTotal,
      cierre
    };
  }
};
