# Enlace CRM - Especificación de Pago de Facturas: Rol Transportista (Alpina / Amovil)

Este documento define el **flujo exacto**, los **endpoints** y la **matriz de datos** para el cobro y pago de facturas en ruta por parte del **Transportista**. 

Toda la información del cliente y sus facturas proviene de la API oficial de **Alpina (Gateway Amovil)**. Los datos adicionales que no entregue Amovil se **simulan en el backend de iris**.

---

## Matriz de Origen de Datos (¿De dónde sale cada campo?)

Esta tabla le indica al desarrollador del backend de dónde se extrae cada dato o si debe **simularse / calcularse**:

| Campo de la App / Comprobante | Tipo | ¿Viene de Amovil? | Origen Exacto | Si NO viene de Amovil: Regla para Simular en Backend |
| :--- | :---: | :---: | :--- | :--- |
| **`nbAgenteComercial`** | `string` | Sí (Indirecto) | Parámetro URL Deep Link | Se extrae del query param de la URL. |
| **`nbCliente`** | `string` | Sí (Indirecto) | Parámetro URL Deep Link | Se extrae del query param de la URL. |
| **`clienteId`** | `string` | **Sí** | `POST /clients/bancoW` (`clienteId`) | - |
| **`pagador`** (Nombre cliente) | `string` | **Sí** | `POST /clients/bancoW` (`nombre` + `apellido`) | Concatenar: `"LUIS DARIO SANCHEZ FUENTES"`. |
| **`nitPagador`** (Documento) | `string` | **Sí** | `POST /clients/bancoW` (`documento`) | Formatear con prefijo: `"CC " + documento`. |
| **`ciudad`** / **`departamento`**| `string` | **Sí** | `POST /clients/bancoW` (`ciudad`, `departamento`) | - |
| **`idFactura`** (Número Factura)| `string` | **Sí** | `POST /historical/bancoW` (`factura`) | Ej: `"1301373"`. |
| **`valor`** (Total Factura) | `number` | **Sí** | `POST /historical/bancoW` (`valor`) | Monto numérico original (ej: `136804`). |
| **`valorFormateado`** | `string` | **No** | Calculado en Frontend / Backend | Formatear a moneda colombiana: `"$136.804"`. |
| **`subtotal`** | `string` | **No** | **Simular / Calcular** | `Math.round(valor / 1.19)` (ej: `"$114.961"`). |
| **`iva`** | `string` | **No** | **Simular / Calcular** | `valor - subtotal` (ej: `"$21.843"`). |
| **`empresa`** | `string` | **No** | **Fijo en Backend** | Fijo: `"Alpina Productos Alimenticios S.A."`. |
| **`nitEmpresa`** | `string` | **No** | **Fijo en Backend** | Fijo: `"NIT 860.025.900-1"`. |
| **`descripcion`** | `string` | **No** | **Simular en Backend** | Fijo: `"Entrega y pago de pedido lácteos Alpina"`. |
| **`medioPago`** | `string` | **No** | Selección del usuario en UI | `"Llave Bre-B (Nequi)"`, `"Efectivo"`, o `"Bolsillo"`. |
| **`estado`** | `string` | **No** | **Simular en Backend** | Retornar siempre `"APROBADA"`. |
| **`idTransaccion`** | `string` | **No** | **Generar en Backend** | Generar `"TXN-ALP-" + factura + "-" + timestamp`. |
| **`referenciaPago`** | `string` | **No** | **Generar en Backend** | Generar `"REF-ALP-" + factura`. |
| **`fechaHora`** | `string` | **No** | **Generar en Backend** | Fecha y hora actual de Colombia (ej: `"13 Ago 2026 15:10"`). |

---

## Especificación Técnica de los Endpoints

### Paso 1: Autenticación con Gateway Amovil
* **Método:** `POST`
* **URL:** `https://qa-client-gateway-general.amovil.com.co:42281/auth`

#### Request Body
```json
{
  "username": "alpina",
  "password": "en_documento*"
}
```

#### Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
*(Este token se envía en el header `Authorization: Bearer <token>` de los pasos 2 y 3).*

---

### Paso 2: Consulta del Cliente
* **Método:** `POST`
* **URL:** `https://qa-client-gateway-general.amovil.com.co:42281/clients/bancoW`
* **Headers:** `Authorization: Bearer <token>`

#### Request Body (usando los datos de la URL del Paso 0)
```json
{
  "nbAgenteComercial": "114920",
  "nbCliente": "102805"
}
```

#### Response (200 OK)
```json
{
  "data": [
    {
      "clienteId": "102805",
      "documento": "1100975561",
      "nombre": "LUIS DARIO",
      "apellido": "SANCHEZ FUENTES",
      "departamento": "SANTANDER",
      "ciudad": "BARRANCABERMEJA"
    }
  ],
  "total": 1,
  "totalPages": 1,
  "currentPage": 1
}
```

---

