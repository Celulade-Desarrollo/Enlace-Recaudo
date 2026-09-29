import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams, useSearchParams } from "react-router-dom";
import { facturasService, type DetalleFactura } from "../services/facturasService";
import { type DatosTransaccion, defaultDatosTransaccion } from "../types/transaccion";
import "./pagoRecibido.css";

interface Props {
  datos?: DatosTransaccion;
}

export default function PagoRecibido({ datos: propsDatos }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ idFactura?: string }>();
  const [searchParams] = useSearchParams();

  // Estados de consulta al backend
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [factura, setFactura] = useState<DetalleFactura | null>(null);

  // Extraer el ID de la factura desde la URL (soporta /factura/id=9868497, /factura/9868497 o ?id=9868497)
  const rawIdFromParam = params.idFactura || searchParams.get("id");
  const idFacturaLimpio = rawIdFromParam
    ? rawIdFromParam.replace(/^id=/, "").trim()
    : null;

  const idAConsultar =
    idFacturaLimpio ||
    propsDatos?.idFactura ||
    (location.state as { datos?: DatosTransaccion })?.datos?.idFactura ||
    defaultDatosTransaccion.idFactura;

  // 1. Extraer datos si vienen en Query Params (cuando otro celular escanea el QR del comprobante)
  const queryData: Partial<DetalleFactura> | null = searchParams.get("valor")
    ? {
        idFactura: idAConsultar,
        valor: searchParams.get("valor") || undefined,
        empresa: searchParams.get("empresa") || undefined,
        pagador: searchParams.get("pagador") || undefined,
        medioPago: searchParams.get("medio") || undefined,
        fechaHora: searchParams.get("fecha") || undefined,
        nitEmpresa: searchParams.get("nitEmpresa") || undefined,
        nitPagador: searchParams.get("nitPagador") || undefined,
        referenciaPago: searchParams.get("ref") || `REF-${idAConsultar}`,
        subtotal: searchParams.get("subtotal") || undefined,
        iva: searchParams.get("iva") || undefined,
        estado: "APROBADA"
      }
    : null;

  // 2. O si vienen en el state de navegación interna
  const stateDatos = (location.state as { datos?: DatosTransaccion })?.datos || propsDatos;
  const fallbackData: Partial<DetalleFactura> | null =
    queryData ||
    (stateDatos
      ? {
          idFactura: stateDatos.idFactura,
          valor: stateDatos.valor,
          empresa: stateDatos.empresa,
          pagador: stateDatos.pagador,
          medioPago: stateDatos.medioPago,
          fechaHora: stateDatos.fechaHora,
          nitEmpresa: stateDatos.nitEmpresa,
          nitPagador: stateDatos.nitPagador,
          referenciaPago: stateDatos.referenciaPago,
          subtotal: stateDatos.subtotal,
          iva: stateDatos.iva,
          estado: "APROBADA"
        }
      : null);

  // Consultar al backend (o simulación local con fallback) con el id de la factura
  const cargarFactura = () => {
    setLoading(true);
    setError(null);

    facturasService
      .getFacturaById(idAConsultar, fallbackData)
      .then((data) => {
        setFactura(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Error al consultar la factura en el backend");
        setLoading(false);
      });
  };

  useEffect(() => {
    let cancel = false;

    facturasService
      .getFacturaById(idAConsultar, fallbackData)
      .then((data) => {
        if (!cancel) {
          setFactura(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancel) {
          setError(err.message || "Error al consultar la factura en el backend");
          setLoading(false);
        }
      });

    return () => {
      cancel = true;
    };
  }, [idAConsultar, searchParams]);

  const handleRegresar = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  const handleDescargar = () => {
    window.print();
  };

  return (
    <div className="w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6">
      <div className="w-full max-w-[430px] min-h-dvh bg-white shadow-none sm:shadow-2xl relative flex flex-col overflow-x-hidden sm:rounded-3xl border-0 sm:border sm:border-slate-100">
        <div className="pantalla-wrapper">
          {/* Encabezado */}
          <header className="header-pago">
            <h1 className="titulo-header">Comprobante de Pago</h1>
          </header>

          {/* Borde dentado */}
          <div className="zigzag-border"></div>

          {/* Contenido Principal */}
          <main className="contenido-pago">
            <div className="contenido-interno">

              {/* 1. ESTADO DE CARGA */}
              {loading && (
                <div className="cargando-box">
                  <div className="spinner-recaudo"></div>
                  <h2 className="cargando-titulo">Consultando con el backend...</h2>
                  <p className="cargando-subtexto">
                    Obteniendo detalles de la factura #{idAConsultar}
                  </p>
                </div>
              )}

              {/* 2. ESTADO DE ERROR */}
              {!loading && error && (
                <div className="error-box">
                  <div className="check-container error-icon-box">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  </div>

                  <h2 className="error-titulo">Factura no encontrada</h2>
                  <p className="error-desc">{error}</p>

                  <button className="btn-reintentar" onClick={cargarFactura} type="button">
                    Reintentar consulta
                  </button>
                  <button className="btn-regresar-full" onClick={handleRegresar} type="button">
                    Regresar al inicio
                  </button>
                </div>
              )}

              {/* 3. ESTADO DE ÉXITO */}
              {!loading && !error && factura && (
                <>
                  <div className="check-container">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0e9347" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>

                  <h2 className="subtitulo-estado">Transacción Aprobada</h2>

                  <div className="badge-verificado">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>Verificado por Enlace CRM</span>
                  </div>

                  <span className="label-valor">Valor Pagado</span>
                  <div className="monto-valor">{factura.valor}</div>

                  <p className="nombre-empresa">{factura.empresa}</p>
                  {factura.nitEmpresa && <p className="nit-empresa">{factura.nitEmpresa}</p>}

                  {/* Lista de detalles de la transacción consultados desde el backend */}
                  <div className="detalles-factura">
                    <div className="fila-detalle">
                      <span className="label-detalle">Factura No.</span>
                      <strong className="valor-detalle text-[#1B2075]">{factura.idFactura}</strong>
                    </div>

                    <div className="fila-detalle">
                      <span className="label-detalle">Pagador</span>
                      <span className="valor-detalle">{factura.pagador}</span>
                    </div>

                    {factura.nitPagador && (
                      <div className="fila-detalle">
                        <span className="label-detalle">Identificación</span>
                        <span className="valor-detalle">{factura.nitPagador}</span>
                      </div>
                    )}

                    <div className="fila-detalle">
                      <span className="label-detalle">Medio de Pago</span>
                      <span className="valor-detalle">{factura.medioPago}</span>
                    </div>

                    <div className="fila-detalle">
                      <span className="label-detalle">Fecha y Hora</span>
                      <span className="valor-detalle">{factura.fechaHora}</span>
                    </div>

                    {factura.referenciaPago && (
                      <div className="fila-detalle">
                        <span className="label-detalle">Referencia</span>
                        <span className="valor-detalle font-mono text-xs">{factura.referenciaPago}</span>
                      </div>
                    )}

                    {factura.subtotal && (
                      <div className="fila-detalle">
                        <span className="label-detalle">Subtotal</span>
                        <span className="valor-detalle">{factura.subtotal}</span>
                      </div>
                    )}

                    {factura.iva && (
                      <div className="fila-detalle">
                        <span className="label-detalle">IVA</span>
                        <span className="valor-detalle">{factura.iva}</span>
                      </div>
                    )}
                  </div>

                  <button className="btn-descargar-recibo" onClick={handleDescargar} type="button">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    <span>Descargar Comprobante</span>
                  </button>

                  <button className="btn-regresar-full" onClick={handleRegresar} type="button">
                    Regresar
                  </button>
                </>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}