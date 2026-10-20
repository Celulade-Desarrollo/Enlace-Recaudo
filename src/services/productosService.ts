import type { ProductoFactura } from '../types/producto';
import type { PrefacturaCliente } from './transportistaService';

export const formatearPesos = (valor: number): string =>
  `$${valor.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

export const subtotalProducto = (producto: ProductoFactura): number =>
  Math.round(producto.precioUnitario * producto.cantidad);

export const totalProductos = (productos: ProductoFactura[]): number =>
  productos.reduce((total, producto) => total + subtotalProducto(producto), 0);

const CATALOGO_DEMO: Omit<ProductoFactura, 'cantidad'>[] = [
  {
    id: 'alpinito-multisabor', nombre: 'Alpinito Multisabor x12',
    presentacion: '45 g c/u', precioUnitario: 16225,
    imagen: '/productos/alpina/alpinito-multisabor.png'
  },
  {
    id: 'avena-original', nombre: 'Avena Alpina Original',
    presentacion: '280 g', precioUnitario: 5950,
    imagen: '/productos/alpina/avena-original.png'
  },
  {
    id: 'queso-sabana', nombre: 'Queso Sabana',
    presentacion: '7 tajadas · 91 g', precioUnitario: 10250,
    imagen: '/productos/alpina/queso-sabana.png'
  },
  {
    id: 'crema-de-leche', nombre: 'Crema de Leche Alpina',
    presentacion: '200 ml', precioUnitario: 4125,
    imagen: '/productos/alpina/crema-de-leche.png'
  }
];

// Detalles de demostración: conservan exactamente los saldos de las prefacturas
// existentes. Las fotos son oficiales; estos precios no provienen de Amovil.
const CANTIDADES_DEMO: Record<number, number[]> = {
  177200: [2, 15, 3, 6],
  267500: [4, 23, 4, 6],
  345200: [11, 18, 3, 7],
  340150: [7, 16, 10, 7],
  215300: [4, 17, 4, 2],
  1150000: [13, 96, 21, 37],
  820000: [7, 69, 18, 27],
  3257895: [38, 280, 58, 89]
};

const clonarProductos = (productos: ProductoFactura[]) => productos.map((producto) => ({ ...producto }));

export function prepararPrefactura(prefactura: PrefacturaCliente): PrefacturaCliente {
  const cantidades = CANTIDADES_DEMO[prefactura.saldoTotalNum];
  const productos = prefactura.productos ?? (cantidades
    ? CATALOGO_DEMO.map((producto, index) => ({
        ...producto,
        precioUnitario: prefactura.saldoTotalNum === 3257895 && producto.id === 'avena-original'
          ? 5999 : producto.precioUnitario,
        cantidad: cantidades[index]
      }))
    : []);

  return {
    ...prefactura,
    productos: clonarProductos(productos),
    productosOriginales: clonarProductos(prefactura.productosOriginales ?? productos),
    valorOriginalNum: prefactura.valorOriginalNum ?? prefactura.saldoTotalNum,
    esFacturaModificada: prefactura.esFacturaModificada ?? false
  };
}

export function actualizarProductos(
  prefactura: PrefacturaCliente,
  productos: ProductoFactura[]
): PrefacturaCliente {
  if (productos.some((producto) => !Number.isSafeInteger(producto.cantidad)
    || producto.cantidad < 1 || producto.cantidad > 9999
    || !Number.isFinite(producto.precioUnitario) || producto.precioUnitario < 0)) {
    throw new Error('La cantidad debe ser un entero entre 1 y 9999.');
  }

  const originales = prefactura.productosOriginales ?? prefactura.productos ?? [];
  const esFacturaModificada = productos.length !== originales.length || originales.some((original) => {
    const actual = productos.find((producto) => producto.id === original.id);
    return !actual || actual.cantidad !== original.cantidad || actual.precioUnitario !== original.precioUnitario;
  });
  const total = totalProductos(productos);

  return {
    ...prefactura,
    productos: clonarProductos(productos),
    saldoTotalNum: total,
    saldoTotal: formatearPesos(total),
    esFacturaModificada
  };
}
