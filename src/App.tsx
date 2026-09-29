import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InicioScreen } from './pantallas/InicioScreen';
import TransaccionAprob from './views/transaccionAprob';
import PagoRecibido from './views/PagoRecibido';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InicioScreen />} />
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
