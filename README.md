# Enlace CRM - Módulo de Recaudo

Aplicación web responsiva con enfoque **Mobile-First** construida para la gestión y recaudación de facturas, administración de llaves financieras y consulta de movimientos.

---

## Stack Tecnológico

* **Frontend:** React 19 + TypeScript
* **Estilos:** Tailwind CSS v4 (con tokens de diseño corporativos)
* **Iconografía:** [Tabler Icons React](https://tabler.io/icons) (`@tabler/icons-react`)
* **Empaquetador y Dev Server:** Vite
* **Linter:** Oxlint + TypeScript Compiler

---

## Arquitectura del Proyecto

El proyecto implementa una arquitectura basada en **Atomic Design** combinada con una capa desacoplada de **Servicios (SEMIAPI)** para la gestión y simulación de datos:

```
src/
├── assets/             # Recursos estáticos locales
├── components/         # Sistema de Diseño (Atomic Design)
│   ├── atoms/          # Componentes indivisibles base
│   ├── molecules/      # Combinación de átomos con función específica
│   ├── organisms/      # Secciones completas de la interfaz
│   └── index.ts        # Barril de exportación global de componentes
├── pantallas/          # Vistas / Pantallas completas de la aplicación
│   ├── InicioScreen/         # Pantalla principal del usuario
│   ├── PagarFacturaScreen/   # Flujo de pago de factura (Paso 1 y Paso 2)
│   └── index.ts              # Barril de exportación de pantallas
├── services/           # Capa de datos y servicios (SEMIAPI)
│   └── bancosService.ts      # Consulta de bancos y persistencia de llaves
├── App.tsx             # Componente raíz y control de flujo
├── index.css           # Configuración global de Tailwind v4 y variables CSS
└── main.tsx            # Punto de entrada de React
public/
├── bancos/             # Logos SVG de respaldo para bancos
├── data/               # Fuentes de datos JSON para la SEMIAPI
│   └── bancos.json     # Catálogo de entidades financieras
└── *_icon.*            # Logos e iconos oficiales en alta calidad
```

---

### Niveles de Atomic Design en la Aplicación

#### 1. Átomos (`src/components/atoms/`)
Componentes más pequeños que no pueden dividirse sin perder su utilidad:
* **`Avatar`**: Círculo de perfil de usuario con iniciales o fotografía.
* **`Button`**: Botón genérico con variantes (`primary`, `secondary`, `ghost`, `circle`).
* **`Icon`**: Envoltorio centralizado sobre `@tabler/icons-react` para estandarizar tamaños y trazos.
* **`Input`**: Campo de texto estilizado con soporte para iconos integrados.
* **`Logo`** (`EnlaceLogo`): Renderizado del logotipo corporativo de Enlace.
* **`Typography`**: Gestor de jerarquía de textos con colores corporativos predefinidos (`#1B2075`).

#### 2. Moléculas (`src/components/molecules/`)
Unidades funcionales simples construidas a partir de varios átomos:
* **`BottomNavItem`**: Cada botón individual de la barra inferior con su icono y texto activo/inactivo.
* **`InvoiceCard`**: Tarjeta de comercio/proveedor en la lista principal (Alpina, Nutresa, Postobón).
* **`InvoiceDetailCard`**: Tarjeta de factura individual para seleccionar en el flujo de pago.
* **`PaymentMethodCard`**: Tarjeta de medio de pago con efecto de borde resaltado (`border-[#1B2075]`).
* **`QuickActionButton`**: Botones circulares de acción rápida (*"Mis Llaves"*, *"Mis Movimientos"*).
* **`SearchBar`**: Barra de búsqueda con icono de lupa e interacción en tiempo real.
* **`ModalInscribirLlave`**: Modal emergente para registrar llaves conectándose a la SEMIAPI de bancos.

#### 3. Organismos (`src/components/organisms/`)
Estructuras complejas y secciones reutilizables:
* **`HeaderBanner`**: Encabezado azul curvado con logo, avatar y saludo dinámico según la hora.
* **`QuickActionsRow`**: Fila contenedora de accesos rápidos (*Mis Llaves* y *Mis Movimientos*).
* **`PendingInvoicesSection`**: Sección de facturas pendientes con título, buscador y filtrado dinámico.
* **`BottomNavigation`**: Barra de navegación fija inferior (*Inicio*, *Movimientos*, *Para ti*).
* **`PaymentTopHeader`**: Barra superior de navegación en el flujo de pago con botón circular de retorno.

#### 4. Pantallas / Screens (`src/pantallas/`)
Ensamblajes de organismos y lógica de negocio que representan una vista completa:
* **`InicioScreen`**: Vista principal con saldo, acciones rápidas, buscador y lista de proveedores.
* **`PagarFacturaScreen`**: Flujo interactivo de dos etapas:
  * **Paso 1:** Muestra el total del comercio y permite seleccionar la factura a pagar.
  * **Paso 2:** Selección de monto (*Pago Total* u *Otro Valor*) y medio de pago resaltado, con soporte para inscribir llaves si la lista está vacía.

---

##  Capa de Servicios: SEMIAPI

La aplicación cuenta con una **SEMIAPI** local para simular la integración con sistemas bancarios reales:
* **JSON Local ([`public/data/bancos.json`](file:///c:/proyectos/enlacecrm_nuevo/public/data/bancos.json)):** Catálogo con código, nombre y ruta de logo de cada entidad (Nequi, Bancolombia, Banco de Bogotá, Davivienda, BBVA, Nu Colombia).
* **Servicio ([`src/services/bancosService.ts`](file:///c:/proyectos/enlacecrm_nuevo/src/services/bancosService.ts)):**
  * `getBancos()`: Realiza una petición `fetch()` asíncrona hacia `/data/bancos.json` con respaldo de contingencia en memoria.
  * `getMediosDePago()`: Recupera las llaves inscritas del usuario guardadas en `localStorage`.
  * `inscribirLlave()`: Añade una nueva llave asociada a cualquier banco y persiste el cambio inmediatamente.

---

##  Sistema de Colores y Tipografía

* **Azul Primario de Marca:** `#363CB1` (Fondos de banners, botones principales).
* **Azul de Encabezados de Flujo:** `#2F399B` (Barra superior de pago).
* **Color de Textos de la App:** `#1B2075` (Títulos de sección, labels, valores de input y selección).
* **Fuente Principal:** `DM Sans` (Google Fonts).

---

##  Guía: Cómo Agregar Nuevas Pantallas y Componentes

Para mantener la coherencia y escalabilidad del código, sigue estos pasos al agregar nuevas funcionalidades:

### Paso 1: Crear los Componentes Necesarios (Atoms, Molecules u Organisms)

1. Crea la carpeta en el nivel adecuado:
   * Ejemplo para una nueva molécula: `src/components/molecules/TransactionItem/TransactionItem.tsx`.
2. Escribe el componente tipando sus `Props`:
   ```tsx
   import React from 'react';
   import { Typography } from '../../atoms/Typography/Typography';
   import { Icon } from '../../atoms/Icon/Icon';

   interface TransactionItemProps {
     description: string;
     date: string;
     amount: string;
     onClick?: () => void;
   }

   export const TransactionItem: React.FC<TransactionItemProps> = ({
     description,
     date,
     amount,
     onClick,
   }) => {
     return (
       <div
         onClick={onClick}
         className="bg-white rounded-2xl p-4 flex items-center justify-between border border-slate-100 shadow-xs cursor-pointer hover:border-slate-200 transition-all"
       >
         <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-blue-50 text-[#363CB1] flex items-center justify-center">
             <Icon name="coins" size={20} />
           </div>
           <div>
             <Typography variant="h3" className="text-sm font-bold text-[#1B2075]">
               {description}
             </Typography>
             <span className="text-xs text-slate-400">{date}</span>
           </div>
         </div>
         <span className="font-extrabold text-[#1B2075] text-sm">{amount}</span>
       </div>
     );
   };
   ```
3. Regístralo en el archivo barril `src/components/molecules/index.ts`:
   ```ts
   export * from './TransactionItem/TransactionItem';
   ```

---

### Paso 2: Crear la Nueva Pantalla

1. Crea la carpeta en `src/pantallas/`:
   `src/pantallas/MovimientosScreen/MovimientosScreen.tsx`.
2. Ensambla los organismos y moléculas:
   ```tsx
   import React from 'react';
   import { PaymentTopHeader } from '../../components/organisms/PaymentTopHeader/PaymentTopHeader';
   import { TransactionItem } from '../../components/molecules/TransactionItem/TransactionItem';

   interface MovimientosScreenProps {
     onBack: () => void;
   }

   export const MovimientosScreen: React.FC<MovimientosScreenProps> = ({ onBack }) => {
     return (
       <div className="w-full min-h-dvh bg-white sm:bg-slate-100 flex justify-center items-start sm:py-6">
         <div className="w-full max-w-[430px] min-h-dvh bg-white shadow-none sm:shadow-2xl relative flex flex-col pb-8 overflow-x-hidden sm:rounded-3xl border-0 sm:border sm:border-slate-100">
           <PaymentTopHeader title="Mis Movimientos" onBack={onBack} />
           <div className="p-5 flex flex-col gap-3">
             <TransactionItem description="Pago Alpina" date="24 Sep 2026" amount="$125.632" />
             <TransactionItem description="Pago Nutresa" date="20 Sep 2026" amount="$145.200" />
           </div>
         </div>
       </div>
     );
   };
   ```
3. Exporta la pantalla en `src/pantallas/MovimientosScreen/index.ts` y en `src/pantallas/index.ts`:
   ```ts
   export * from './MovimientosScreen';
   ```

---

### Paso 3: Conectar la Pantalla en el Flujo de la App

En [`InicioScreen.tsx`](file:///c:/proyectos/enlacecrm_nuevo/src/pantallas/InicioScreen/InicioScreen.tsx) o en el gestor de estados principal:
1. Importa la pantalla:
   ```tsx
   import { MovimientosScreen } from '../MovimientosScreen';
   ```
2. Renderízala condicionalmente según la pestaña o acción activa:
   ```tsx
   if (activeTab === 'movimientos') {
     return <MovimientosScreen onBack={() => setActiveTab('inicio')} />;
   }
   ```

---

##  Comandos de Ejecución

### Detalle editable de prefacturas del transportista

Al elegir una prefactura se abre su detalle desde abajo. Al tocar un producto,
el editor inferior permite cambiar la cantidad, eliminar y deshacer. Los
subtotales y el total se actualizan en vivo; Cancelar descarta la edición del
producto. Generar Factura guarda el detalle y el nuevo saldo en `localStorage`
y abre las cuatro opciones de pago con el monto actualizado.

`productosService.ts` contiene ejemplos que conservan los saldos iniciales.
Los precios y las cantidades son de demostración. Las cuatro fotografías son
PNG oficiales de Alpina de 660 × 660; su procedencia está documentada en
`public/productos/alpina/FUENTES.md`. No hay sincronización con Amovil.

Las comprobaciones de recálculo, persistencia y recuperación se ejecutan con
`npm test` y no acceden a servicios externos ni al almacenamiento del navegador.

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo en local
npm run dev

# Compilar para producción (validación de TypeScript + Vite Bundle)
npm run build

# Previsualizar el bundle de producción
npm run preview
```
