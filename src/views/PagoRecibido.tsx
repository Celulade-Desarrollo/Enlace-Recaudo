import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { type DatosTransaccion, defaultDatosTransaccion } from "../types/transaccion";
import "./pagoRecibido.css";

interface Props {
  datos?: DatosTransaccion;
}

export default function PagoRecibido({ datos: propsDatos }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const queryId = searchParams.get("id");
  const queryValor = searchParams.get("valor");
  const queryEmpresa = searchParams.get("empresa");
  const queryPagador = searchParams.get("pagador");
  const queryMedio = searchParams.get("medio");
  const queryFecha = searchParams.get("fecha");

  const datos: DatosTransaccion =
    propsDatos ||
    (location.state as { datos?: DatosTransaccion })?.datos || {
      idFactura: queryId || defaultDatosTransaccion.idFactura,
      valor: queryValor || defaultDatosTransaccion.valor,
      empresa: queryEmpresa || defaultDatosTransaccion.empresa,
      pagador: queryPagador || defaultDatosTransaccion.pagador,
      medioPago: queryMedio || defaultDatosTransaccion.medioPago,
      fechaHora: queryFecha || defaultDatosTransaccion.fechaHora
    };

  const handleRegresar = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6">
      <div className="w-full max-w-[430px] min-h-dvh bg-white shadow-none sm:shadow-2xl relative flex flex-col overflow-x-hidden sm:rounded-3xl border-0 sm:border sm:border-slate-100">
        <div className="pantalla-wrapper">
          {/* Encabezado */}
          <header className="header-pago">
            <h1 className="titulo-header">Pago Recibido</h1>
          </header>

          {/* Borde dentado */}
          <div className="zigzag-border"></div>

          {/* Contenido Principal */}
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

              {/* Lista de detalles de la transacción */}
              <div className="detalles-factura">
                <div className="fila-detalle">
                  <span className="label-detalle">Factura No.</span>
                  <strong className="valor-detalle">{datos.idFactura}</strong>
                </div>

                <div className="fila-detalle">
                  <span className="label-detalle">Pagador</span>
                  <span className="valor-detalle">{datos.pagador}</span>
                </div>

                <div className="fila-detalle">
                  <span className="label-detalle">Medio de Pago</span>
                  <span className="valor-detalle">{datos.medioPago}</span>
                </div>

                <div className="fila-detalle">
                  <span className="label-detalle">Fecha y Hora</span>
                  <span className="valor-detalle">{datos.fechaHora}</span>
                </div>
              </div>

              <button className="btn-regresar-full" onClick={handleRegresar} type="button">
                Regresar
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}