export interface DatosTransaccion {
  idFactura: string;
  valor: string;
  empresa: string;
  pagador: string;
  medioPago: string;
  fechaHora: string;
}

export const defaultDatosTransaccion: DatosTransaccion = {
  idFactura: '9868497',
  valor: '$125.632',
  empresa: 'Alpina Productos Alimenticios S.A.',
  pagador: 'Miscelanea Rin-Rin',
  medioPago: 'Llave Bre-B',
  fechaHora: '13 Ago 2026 16:30'
};