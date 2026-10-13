# Enlace CRM - Contrato de Integración y Especificación del Backend (API REST)

Este documento especifica el **contrato de interfaz de datos (API Contract)** entre el Frontend (React 19 / TypeScript) y el Backend para la aplicación **Enlace CRM - Módulo de Recaudo**.

Contiene **todos los endpoints**, qué debe enviar el Frontend (**Request**) y el formato JSON exacto que debe responder el Backend (**Response**) para cada pantalla y funcionalidad.

---

## Convenciones Generales

* **Base URL Backend Facturación:** `https://enlace-crm.com:8081` *(Configurable vía variable de entorno `VITE_BACKEND_URL`)*
* **Base URL Mensajería WhatsApp:** `https://enlace-crm.com:3000`
* **Formato de intercambio:** `application/json; charset=utf-8`
* **Zona Horaria Oficial:** Colombia (`America/Bogota`, UTC-5)
* **Formato de Moneda:** Números enteros o flotantes para operaciones matemáticas (`numericAmount`), y strings con formato local (`$125.632`) para despliegue en UI.
* **Autenticación:** Cabecera estándar HTTP en endpoints protegidos:
  ```http
  Authorization: Bearer <TOKEN_JWT>
  ```

---

## Índice de Endpoints

1. [Autenticación / Inicio de Sesión](#1-autenticación--inicio-de-sesión)
2. [Dashboard Principal: Facturas Pendientes por Proveedor](#2-dashboard-principal-facturas-pendientes-por-proveedor)
3. [Detalle de Facturas por Proveedor](#3-detalle-de-facturas-por-proveedor)
4. [Catálogo de Bancos y Billeteras Interoperables (Bre-B)](#4-catálogo-de-bancos-y-billeteras-interoperables-bre-b)
5. [Medios de Pago del Usuario (Bolsillo, Microcrédito, Llaves, Efectivo)](#5-medios-de-pago-del-usuario)
6. [Gestión de Llaves Bre-B (CRUD)](#6-gestión-de-llaves-bre-b)
   * 6.1 [Inscribir nueva llave](#61-inscribir-nueva-llave)
   * 6.2 [Actualizar llave](#62-actualizar-llave)
   * 6.3 [Establecer llave como principal](#63-establecer-llave-como-principal)
   * 6.4 [Desvincular / Eliminar llave](#64-desvincular--eliminar-llave)
7. [Procesamiento de Pago de Factura](#7-procesamiento-de-pago-de-factura)
8. [Consulta de Comprobante / Factura Individual (Lectura QR y Comprobante)](#8-consulta-de-comprobante--factura-individual)
9. [Historial de Movimientos Realizados](#9-historial-de-movimientos-realizados)
10. [Notificación de Comprobante vía WhatsApp](#10-notificación-de-comprobante-vía-whatsapp)

---

## 1. Autenticación / Inicio de Sesión

Permite autenticar al comerciante y obtener el token JWT junto a los datos del negocio y del titular.

* **Método:** `POST`
* **Endpoint:** `/api/auth/login`

### Lo que envía el Frontend (Request)
```json
{
  "user": "laura.martinez@enlace.com",
  "password": "PasswordSeguro123*"
}
```

### Esquema de Datos que debe devolver el Backend (Response 200 OK)
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "usr-1020345678",
    "nombre": "Laura Martínez",
    "iniciales": "LM",
    "comercio": {
      "nombre": "Miscelanea Rin-Rin",
      "tipoDocumento": "CC",
      "documento": "1.020.345.678",
      "nit": "CC 1.020.345.678",
      "direccion": "Calle 45 # 12-34, Bogotá",
      "telefono": "3113877395"
    }
  }
}
```

---

## 2. Dashboard Principal: Facturas Pendientes por Proveedor

Alimenta la vista principal (`InicioScreen`) agrupando las facturas pendientes por empresa/proveedor (Alpina, Nutresa, Postobón, etc.).

* **Método:** `GET`
* **Endpoint:** `/api/facturas/pendientes`
* **Query Params opcionales:** `?busqueda=alpina`

### Lo que envía el Frontend (Headers)
```http
GET /api/facturas/pendientes HTTP/1.1
Authorization: Bearer <TOKEN_JWT>
```

### Esquema de Datos que debe devolver el Backend (Response 200 OK)
```json
{
  "success": true,
  "totalPendienteGlobal": "$1.373.337",
  "proveedores": [
    {
      "id": "alpina-1",
      "providerName": "Alpina Productos...",
      "providerLogo": "/Alpina.png",
      "invoiceCount": 3,
      "totalBalance": "$345,678",
      "totalBalanceNumeric": 345678,
      "logoBg": "bg-white"
    },
    {
      "id": "nutresa-2",
      "providerName": "Nutresa S.A.",
      "providerLogo": "/Nutresa.png",
      "invoiceCount": 5,
      "totalBalance": "$563,894",
      "totalBalanceNumeric": 563894,
      "logoBg": "bg-white"
    },
    {
      "id": "postobon-3",
      "providerName": "Postobón S.A.",
      "providerLogo": "/postobon.svg",
      "invoiceCount": 2,
      "totalBalance": "$463.765",
      "totalBalanceNumeric": 463765,
      "logoBg": "bg-white"
    }
  ]
}
```

---

## 3. Detalle de Facturas por Proveedor

Al hacer clic en un proveedor, la pantalla `PagarFacturaScreen` (Paso 1) consulta las facturas pendientes asociadas a dicho proveedor.

* **Método:** `GET`
* **Endpoint:** `/api/proveedores/:proveedorId/facturas` (ej: `/api/proveedores/alpina-1/facturas`)

### Esquema de Datos que debe devolver el Backend (Response 200 OK)
```json
{
  "success": true,
  "proveedorId": "alpina-1",
  "proveedorNombre": "Alpina Productos Alimenticios S.A.",
  "nitEmpresa": "NIT 860.025.900-1",
  "facturas": [
    {
      "id": "alp-1",
      "invoiceNumber": "9868497",
      "amount": "$125.632",
      "numericAmount": 125632,
      "subtotal": "$105.573",
      "iva": "$20.059",
      "fechaVencimiento": "2026-08-20",
      "descripcion": "Pago de pedido de lácteos y derivados",
      "estado": "PENDIENTE"
    },
    {
      "id": "alp-2",
      "invoiceNumber": "9868498",
      "amount": "$110.789",
      "numericAmount": 110789,
      "subtotal": "$93.100",
      "iva": "$17.689",
      "fechaVencimiento": "2026-08-22",
      "descripcion": "Surtido yogures y quesos",
      "estado": "PENDIENTE"
    },
    {
      "id": "alp-3",
      "invoiceNumber": "9868499",
      "amount": "$109.257",
      "numericAmount": 109257,
      "subtotal": "$91.812",
      "iva": "$17.445",
      "fechaVencimiento": "2026-08-25",
      "descripcion": "Pedido semanal lácteos",
      "estado": "PENDIENTE"
    }
  ]
}
```

---

## 4. Catálogo de Bancos y Billeteras Interoperables (Bre-B)

Utilizado en los modales para inscribir o editar llaves (`bancosService.getBancos`).

* **Método:** `GET`
* **Endpoint:** `/api/bancos`

### Esquema de Datos que debe devolver el Backend (Response 200 OK)
```json
[
  {
    "id": "nequi",
    "nombre": "Nequi",
    "codigo": "1507",
    "icono": "/nequi_icon.png",
    "tipo": "billetera"
  },
  {
    "id": "bancobogota",
    "nombre": "Banco de Bogotá",
    "codigo": "1001",
    "icono": "/bancobogota_icon.png",
    "tipo": "banco"
  },
  {
    "id": "bancolombia",
    "nombre": "Bancolombia",
    "codigo": "1007",
    "icono": "/bancolombia_icon.jpg",
    "tipo": "banco"
  },
  {
    "id": "davivienda",
    "nombre": "Davivienda",
    "codigo": "1051",
    "icono": "/davivienda_icon.png",
    "tipo": "banco"
  },
  {
    "id": "bbva",
    "nombre": "BBVA Colombia",
    "codigo": "1013",
    "icono": "/bbva_icon.png",
    "tipo": "banco"
  },
  {
    "id": "nu",
    "nombre": "Nu Colombia",
    "codigo": "1552",
    "icono": "/nubank_icon.png",
    "tipo": "banco"
  },
  {
    "id": "bancow",
    "nombre": "Banco W",
    "codigo": "1062",
    "icono": "/bancow_icon.png",
    "tipo": "banco"
  }
]
```

---

## 5. Medios de Pago del Usuario

Alimenta la selección de métodos de pago en el **Paso 2 de PagarFacturaScreen**. Orden prioritario esperado por la aplicación:
1. Microcrédito Banco W
2. Saldo en mi cuenta Banco W
3. Llaves inscritas Bre-B
4. Efectivo

* **Método:** `GET`
* **Endpoint:** `/api/medios-pago`

### Esquema de Datos que debe devolver el Backend (Response 200 OK)
```json
[
  {
    "id": "microcredito-bancow",
    "bancoId": "bancow",
    "nombre": "Microcrédito banco W",
    "icono": "/bancow_icon.png",
    "tipo": "microcredito",
    "saldoDisponible": "$2,500,000.00"
  },
  {
    "id": "bolsillo-3",
    "bancoId": "bolsillo",
    "nombre": "Saldo en mi cuenta banco W",
    "icono": "/bancow_icon.png",
    "tipo": "bolsillo",
    "saldoDisponible": "$157,433.58"
  },
  {
    "id": "nequi-1",
    "bancoId": "nequi",
    "nombre": "Nequi",
    "icono": "/nequi_icon.png",
    "tipo": "llave",
    "valorLlave": "311 387 7395",
    "tipoLlave": "celular",
    "fechaInscripcion": "12 Ene 2025",
    "esPrincipal": true
  },
  {
    "id": "bogota-2",
    "bancoId": "bancobogota",
    "nombre": "Banco de Bogotá",
    "icono": "/bancobogota_icon.png",
    "tipo": "llave",
    "valorLlave": "10073598",
    "tipoLlave": "documento",
    "fechaInscripcion": "04 Feb 2025",
    "esPrincipal": false
  },
  {
    "id": "efectivo-bancow",
    "bancoId": "efectivo",
    "nombre": "Efectivo",
    "icono": "/billete_icon.svg",
    "tipo": "efectivo",
    "descripcion": "Pago directo en efectivo"
  }
]
```

---

## 6. Gestión de Llaves Bre-B

Pantalla **`MisLlavesScreen`**. Permite administrar las llaves interoperables.

### 6.1 Inscribir nueva llave
* **Método:** `POST`
* **Endpoint:** `/api/llaves`

#### Request Body
```json
{
  "bancoId": "bancolombia",
  "valorLlave": "3101234567",
  "tipoLlave": "celular"
}
```
*(Valores permitidos para `tipoLlave`: `"celular" | "documento" | "correo" | "codigo"`)*

#### Response (201 Created)
```json
{
  "id": "bancolombia-1741876543210",
  "bancoId": "bancolombia",
  "nombre": "Bancolombia",
  "icono": "/bancolombia_icon.jpg",
  "tipo": "llave",
  "valorLlave": "310 123 4567",
  "tipoLlave": "celular",
  "fechaInscripcion": "13 Ago 2026",
  "esPrincipal": false
}
```

---

### 6.2 Actualizar llave
* **Método:** `PUT`
* **Endpoint:** `/api/llaves/:id` (ej: `/api/llaves/nequi-1`)

#### Request Body
```json
{
  "valorLlave": "3119998877",
  "tipoLlave": "celular",
  "bancoId": "nequi"
}
```

#### Response (200 OK)
```json
{
  "id": "nequi-1",
  "bancoId": "nequi",
  "nombre": "Nequi",
  "icono": "/nequi_icon.png",
  "tipo": "llave",
  "valorLlave": "311 999 8877",
  "tipoLlave": "celular",
  "fechaInscripcion": "12 Ene 2025",
  "esPrincipal": true
}
```

---

### 6.3 Establecer llave como principal
* **Método:** `PATCH`
* **Endpoint:** `/api/llaves/:id/principal` (ej: `/api/llaves/bogota-2/principal`)

#### Response (200 OK)
```json
{
  "success": true,
  "idPrincipal": "bogota-2",
  "mensaje": "Llave establecida como principal para recepción de pagos"
}
```

---

### 6.4 Desvincular / Eliminar llave
* **Método:** `DELETE`
* **Endpoint:** `/api/llaves/:id` (ej: `/api/llaves/bogota-2`)

#### Response (200 OK)
```json
{
  "success": true,
  "mensaje": "Llave desvinculada exitosamente"
}
```

---

## 7. Procesamiento de Pago de Factura

Disparado al pulsar el botón **"Pagar Factura"** en `PagarFacturaScreen`.

* **Método:** `POST`
* **Endpoint:** `/api/pagos`

### Lo que envía el Frontend (Request)
```json
{
  "idFactura": "9868497",
  "medioPagoId": "nequi-1",
  "tipoPago": "total",
  "valor": 125632,
  "valorFormateado": "$125.632"
}
```
*(Si `tipoPago` es `"otro"`, se envía el valor personalizado digitado por el usuario).*

### Esquema de Datos que debe devolver el Backend (Response 200 OK)
```json
{
  "success": true,
  "idTransaccion": "TXN-9868497-20260813",
  "idFactura": "9868497",
  "valor": "$125.632",
  "subtotal": "$105.573",
  "iva": "$20.059",
  "empresa": "Alpina Productos Alimenticios S.A.",
  "nitEmpresa": "NIT 860.025.900-1",
  "pagador": "Miscelanea Rin-Rin",
  "nitPagador": "CC 1.020.345.678",
  "medioPago": "Nequi",
  "fechaHora": "13 Ago 2026 11:35am",
  "estado": "APROBADA",
  "referenciaPago": "REF-ALP-9868497",
  "descripcion": "Pago de pedido de lácteos y derivados"
}
```

---

## 8. Consulta de Comprobante / Factura Individual

Se utiliza en **`PagoRecibido`**, **`TransaccionAprob`** y cuando **otro teléfono escanea el código QR**.

* **Método:** `GET`
* **Endpoint:** `/api/facturas/:idFactura`  
* **Ejemplo real:** `GET https://enlace-crm.com:8081/api/facturas/9868497`

### Esquema de Datos que debe devolver el Backend (Response 200 OK)
```json
{
  "idFactura": "9868497",
  "valor": "$125.632",
  "subtotal": "$105.573",
  "iva": "$20.059",
  "empresa": "Alpina Productos Alimenticios S.A.",
  "nitEmpresa": "NIT 860.025.900-1",
  "pagador": "Miscelanea Rin-Rin",
  "nitPagador": "CC 1.020.345.678",
  "medioPago": "Llave Bre-B (Bancolombia)",
  "fechaHora": "13 Ago 2026 11:35am",
  "estado": "APROBADA",
  "referenciaPago": "REF-ALP-9868497",
  "descripcion": "Pago de pedido de lácteos y derivados"
}
```

### Respuesta en caso de Error / Factura no encontrada (Response 404 Not Found)
```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "No se encontró ninguna factura registrada con el ID #9868497"
}
```

---

## 9. Historial de Movimientos Realizados

Alimenta la pestaña **"Movimientos"** (`MovimientosScreen`) mostrando todos los pagos realizados por el comercio.

* **Método:** `GET`
* **Endpoint:** `/api/movimientos`
* **Query Params opcionales:** `?empresa=Alpina&fechaDesde=2026-08-01&fechaHasta=2026-08-31`

### Esquema de Datos que debe devolver el Backend (Response 200 OK)
```json
{
  "success": true,
  "totalPagado": "$874.393",
  "totalPagadoNumeric": 874393,
  "movimientos": [
    {
      "idFactura": "9868497",
      "valor": "$125.632",
      "subtotal": "$105.573",
      "iva": "$20.059",
      "empresa": "Alpina Productos Alimenticios S.A.",
      "nitEmpresa": "NIT 860.025.900-1",
      "pagador": "Miscelanea Rin-Rin",
      "nitPagador": "CC 1.020.345.678",
      "medioPago": "Llave Bre-B (Bancolombia)",
      "fechaHora": "13 Ago 2026 11:35am",
      "estado": "APROBADA",
      "referenciaPago": "REF-ALP-9868497",
      "descripcion": "Pago de pedido de lácteos y derivados"
    },
    {
      "idFactura": "8721340",
      "valor": "$145.200",
      "subtotal": "$122.016",
      "iva": "$23.184",
      "empresa": "Grupo Nutresa S.A.",
      "nitEmpresa": "NIT 890.900.050-1",
      "pagador": "Miscelanea Rin-Rin",
      "nitPagador": "CC 1.020.345.678",
      "medioPago": "Llave Bre-B (Banco de Bogotá)",
      "fechaHora": "13 Ago 2026 11:20am",
      "estado": "APROBADA",
      "referenciaPago": "REF-NUT-8721340",
      "descripcion": "Galletas, chocolates y café"
    },
    {
      "idFactura": "5432101",
      "valor": "$263.765",
      "subtotal": "$221.651",
      "iva": "$42.114",
      "empresa": "Postobón S.A.",
      "nitEmpresa": "NIT 890.903.939-5",
      "pagador": "Miscelanea Rin-Rin",
      "nitPagador": "CC 1.020.345.678",
      "medioPago": "Bolsillo Enlace",
      "fechaHora": "11 Ago 2026 09:15am",
      "estado": "APROBADA",
      "referenciaPago": "REF-POS-5432101",
      "descripcion": "Bebidas gaseosas y jugos"
    }
  ]
}
```

---

## 10. Notificación de Comprobante vía WhatsApp

Utilizado en `transaccionAprob.tsx` para enviar el comprobante directamente al WhatsApp del comprador o proveedor.

* **Método:** `POST`
* **Endpoint:** `https://enlace-crm.com:3000/backend/whatsapp/send-message`
* **Headers:** `Content-Type: application/json`

### Lo que envía el Frontend (Request)
```json
{
  "number": "573113877395",
  "message": "Miscelanea Rin-Rin envío un pago de la factura 9868497 por el valor de $ 125.632 el día 13/08/2026 a la hora 11:35am"
}
```
*(El número debe contener el código de país `57` seguido de los 10 dígitos del móvil).*

### Esquema de Datos que debe devolver el Backend (Response 200 OK)
```json
{
  "success": true,
  "message": "Mensaje enviado exitosamente"
}
```

### Respuesta en caso de error (Response 400 / 500)
```json
{
  "success": false,
  "message": "Error al conectar con la sesión de WhatsApp o número no registrado"
}
```

---

## 💡 Resumen de Tipos TypeScript Utilizados en el Frontend

Para referencia de los desarrolladores del backend, estas son las interfaces TypeScript activas en el proyecto:

```typescript
// 1. Factura o Comprobante
export interface DetalleFactura {
  idFactura: string;
  valor: string;
  subtotal?: string;
  iva?: string;
  empresa: string;
  nitEmpresa?: string;
  pagador: string;
  nitPagador?: string;
  medioPago: string;
  fechaHora: string;
  estado: 'APROBADA' | 'PAGADA' | 'PENDIENTE' | 'RECHAZADA';
  referenciaPago: string;
  descripcion?: string;
}

// 2. Medios de Pago y Llaves Bre-B
export type TipoLlave = 'celular' | 'documento' | 'correo' | 'codigo';

export interface MedioDePago {
  id: string;
  bancoId: string;
  nombre: string;
  icono: string;
  tipo: 'llave' | 'bolsillo' | 'efectivo' | 'microcredito';
  valorLlave?: string;
  saldoDisponible?: string;
  cupoDisponible?: string;
  tipoLlave?: TipoLlave;
  fechaInscripcion?: string;
  esPrincipal?: boolean;
  descripcion?: string;
}

// 3. Entidad Financiera
export interface Banco {
  id: string;
  nombre: string;
  codigo: string; 
  icono: string;
  tipo?: 'banco' | 'billetera';
}
```
