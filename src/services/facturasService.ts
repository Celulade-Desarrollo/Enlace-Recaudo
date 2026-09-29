import { obtenerFechaHoraActual } from '../types/transaccion';

export interface DetalleFactura {
  idFactura: string;
  valor: string;
  subtotal?: string;
  iva?: string;
  empresa: string;
  nitEmpresa?: string;
  pagador: string;
  nitPagador?: string;
  medioPago: string;
  fechaHora: string;
  estado: 'APROBADA' | 'PAGADA' | 'PENDIENTE' | 'RECHAZADA';
  referenciaPago: string;
  descripcion?: string;
}

// Catálogo mock inicial de facturas conocidas (Alpina, Nutresa, Postobón)
const FACTURAS_MOCK: Record<string, DetalleFactura> = {
  '9868497': {
    idFactura: '9868497',
    valor: '$125.632',
    subtotal: '$105.573',
    iva: '$20.059',
    empresa: 'Alpina Productos Alimenticios S.A.',
    nitEmpresa: 'NIT 860.025.900-1',
    pagador: 'Miscelanea Rin-Rin',
    nitPagador: 'CC 1.020.345.678',
    medioPago: 'Llave Bre-B (Bancolombia)',
    fechaHora: obtenerFechaHoraActual(),
    estado: 'APROBADA',
    referenciaPago: 'REF-ALP-9868497',
    descripcion: 'Pago de pedido de lácteos y derivados'
  },
  '9868498': {
    idFactura: '9868498',
    valor: '$110.789',
    subtotal: '$93.100',
    iva: '$17.689',
    empresa: 'Alpina Productos Alimenticios S.A.',
    nitEmpresa: 'NIT 860.025.900-1',
    pagador: 'Miscelanea Rin-Rin',
    nitPagador: 'CC 1.020.345.678',
    medioPago: 'Nequi',
    fechaHora: '13 Ago 2026 15:45',
    estado: 'APROBADA',
    referenciaPago: 'REF-ALP-9868498',
    descripcion: 'Surtido yogures y quesos'
  },
  '9868499': {
    idFactura: '9868499',
    valor: '$109.257',
    subtotal: '$91.812',
    iva: '$17.445',
    empresa: 'Alpina Productos Alimenticios S.A.',
    nitEmpresa: 'NIT 860.025.900-1',
    pagador: 'Miscelanea Rin-Rin',
    nitPagador: 'CC 1.020.345.678',
    medioPago: 'Llave Bre-B (Davivienda)',
    fechaHora: '13 Ago 2026 14:10',
    estado: 'APROBADA',
    referenciaPago: 'REF-ALP-9868499',
    descripcion: 'Pedido semanal lácteos'
  },
  '8721340': {
    idFactura: '8721340',
    valor: '$145.200',
    subtotal: '$122.016',
    iva: '$23.184',
    empresa: 'Grupo Nutresa S.A.',
    nitEmpresa: 'NIT 890.900.050-1',
    pagador: 'Miscelanea Rin-Rin',
    nitPagador: 'CC 1.020.345.678',
    medioPago: 'Llave Bre-B (Banco de Bogotá)',
    fechaHora: '13 Ago 2026 11:20',
    estado: 'APROBADA',
    referenciaPago: 'REF-NUT-8721340',
    descripcion: 'Galletas, chocolates y café'
  },
  '8721341': {
    idFactura: '8721341',
    valor: '$120.450',
    subtotal: '$101.218',
    iva: '$19.232',
    empresa: 'Grupo Nutresa S.A.',
    nitEmpresa: 'NIT 890.900.050-1',
    pagador: 'Miscelanea Rin-Rin',
    nitPagador: 'CC 1.020.345.678',
    medioPago: 'Nequi',
    fechaHora: '12 Ago 2026 17:35',
    estado: 'APROBADA',
    referenciaPago: 'REF-NUT-8721341',
    descripcion: 'Snacks y cárnicos'
  },
  '5432101': {
    idFactura: '5432101',
    valor: '$263.765',
    subtotal: '$221.651',
    iva: '$42.114',
    empresa: 'Postobón S.A.',
    nitEmpresa: 'NIT 890.903.939-5',
    pagador: 'Miscelanea Rin-Rin',
    nitPagador: 'CC 1.020.345.678',
    medioPago: 'Bolsillo Enlace',
    fechaHora: '11 Ago 2026 09:15',
    estado: 'APROBADA',
    referenciaPago: 'REF-POS-5432101',
    descripcion: 'Bebidas gaseosas y jugos'
  }
};

const STORAGE_KEY = 'enlace_facturas_historial';
const BACKEND_BASE_URL = (import.meta.env.VITE_BACKEND_URL as string) || 'https://enlace-crm.com:8081';
const USE_REAL_BACKEND = (import.meta.env.VITE_USE_REAL_BACKEND as string) === 'true';

/**
 * Servicio para consulta de facturas.
 * Conecta con el backend real cuando esté disponible o simula la respuesta localmente.
 */
