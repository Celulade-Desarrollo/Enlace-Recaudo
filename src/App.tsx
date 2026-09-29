import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InicioScreen } from './pantallas/InicioScreen';
import { TransportistaFlow } from './pantallas/TransportistaFlow';
import TransaccionAprob from './views/transaccionAprob';
import PagoRecibido from './views/PagoRecibido';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* App Transportista (Principal en esta rama) */}
        <Route path="/" element={<TransportistaFlow />} />
        <Route path="/transportista" element={<TransportistaFlow />} />

        {/* App Tendero / Recaudo */}
        <Route path="/tendero" element={<InicioScreen />} />
        <Route path="/tendero/movimientos" element={<InicioScreen initialTab="movimientos" />} />
        <Route path="/movimientos" element={<InicioScreen initialTab="movimientos" />} />
        <Route path="/transaccion" element={<TransaccionAprob />} />
        <Route path="/pago-recibido" element={<PagoRecibido />} />
        <Route path="/factura/id=:idFactura" element={<PagoRecibido />} />
        <Route path="/factura/:idFactura" element={<PagoRecibido />} />
        <Route path="/factura" element={<PagoRecibido />} />
      </Routes>
    </BrowserRouter>
  );
}