### Paso 3: Consulta de Facturas / Pedidos Vigentes
* **Método:** `POST`
* **URL:** `https://qa-client-gateway-general.amovil.com.co:42281/historical/bancoW`
* **Headers:** `Authorization: Bearer <token>`

#### Request Body
```json
{
  "nbAgenteComercial": "114920",
  "nbCliente": "8100030469"
}
```

#### Response (200 OK)
```json
{
  "data": [
    {
      "clienteId": "8100030469",
      "documento": "28**97",
      "factura": "1297660",
      "valor": 28010
    },
    {
      "clienteId": "8100030469",
      "documento": "28**97",
      "factura": "1301373",
      "valor": 136804
    }
  ],
  "total": 2,
  "totalPages": 1,
  "currentPage": 1
}
```

---

### Paso 4: Selección en Pantalla (Frontend)
El transportista ve las facturas del cliente en la interfaz:
1. Elige la factura a pagar (ej: `#1301373` por `$136.804`).
2. Elige el medio de pago: **Llave Bre-B**, **Efectivo** o **Saldo en cuenta**.
3. Presiona el botón **"Pagar Factura"**.

---

### Paso 5: Procesar Pago Simulado (Backend Simulado Enlace CRM)
Este es el endpoint que debe construir el backend simulado para registrar la transacción y devolver el comprobante:

* **Método:** `POST`
* **URL:** `https://enlace-crm.com:3000/iris/api/pagos`

#### Request Body que envía el Frontend:
```json
{
  "idFactura": "1301373",
  "idTransportista": "TRN-1234567890",
  "nbAgenteComercial": "114920",
  "nbCliente": "8100030469",
  "medioPago": "Llave Bre-B (Nequi)",
  "esPagoCompleto": true,
  "esPagoParcial": false, 
  "tipoPago": "Digital",
  "valor": 136804,
  "esFacturaModificada": false, // Si es true es porque se eliminaron productos de la factura
  "pagadorNombre": "LUIS DARIO SANCHEZ FUENTES",
  "pagadorDocumento": "1100975561",
}
```

#### Response que debe devolver el Backend Simulado (200 OK):
El backend calcula el IVA, subtotal y genera la transacción aprobada:
```json
{
  "success": true,
  "idTransaccion": "TXN-ALP-1301373-8942",
  "idFactura": "1301373",
  "valor": "$136.804",
  "subtotal": "$114.961",
  "iva": "$21.843",  // Si lo requiere y más adelante hay acceso a este dato
  "empresa": "Alpina Productos Alimenticios S.A.",
  "nitEmpresa": "NIT 860.025.900-1",// Si lo requiere y más adelante hay acceso a este dato
  "pagador": "LUIS DARIO SANCHEZ FUENTES",
  "medioPago": "Llave Bre-B (Nequi)",
  "esPagoCompleto": true,
  "esPagoParcial": false, 
  "tipoPago": "Digital",
  "fechaHora": "13 Ago 2026 15:10", // Con formato
  "estado": "APROBADA",
  "referenciaPago": "REF-ALP-1301373",
  "descripcion": "Entrega y pago de pedido lácteos Alpina"
  
}
```

---

### Paso 6: Consulta de Comprobante / Escaneo QR
Permite ver o descargar el comprobante cuando se lee el código QR generado:

* **Método:** `GET`
* **URL:** `https://enlace-crm.com:3000/backend/api/facturas/:idFactura` (ej: `/backend/api/facturas/1301373`)

#### Response que debe devolver el Backend Simulado (200 OK):
```json
{
  "idFactura": "1301373",
  "valor": "$136.804",
  "subtotal": "$114.961",
  "iva": "$21.843",
  "empresa": "Alpina Productos Alimenticios S.A.",
  "nitEmpresa": "NIT 860.025.900-1",
  "pagador": "LUIS DARIO SANCHEZ FUENTES",
  "nitPagador": "CC 1.100.975.561",
  "medioPago": "Llave Bre-B (Nequi)",
  "esPagoCompleto": true,
  "esPagoParcial": false, 
  "tipoPago": "Digital",
  "fechaHora": "13 Ago 2026 15:10",
  "estado": "APROBADA",
  "referenciaPago": "REF-ALP-1301373",
  "descripcion": "Entrega y pago de pedido lácteos Alpina"
}
```

---

### Paso 7: Envío de Comprobante por WhatsApp
* **Método:** `POST`
* **URL:** `https://enlace-crm.com:3000/backend/whatsapp/send-message`

#### Request Body:
```json
{
  "number": "573113877395",
  "message": "LUIS DARIO SANCHEZ FUENTES envío un pago de la factura 1301373 por el valor de $ 136.804 el día 13/08/2026 a la hora 3:10pm. Comprobante: https://app.enlacecrm.com:8081/factura/1301373"
}
```

#### Response (200 OK):
```json
{
  "success": true,
  "message": "Mensaje enviado exitosamente"
}
```
