import { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { MobileStatusBar } from '../../components/atoms/MobileStatusBar/MobileStatusBar';
import { MobileHomeBar } from '../../components/atoms/MobileHomeBar/MobileHomeBar';
import { Icon } from '../../components/atoms/Icon/Icon';
import { ModalOpcionPago } from '../../components/molecules/ModalOpcionPago/ModalOpcionPago';
import { ModalEditarProducto } from '../../components/molecules/ModalEditarProducto/ModalEditarProducto';
import type { PrefacturaCliente } from '../../services/transportistaService';
import type { ProductoFactura } from '../../types/producto';
import { actualizarProductos, formatearPesos, subtotalProducto } from '../../services/productosService';
import './generarFactura.css';

interface GenerarFacturaScreenProps {
  prefactura: PrefacturaCliente;
  onBack: () => void;
  onPrefacturaChange: (prefactura: PrefacturaCliente) => void;
  onGuardarFactura: (prefactura: PrefacturaCliente) => void;
  onPagoCompletoDigital: () => void;
  onPagoDosQr: (montoQr1: number, montoQr2: number) => void;
  onPagoParcial: (montoDigital: number, restanteEfectivo: number) => void;
  onPagoEfectivo: () => void;
  className?: string;
}

export function GenerarFacturaScreen({
  prefactura, onBack, onPrefacturaChange, onGuardarFactura,
  onPagoCompletoDigital, onPagoDosQr, onPagoParcial, onPagoEfectivo, className = ''
}: GenerarFacturaScreenProps) {
  const [isModalOpcionesOpen, setIsModalOpcionesOpen] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState<ProductoFactura | null>(null);
  const [eliminado, setEliminado] = useState<{ producto: ProductoFactura; index: number } | null>(null);
  const [error, setError] = useState('');
  const productos = prefactura.productos ?? [];
  const tieneDetalle = (prefactura.productosOriginales?.length ?? 0) > 0;
  const puedeGenerar = prefactura.saldoTotalNum > 0 && (!tieneDetalle || productos.length > 0);
  const valorOriginal = prefactura.valorOriginalNum;
  const mostrarComparacion = prefactura.esFacturaModificada && valorOriginal !== undefined;

  const cambiarProductos = (nuevos: ProductoFactura[]) => {
    onPrefacturaChange(actualizarProductos(prefactura, nuevos));
    setError('');
  };
  const cambiarCantidad = (cantidad: number) => {
    if (!productoEnEdicion) return;
    cambiarProductos(productos.map((producto) => producto.id === productoEnEdicion.id ? { ...producto, cantidad } : producto));
  };
  const cancelarEdicion = () => {
    if (productoEnEdicion) {
      cambiarProductos(productos.map((producto) => producto.id === productoEnEdicion.id ? productoEnEdicion : producto));
    }
    setProductoEnEdicion(null);
  };
  const eliminarProducto = () => {
    if (!productoEnEdicion) return;
    const index = productos.findIndex((producto) => producto.id === productoEnEdicion.id);
    setEliminado({ producto: productos[index], index });
    cambiarProductos(productos.filter((producto) => producto.id !== productoEnEdicion.id));
    setProductoEnEdicion(null);
  };
  const deshacerEliminacion = () => {
    if (!eliminado) return;
    const restaurados = [...productos];
    restaurados.splice(eliminado.index, 0, eliminado.producto);
    cambiarProductos(restaurados);
    setEliminado(null);
  };
  const generarFactura = () => {
    if (!puedeGenerar) return;
    try {
      onGuardarFactura(prefactura);
      setError('');
      setIsModalOpcionesOpen(true);
    } catch {
      setError('No se pudieron guardar los cambios. Intenta generar la factura de nuevo.');
    }
  };

  return (
    <div className={`prefactura-screen ${className}`}>
      <header className="prefactura-header">
        <MobileStatusBar theme="light" time="9:30" />
        <div className="prefactura-header-titulo">
          <button type="button" className="prefactura-back" aria-label="Volver a facturas" onClick={onBack}><Icon name="arrow-left" size={20} /></button>
          <h1>Generar Factura</h1><span aria-hidden="true" />
        </div>
      </header>
      <main className="prefactura-detalle">
        <div className="prefactura-cliente">
          <span className="prefactura-tienda-icon" aria-hidden="true"><Icon name="building-store" size={25} /></span>
          <div><h2>{prefactura.pagador}</h2><p>No. Prefactura <span>{prefactura.numeroPrefactura}</span></p></div>
        </div>
        <div className="prefactura-seccion-titulo"><h2>Detalle de Prefactura</h2><p>Toca un producto para editar su cantidad.</p></div>
        <div className="prefactura-productos">
          {productos.map((producto) => (
            <button key={producto.id} type="button" className="prefactura-producto"
              aria-label={`Editar ${producto.nombre}, ${producto.cantidad} ${producto.cantidad === 1 ? 'unidad' : 'unidades'}`}
              onClick={() => { setProductoEnEdicion({ ...producto }); setEliminado(null); }}
            >
              <img src={producto.imagen} alt="" width="60" height="64" className="prefactura-producto-imagen" />
              <span className="prefactura-producto-info">
                <span className="prefactura-producto-nombre">{producto.nombre}</span>
                <span className="prefactura-producto-presentacion">{producto.presentacion} · Und. {formatearPesos(producto.precioUnitario)}</span>
              </span>
              <span className="prefactura-producto-importe"><span>x {producto.cantidad} und</span><strong>{formatearPesos(subtotalProducto(producto))}</strong></span>
            </button>
          ))}
          {productos.length === 0 && (
            <div className="prefactura-vacia"><Icon name="receipt" size={30} />
              <p>{tieneDetalle ? 'La factura no tiene productos.' : 'El detalle de productos aún no está disponible.'}</p>
              {tieneDetalle && <span>Deshaz la eliminación o cancela para volver a las facturas.</span>}
            </div>
          )}
        </div>
        {eliminado && <div className="prefactura-deshacer" role="status"><span>Producto eliminado</span><button type="button" onClick={deshacerEliminacion}>Deshacer</button></div>}
        <div className="prefactura-resumen" role="status" aria-live="polite" aria-atomic="true">
          {mostrarComparacion && (
            <div className="prefactura-valor-original"><span>Valor original</span><s>{formatearPesos(valorOriginal)}</s></div>
          )}
          <div className="prefactura-total"><span>{mostrarComparacion ? 'Valor editado' : 'Total'}</span><strong>{prefactura.saldoTotal}</strong></div>
        </div>
        <div className="prefactura-footer">
          {error && <p className="producto-error" role="alert">{error}</p>}
          <div className="prefactura-acciones">
            <button type="button" className="prefactura-button secundario" onClick={onBack}>Cancelar</button>
            <button id="generar-prefactura" type="button" className="prefactura-button primario" disabled={!puedeGenerar} onClick={generarFactura}>Generar Factura</button>
          </div>
        </div>
      </main>
      <MobileHomeBar theme="dark" />
      <AnimatePresence>
        {productoEnEdicion && <ModalEditarProducto key={productoEnEdicion.id} producto={productoEnEdicion}
          onCantidadChange={cambiarCantidad} onCancelar={cancelarEdicion}
          onGuardar={() => setProductoEnEdicion(null)} onEliminar={eliminarProducto} />}
      </AnimatePresence>
      <ModalOpcionPago isOpen={isModalOpcionesOpen} onClose={() => setIsModalOpcionesOpen(false)} prefactura={prefactura}
        onSelectPagoCompletoDigital={() => { setIsModalOpcionesOpen(false); onPagoCompletoDigital(); }}
        onSelectPagoDosQr={(monto1, monto2) => { setIsModalOpcionesOpen(false); onPagoDosQr(monto1, monto2); }}
        onSelectPagoParcial={(digital, efectivo) => { setIsModalOpcionesOpen(false); onPagoParcial(digital, efectivo); }}
        onSelectPagoEfectivo={() => { setIsModalOpcionesOpen(false); onPagoEfectivo(); }} />
    </div>
  );
}
