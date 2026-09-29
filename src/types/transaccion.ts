export interface DatosTransaccion {
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
  referenciaPago?: string;
}

/**
 * Retorna las partes de fecha y hora calculadas explícitamente en la zona horaria de Colombia (America/Bogota, UTC-5).
 */
export function obtenerPartesColombia(date: Date = new Date()): {
  dia: string;
  mesNum: string;
  mesTexto: string;
  anio: string;
  hora12: string;
  minuto: string;
  ampm: string;
  fechaDDMMYYYY: string;
  horaFormateada: string;
} {
  const mesesAbrev = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';

  const dia = getPart('day');
  const mesNum = getPart('month');
  const anio = getPart('year');
  const hora12 = getPart('hour');
  const minuto = getPart('minute');
  const ampm = getPart('dayPeriod').toLowerCase(); // 'am' o 'pm'

  const mesIdx = Math.max(0, Math.min(11, parseInt(mesNum, 10) - 1));
  const mesTexto = mesesAbrev[mesIdx] || 'Sep';

  const fechaDDMMYYYY = `${dia}/${mesNum}/${anio}`;
  const horaFormateada = `${hora12}:${minuto}${ampm}`;

  return {
    dia,
    mesNum,
    mesTexto,
    anio,
    hora12,
    minuto,
    ampm,
    fechaDDMMYYYY,
    horaFormateada
  };
}

export function obtenerFechaHoraActual(): string {
  const { dia, mesTexto, anio, hora12, minuto, ampm } = obtenerPartesColombia(new Date());
  return `${dia} ${mesTexto} ${anio} ${hora12}:${minuto}${ampm}`;
}

export function getDefaultDatosTransaccion(): DatosTransaccion {
  return {
    idFactura: '9868497',
    valor: '$125.632',
    subtotal: '$105.573',
    iva: '$20.059',
    empresa: 'Alpina Productos Alimenticios S.A.',
    nitEmpresa: 'NIT 860.025.900-1',
    pagador: 'Miscelanea Rin-Rin',
    nitPagador: 'CC 1.020.345.678',
    medioPago: 'Llave Bre-B',
    referenciaPago: 'REF-ALP-9868497',
    get fechaHora() {
      return obtenerFechaHoraActual();
    }
  };
}

export const defaultDatosTransaccion: DatosTransaccion = {
  idFactura: '9868497',
  valor: '$125.632',
  subtotal: '$105.573',
  iva: '$20.059',
  empresa: 'Alpina Productos Alimenticios S.A.',
  nitEmpresa: 'NIT 860.025.900-1',
  pagador: 'Miscelanea Rin-Rin',
  nitPagador: 'CC 1.020.345.678',
  medioPago: 'Llave Bre-B',
  referenciaPago: 'REF-ALP-9868497',
  get fechaHora() {
    return obtenerFechaHoraActual();
  }
};