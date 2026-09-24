import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { type DatosTransaccion, defaultDatosTransaccion } from "../types/transaccion";
import "./transaccionAprob.css";

interface Props {
  datos?: DatosTransaccion;
  onRegresar?: () => void;
}

export default function TransaccionAprob({ datos: propsDatos, onRegresar }: Props) {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [animandoCierre, setAnimandoCierre] = useState(false);
  const [telefono, setTelefono] = useState("");
  const [enviadoExitoso, setEnviadoExitoso] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const datos: DatosTransaccion =
    propsDatos ||
    (location.state as { datos?: DatosTransaccion })?.datos ||
    defaultDatosTransaccion;

  // URL a la que dirigirá el QR (apunta a la vista /pago-recibido con query params)
  const queryParams = new URLSearchParams({
    id: datos.idFactura,
    valor: datos.valor,
    empresa: datos.empresa,
    pagador: datos.pagador,
    medio: datos.medioPago,
    fecha: datos.fechaHora
  });
  const urlDestinoQR = `${window.location.origin}/pago-recibido?${queryParams.toString()}`;
  const urlImagenQR = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(urlDestinoQR)}`;

  const cerrarModal = () => {
    setAnimandoCierre(true);
    setTimeout(() => {
      setMostrarModal(false);
      setAnimandoCierre(false);
      setEnviadoExitoso(false);
    }, 280);
  };

  const handleEnviar = () => {
    if (!telefono.trim()) return;
    setEnviadoExitoso(true);
    setTimeout(() => {
      cerrarModal();
      setTelefono("");
    }, 1200);
  };

  const handleDescargar = () => {
    window.print();
  };

  const handleRegresar = () => {
    if (onRegresar) {
      onRegresar();
    } else {
      navigate("/");
    }
  };

  return (
    <div className="w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6">
      <div className="w-full max-w-[430px] min-h-dvh bg-white shadow-none sm:shadow-2xl relative flex flex-col overflow-x-hidden sm:rounded-3xl border-0 sm:border sm:border-slate-100">
        <div className="pantalla-wrapper">
          <header className="header-pago">
            <h1 className="titulo-header">Pago Realizado</h1>
          </header>

          <div className="zigzag-border"></div>

          <main className="contenido-pago">
            <div className="contenido-interno">
              <div className="check-container">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0e9347" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>

              <h2 className="subtitulo-estado">Transacción Aprobada</h2>

              <span className="label-valor">Valor</span>
              <div className="monto-valor">{datos.valor}</div>

              <p className="nombre-empresa">{datos.empresa}</p>

              <p className="descripcion-texto">
                Comparte este comprobante al teléfono del transportista o permítele escanear este QR para confirmar el pago de la factura
              </p>

              <div className="qr-container">
                <a href={urlDestinoQR} target="_blank" rel="noopener noreferrer">
                  <img
                    src={urlImagenQR}
                    alt="Código QR Comprobante"
                    className="qr-image"
                  />
                </a>
              </div>

              <button className="btn-descargar" onClick={handleDescargar} type="button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Descargar Comprobante</span>
              </button>

              <div className="grupo-botones">
                <button className="btn-regresar" onClick={handleRegresar} type="button">
                  Regresar
                </button>
                <button className="btn-compartir" onClick={() => setMostrarModal(true)} type="button">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          </main>

          {/* Modal Bottom-Sheet */}
          {mostrarModal && (
            <div 
              className={`modal-overlay ${animandoCierre ? "cerrando" : ""}`} 
              onClick={cerrarModal}
            >
              <div 
                className={`bottom-sheet ${animandoCierre ? "cerrando" : ""}`} 
                onClick={(e) => e.stopPropagation()}
              >
                <button className="btn-cerrar-modal" onClick={cerrarModal} type="button">
                  ✕
                </button>

                <h3 className="modal-titulo">Compartir comprobante</h3>

                {enviadoExitoso ? (
                  <div style={{ textAlign: "center", padding: "16px 0", color: "#0e9347", fontWeight: 700 }}>
                    ¡Comprobante enviado exitosamente!
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label className="input-label">Teléfono</label>
                      <input
                        type="tel"
                        value={telefono}
                        onChange={(e) => setTelefono(e.target.value)}
                        className="input-telefono"
                        placeholder="Ej: +57 310 000 0000"
                      />
                    </div>

                    <div className="modal-acciones">
                      <button className="btn-modal-cancelar" onClick={cerrarModal} type="button">
                        Cancelar
                      </button>
                      <button className="btn-modal-enviar" onClick={handleEnviar} type="button">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                        <span>Enviar</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}