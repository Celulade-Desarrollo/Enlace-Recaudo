import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './pantallas/LoginScreen';
import { InicioScreen } from './pantallas/InicioScreen';
import { TransportistaFlow } from './pantallas/TransportistaFlow';
import TransaccionAprob from './views/transaccionAprob';
import PagoRecibido from './views/PagoRecibido';
import { SeleccionRutaScreen } from './pantallas/SeleccionRutaScreen/SeleccionRutaScreen';
import { useState } from 'react';

function AccesoTransportista() {
  const [rutaId, setRutaId] = useState<string | null>(null);

  if (rutaId === null) {
    return <SeleccionRutaScreen onContinuar={setRutaId} />;
  }

  return <TransportistaFlow />;
}
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  // Si NO está logueado, solo muestra el Login (no puede pasar a nada)
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Si SÍ está logueado, muestra las rutas normales
  return (
    <BrowserRouter>
      <Routes>
        {/* App Transportista (Principal en esta rama) */}
        <Route path="/" element={<AccesoTransportista />} />
        <Route path="/transportista" element={<AccesoTransportista />} />

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

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
