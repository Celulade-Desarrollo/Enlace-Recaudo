import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  type DatosTransaccion,
  getDefaultDatosTransaccion,
  obtenerPartesColombia
} from "../types/transaccion";
import { facturasService } from "../services/facturasService";
import "./transaccionAprob.css";

interface Props {
  datos?: DatosTransaccion;
  onRegresar?: () => void;
}

/**
 * Limpia y normaliza el número de teléfono para WhatsApp.
 * Si el usuario ingresa un número de 10 dígitos (ej: 321 456 7890), antepone '57'.
 */
function limpiarNumeroTelefono(num: string): string {
  const soloDigitos = num.replace(/\D/g, "");
  if (soloDigitos.length === 10 && soloDigitos.startsWith("3")) {
    return `57${soloDigitos}`;
  }
  if (soloDigitos.length === 12 && soloDigitos.startsWith("57")) {
    return soloDigitos;
  }
  return soloDigitos;
}

export default function TransaccionAprob({ datos: propsDatos, onRegresar }: Props) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [telefono, setTelefono] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviadoExitoso, setEnviadoExitoso] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Recuperar datos: props -> state de navegación -> última factura de persistencia local -> mock dinámico
  const historialLocal = facturasService.getHistorialLocal();
  const ultimaFactura = historialLocal.length > 0 ? historialLocal[0] : null;

  const rawDatos: DatosTransaccion =
    propsDatos ||
    (location.state as { datos?: DatosTransaccion })?.datos ||
    (ultimaFactura
      ? {
        idFactura: ultimaFactura.idFactura,
        valor: ultimaFactura.valor,
        subtotal: ultimaFactura.subtotal,
        iva: ultimaFactura.iva,
        empresa: ultimaFactura.empresa,
        nitEmpresa: ultimaFactura.nitEmpresa,
        pagador: ultimaFactura.pagador,
        nitPagador: ultimaFactura.nitPagador,
        medioPago: ultimaFactura.medioPago,
        fechaHora: ultimaFactura.fechaHora,
        referenciaPago: ultimaFactura.referenciaPago
      }
      : getDefaultDatosTransaccion());

  // Asegurar que fechaHora sea siempre en Hora Colombia (America/Bogota) si no viene definida
  const partesColActual = obtenerPartesColombia(new Date());
  const fechaHoraActualCol = `${partesColActual.dia} ${partesColActual.mesTexto} ${partesColActual.anio} ${partesColActual.hora12}:${partesColActual.minuto}${partesColActual.ampm}`;

  const datos: DatosTransaccion = {
    ...rawDatos,
    fechaHora: rawDatos.fechaHora?.trim() ? rawDatos.fechaHora : fechaHoraActualCol
  };

  // URL base dinámica: Si está desplegado, usa el origen actual del navegador (window.location.origin),
  // o la variable VITE_PUBLIC_URL si fue configurada en el entorno.
  const BASE_WEB_URL = (import.meta.env.VITE_PUBLIC_URL as string) || window.location.origin;

  // Parámetros en query params para que cualquier celular que escanee el QR
  // tenga acceso a los datos completos de la factura de forma autónoma (sin depender del localStorage del emisor):
  const queryParams = new URLSearchParams({
    id: datos.idFactura,
    valor: datos.valor,
    empresa: datos.empresa,
    pagador: datos.pagador,
    medio: datos.medioPago,
    fecha: datos.fechaHora,
    ...(datos.nitEmpresa ? { nitEmpresa: datos.nitEmpresa } : {}),
    ...(datos.nitPagador ? { nitPagador: datos.nitPagador } : {}),
    ...(datos.referenciaPago ? { ref: datos.referenciaPago } : {}),
    ...(datos.subtotal ? { subtotal: datos.subtotal } : {}),
    ...(datos.iva ? { iva: datos.iva } : {})
  });

  const urlDestinoQR = `${BASE_WEB_URL}/factura/id=${encodeURIComponent(datos.idFactura)}?${queryParams.toString()}`;
  const urlImagenQR = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(urlDestinoQR)}`;

  const cerrarModal = () => {
    setMostrarModal(false);
    setTimeout(() => {
      setEnviadoExitoso(false);
      setErrorEnvio(null);
    }, 250);
  };

  const handleEnviar = async () => {
    const numeroLimpio = limpiarNumeroTelefono(telefono);
    if (!numeroLimpio || numeroLimpio.length < 10) {
      setErrorEnvio("Por favor ingresa un número de teléfono válido.");
      return;
    }

    setEnviando(true);
    setErrorEnvio(null);

    const nombreUsuario = datos.pagador?.trim() || "Usuario";
    const numFactura = datos.idFactura?.trim() || "";
    const valorPago = datos.valor.replace(/^\$\s*/, "").trim();

    // Obtener siempre la fecha y hora EXACTA de Colombia (America/Bogota) en tiempo real al enviar:
    const partesCol = obtenerPartesColombia(new Date());
    const fecha = partesCol.fechaDDMMYYYY;
    const hora = partesCol.horaFormateada;

    // Formato exacto requerido:
    // [nombre del usuario] envío un pago de la factura [num factura] por el valor de $ [valor del pago] el día [fecha] a la hora [hora]
    const mensaje = `${nombreUsuario} envío un pago de la factura ${numFactura} por el valor de $ ${valorPago} el día ${fecha} a la hora ${hora}`;

    try {
      const response = await fetch("https://enlace-crm.com:3000/backend/whatsapp/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          number: numeroLimpio,
          message: mensaje
        })
      });

      const resData = await response.json().catch(() => null);

      if (!response.ok || (resData && resData.success === false)) {
        throw new Error(resData?.message || `Error del servidor (${response.status})`);
      }

      setEnviadoExitoso(true);
      setTimeout(() => {
        cerrarModal();
        setTelefono("");
      }, 1500);
    } catch (err: any) {
      console.error("Error al enviar comprobante vía WhatsApp:", err);
      setErrorEnvio(err?.message || "No se pudo enviar el comprobante. Por favor intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const handleDescargar = () => {
    window.print();
  };

  const handleRegresar = () => {
    if (onRegresar) {
      onRegresar();
    } else if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6">
      <div className="w-full max-w-[430px] min-h-dvh bg-white shadow-none sm:shadow-2xl relative flex flex-col overflow-x-hidden sm:rounded-3xl border-0 sm:border sm:border-slate-100">
        <div className="pantalla-wrapper transaccion-aprob-wrapper">
          <header className="header-pago">
            <h1 className="titulo-header">Pago Realizado</h1>
          </header>

          <div className="zigzag-border"></div>

          <main className="contenido-pago">
            <div className="contenido-interno">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.05 }}
                className="check-container"
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0e9347" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.12 }}
                className="flex flex-col items-center w-full"
              >
                <h2 className="subtitulo-estado">Transacción Aprobada</h2>

                <span className="label-valor">Valor Pagado</span>
                <div className="monto-valor">{datos.valor}</div>

                <p className="nombre-empresa">{datos.empresa}</p>
                {datos.nitEmpresa && (
                  <p className="text-[11.5px] text-slate-500 font-medium -mt-1 mb-2">
                    {datos.nitEmpresa}
                  </p>
                )}

                {/* Badge visible con # de Factura y Fecha del pago */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#eef0fc] text-[#1B2075] rounded-full text-xs font-semibold mb-2 border border-blue-100/80">
                  <span className="font-bold">Factura #{datos.idFactura}</span>
                  <span className="text-blue-300">•</span>
                  <span>{datos.fechaHora}</span>
                </div>

                {/* Tarjeta de detalles completos de la factura pagada */}
                <div className="detalles-factura">
                  <div className="fila-detalle">
                    <span className="label-detalle">No. de Factura</span>
                    <strong className="valor-detalle text-[#1B2075]">#{datos.idFactura}</strong>
                  </div>

                  <div className="fila-detalle">
                    <span className="label-detalle">Fecha del pago</span>
                    <span className="valor-detalle">{datos.fechaHora}</span>
                  </div>

                  {datos.medioPago && (
                    <div className="fila-detalle">
                      <span className="label-detalle">Medio de pago</span>
                      <span className="valor-detalle">{datos.medioPago}</span>
                    </div>
                  )}

                  {datos.referenciaPago && (
                    <div className="fila-detalle">
                      <span className="label-detalle">Ref. de pago</span>
                      <span className="valor-detalle font-mono text-[11px] text-slate-700">{datos.referenciaPago}</span>
                    </div>
                  )}

                  {datos.pagador && (
                    <div className="fila-detalle">
                      <span className="label-detalle">Pagador</span>
                      <span className="valor-detalle">{datos.pagador}</span>
                    </div>
                  )}

                  {datos.nitPagador && (
                    <div className="fila-detalle">
                      <span className="label-detalle">Identificación</span>
                      <span className="valor-detalle">{datos.nitPagador}</span>
                    </div>
                  )}

                  {datos.subtotal && (
                    <div className="fila-detalle">
                      <span className="label-detalle">Subtotal</span>
                      <span className="valor-detalle">{datos.subtotal}</span>
                    </div>
                  )}

                  {datos.iva && (
                    <div className="fila-detalle">
                      <span className="label-detalle">IVA</span>
                      <span className="valor-detalle">{datos.iva}</span>
                    </div>
                  )}

                  <div className="fila-detalle">
                    <span className="label-detalle">Estado</span>
                    <span className="valor-detalle text-emerald-600 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      Aprobada
                    </span>
                  </div>
                </div>

                <p className="descripcion-texto mt-1">
                  Comparte este comprobante al teléfono del transportista o permítele escanear este QR para confirmar el pago de la factura
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, delay: 0.2 }}
                className="qr-container"
              >
                <a href={urlDestinoQR} target="_blank" rel="noopener noreferrer" title="Abrir URL web del comprobante">
                  <img
                    src={urlImagenQR}
                    alt={`Código QR Factura ${datos.idFactura}`}
                    className="qr-image"
                  />
                </a>
              </motion.div>

              <motion.button
                whileTap={{ scale: 0.96 }}
                className="btn-descargar"
                onClick={handleDescargar}
                type="button"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Descargar Comprobante</span>
              </motion.button>

              <div className="grupo-botones">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="btn-regresar"
                  onClick={handleRegresar}
                  type="button"
                >
                  Regresar
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  className="btn-compartir"
                  onClick={() => setMostrarModal(true)}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  <span>Compartir</span>
                </motion.button>
              </div>
            </div>
          </main>

          {/* Modal Bottom-Sheet con Motion y AnimatePresence */}
          <AnimatePresence>
            {mostrarModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="modal-overlay"
                onClick={cerrarModal}
              >
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="bottom-sheet"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button className="btn-cerrar-modal" onClick={cerrarModal} type="button">
                    ✕
                  </button>

                  <h3 className="modal-titulo">Compartir comprobante</h3>

                  {enviadoExitoso ? (
                    <div style={{ textAlign: "center", padding: "28px 0", color: "#0e9347", fontWeight: 700, margin: "auto 0" }}>
                      <div style={{ fontSize: "32px", marginBottom: "8px" }}>✓</div>
                      ¡Comprobante enviado exitosamente por WhatsApp!
                    </div>
                  ) : (
                    <>
                      <div className="form-group">
                        <label className="input-label">Teléfono</label>
                        <input
                          type="tel"
                          value={telefono}
                          onChange={(e) => {
                            setTelefono(e.target.value);
                            if (errorEnvio) setErrorEnvio(null);
                          }}
                          disabled={enviando}
                          className="input-telefono"
                          placeholder="Ej:321 456 7890"
                        />
                        {errorEnvio && (
                          <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "6px", fontWeight: 500 }}>
                            {errorEnvio}
                          </p>
                        )}
                      </div>

                      <div className="modal-acciones">
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          className="btn-modal-cancelar"
                          onClick={cerrarModal}
                          type="button"
                          disabled={enviando}
                        >
                          Cancelar
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          className="btn-modal-enviar"
                          onClick={handleEnviar}
                          type="button"
                          disabled={enviando || !telefono.trim()}
                          style={enviando || !telefono.trim() ? { opacity: 0.7, cursor: "not-allowed" } : undefined}
                        >
                          {enviando ? (
                            <span>Enviando...</span>
                          ) : (
                            <>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                              </svg>
                              <span>Enviar</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}