export const facturasService = {
  /**
   * Consulta una factura por su ID (número de factura).
   * Si se proporcionan fallbackData (obtenidos de query params al escanear desde otro celular),
   * se utilizan directamente y se persisten localmente en el nuevo dispositivo.
   */
  async getFacturaById(id: string, fallbackData?: Partial<DetalleFactura> | null): Promise<DetalleFactura> {
    // Normalizar ID (remover 'id=' si viene en el string)
    const cleanId = id.replace(/^id=/, '').trim();

    // Si se activa el backend real mediante variable de entorno
    if (USE_REAL_BACKEND) {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/facturas/${cleanId}`);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: Factura no encontrada`);
        }
        const data: DetalleFactura = await response.json();
        return data;
      } catch (err) {
        console.warn('[facturasService] Backend real no disponible, usando simulación/query params:', err);
      }
    }

    // --- SIMULACIÓN LOCAL (SEMIAPI) ---
    // Simular latencia de red realista (350ms)
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Si se envía '404' o 'error', simular fallo para pruebas de UI
    if (cleanId === '404' || cleanId.toLowerCase() === 'error') {
      throw new Error(`No se encontró ninguna factura registrada con el ID #${cleanId}`);
    }

    // 1. PRIORIDAD: Si recibimos datos desde los Query Params (por ejemplo al escanear desde otro celular):
    if (fallbackData && fallbackData.valor && fallbackData.empresa) {
      const facturaDesdeParam: DetalleFactura = {
        idFactura: cleanId,
        valor: fallbackData.valor,
        subtotal: fallbackData.subtotal || '$0',
        iva: fallbackData.iva || '$0',
        empresa: fallbackData.empresa,
        nitEmpresa: fallbackData.nitEmpresa || (
          fallbackData.empresa.includes('Alpina')
            ? 'NIT 860.025.900-1'
            : fallbackData.empresa.includes('Nutresa')
            ? 'NIT 890.900.050-1'
            : 'NIT 890.903.939-5'
        ),
        pagador: fallbackData.pagador || 'Miscelanea Rin-Rin',
        nitPagador: fallbackData.nitPagador || 'CC 1.020.345.678',
        medioPago: fallbackData.medioPago || 'Llave Bre-B',
        fechaHora: fallbackData.fechaHora || new Date().toLocaleString('es-CO'),
        estado: 'APROBADA',
        referenciaPago: fallbackData.referenciaPago || `REF-${cleanId}`,
        descripcion: fallbackData.descripcion || 'Comprobante de recaudo digital'
      };

      // Guardar también en el almacenamiento local de este nuevo dispositivo para futuras consultas
      this.guardarFacturaLocal(facturaDesdeParam);
      return facturaDesdeParam;
    }

    // 2. Buscar primero en facturas pagadas recientemente en la sesión
    const historial = this.getHistorialLocal();
    const facturaLocal = historial.find((f) => f.idFactura === cleanId);
    if (facturaLocal) {
      if (
        !facturaLocal.fechaHora ||
        facturaLocal.fechaHora.includes('13 Ago 2026') ||
        facturaLocal.fechaHora.includes('13/8/2026') ||
        facturaLocal.fechaHora.includes('Ago 2026')
      ) {
        facturaLocal.fechaHora = obtenerFechaHoraActual();
      }
      return facturaLocal;
    }

    // 3. Buscar en catálogo mock predefinido
    if (FACTURAS_MOCK[cleanId]) {
      return {
        ...FACTURAS_MOCK[cleanId],
        fechaHora: obtenerFechaHoraActual()
      };
    }

    // 3. Fallback dinámico: Si consultan cualquier otro ID, generamos datos realistas
    return {
      idFactura: cleanId,
      valor: '$125.632',
      subtotal: '$105.573',
      iva: '$20.059',
      empresa: 'Alpina Productos Alimenticios S.A.',
      nitEmpresa: 'NIT 860.025.900-1',
      pagador: 'Miscelanea Rin-Rin',
      nitPagador: 'CC 1.020.345.678',
      medioPago: 'Llave Bre-B',
      fechaHora: obtenerFechaHoraActual(),
      estado: 'APROBADA',
      referenciaPago: `REF-${cleanId}`,
      descripcion: 'Comprobante de recaudo digital'
    };
  },

  /**
   * Guarda o actualiza una factura en el historial local (simulación de persistencia)
   */
  guardarFacturaLocal(factura: DetalleFactura): void {
    try {
      const historial = this.getHistorialLocal();
      const filtrado = historial.filter((f) => f.idFactura !== factura.idFactura);
      filtrado.unshift(factura);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrado.slice(0, 50)));
    } catch (e) {
      console.error('[facturasService] Error al guardar en localStorage', e);
    }
  },

  /**
   * Obtiene facturas registradas localmente
   */
  getHistorialLocal(): DetalleFactura[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Obtiene todos los movimientos y pagos realizados (combinando almacenamiento local y transacciones iniciales).
   */
  getMovimientosRealizados(): DetalleFactura[] {
    const historial = this.getHistorialLocal();
    const idsPresentes = new Set(historial.map((f) => f.idFactura));

    const iniciales: DetalleFactura[] = Object.values(FACTURAS_MOCK).map((mock) => ({
      ...mock,
      fechaHora: mock.fechaHora && !mock.fechaHora.includes('13 Ago 2026') && !mock.fechaHora.includes('Ago 2026')
        ? mock.fechaHora
        : obtenerFechaHoraActual()
    }));

    const resultado = [...historial];
    for (const item of iniciales) {
      if (!idsPresentes.has(item.idFactura)) {
        resultado.push(item);
        idsPresentes.add(item.idFactura);
      }
    }

    return resultado;
  }
};
