import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Icon } from '../../atoms/Icon/Icon';
import type { ProductoFactura } from '../../../types/producto';
import { formatearPesos } from '../../../services/productosService';

interface ModalEditarProductoProps {
  producto: ProductoFactura;
  onCantidadChange: (cantidad: number) => void;
  onCancelar: () => void;
  onGuardar: () => void;
  onEliminar: () => void;
}

export function ModalEditarProducto({
  producto, onCantidadChange, onCancelar, onGuardar, onEliminar
}: ModalEditarProductoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [cantidadInput, setCantidadInput] = useState(String(producto.cantidad));
  const reducirMovimiento = useReducedMotion();
  const cantidad = Number(cantidadInput);
  const esValida = cantidadInput.trim() !== '' && Number.isSafeInteger(cantidad)
    && cantidad >= 1 && cantidad <= 9999;
  const subtotal = esValida ? Math.round(cantidad * producto.precioUnitario) : 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    const activador = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    dialog?.showModal();
    inputRef.current?.focus({ preventScroll: true });
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = overflowAnterior;
      if (activador?.isConnected) activador.focus({ preventScroll: true });
      else document.getElementById('generar-prefactura')?.focus({ preventScroll: true });
    };
  }, []);

  const cambiarCantidad = (valor: string) => {
    setCantidadInput(valor);
    const nueva = Number(valor);
    if (valor.trim() && Number.isSafeInteger(nueva) && nueva >= 1 && nueva <= 9999) {
      onCantidadChange(nueva);
    }
  };

  return (
    <motion.dialog
      ref={dialogRef} className="editar-producto-sheet"
      aria-labelledby="editar-producto-titulo" aria-describedby="editar-producto-nombre"
      initial={reducirMovimiento ? { opacity: 0 } : { y: '100%', opacity: 1 }}
      animate={{ y: 0, opacity: 1 }}
      exit={reducirMovimiento ? { opacity: 0 } : { y: '100%', opacity: 1 }}
      transition={reducirMovimiento ? { duration: 0.12 } : { type: 'spring', bounce: 0, duration: 0.32 }}
      onCancel={(event) => { event.preventDefault(); onCancelar(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onCancelar(); }}
    >
      <div className="editar-producto-contenido">
        <div className="sheet-indicador" aria-hidden="true" />
        <div className="editar-producto-cabecera">
          <h2 id="editar-producto-titulo">Editar producto</h2>
          <button type="button" className="producto-icon-button" aria-label="Cerrar editor de producto" onClick={onCancelar}>
            <Icon name="x" size={21} />
          </button>
        </div>
        <div className="editar-producto-fila">
          <img src={producto.imagen} alt="" width="72" height="72" className="editar-producto-imagen" />
          <div className="editar-producto-datos">
            <div className="editar-producto-descripcion">
              <h3 id="editar-producto-nombre">{producto.nombre}</h3>
              <span>{formatearPesos(producto.precioUnitario)}</span>
            </div>
            <label htmlFor="cantidad-producto" className="sr-only">Cantidad de {producto.nombre}</label>
            <div className="editar-producto-controles">
              <button type="button" className="cantidad-button" aria-label="Aumentar cantidad"
                disabled={esValida && cantidad >= 9999}
                onClick={() => cambiarCantidad(String(Math.min(9999, (esValida ? cantidad : 0) + 1)))}
              ><Icon name="plus" size={21} /></button>
              <input ref={inputRef} id="cantidad-producto" type="text" inputMode="numeric" autoComplete="off"
                value={cantidadInput} autoFocus maxLength={4}
                aria-invalid={!esValida} aria-describedby={!esValida ? 'cantidad-error' : undefined}
                onChange={(event) => cambiarCantidad(event.target.value.replace(/\D/g, ''))}
                onFocus={(event) => event.target.select()}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && esValida) { event.preventDefault(); onGuardar(); }
                }}
              />
              <button type="button" className="cantidad-button" aria-label="Disminuir cantidad"
                disabled={!esValida || cantidad <= 1}
                onClick={() => cambiarCantidad(String(cantidad - 1))}
              ><Icon name="minus" size={21} /></button>
              <button type="button" className="producto-icon-button eliminar-producto" aria-label={`Eliminar ${producto.nombre}`} onClick={onEliminar}>
                <Icon name="trash" size={21} />
              </button>
            </div>
          </div>
        </div>
        {!esValida && <p id="cantidad-error" className="producto-error" role="alert">Ingresa una cantidad entre 1 y 9.999.</p>}
        <div className="editar-producto-subtotal" role="status" aria-live="polite" aria-atomic="true">
          <span>Subtotal</span><strong>{formatearPesos(subtotal)}</strong>
        </div>
        <div className="prefactura-acciones">
          <button type="button" className="prefactura-button secundario" onClick={onCancelar}>Cancelar</button>
          <button type="button" className="prefactura-button primario" disabled={!esValida} onClick={onGuardar}>Guardar cambios</button>
        </div>
      </div>
    </motion.dialog>
  );
}
