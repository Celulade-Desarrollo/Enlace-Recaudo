const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

// Ejecuta los servicios originales sin navegador ni escrituras reales.
function crearEntorno() {
  const raiz = path.resolve(__dirname, '..');
  const datos = new Map();
  const cache = new Map();
  let claveBloqueada;
  const contexto = vm.createContext({
    console, Date, Intl,
    localStorage: {
      getItem: (clave) => datos.get(clave) ?? null,
      removeItem: (clave) => datos.delete(clave),
      setItem: (clave, valor) => {
        if (clave === claveBloqueada) throw new Error('Almacenamiento no disponible');
        datos.set(clave, String(valor));
      }
    }
  });
  function cargar(relativo) {
    const archivo = path.resolve(raiz, relativo);
    if (cache.has(archivo)) return cache.get(archivo).exports;
    const modulo = { exports: {} };
    cache.set(archivo, modulo);
    const codigo = ts.transpileModule(fs.readFileSync(archivo, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2023 }
    }).outputText;
    vm.runInContext(`(function(require,module,exports){${codigo}\n})`, contexto, { filename: archivo })(
      (nombre) => cargar(path.relative(raiz, path.resolve(path.dirname(archivo), `${nombre}.ts`))),
      modulo, modulo.exports
    );
    return modulo.exports;
  }
  return {
    servicio: cargar('src/services/transportistaService.ts').transportistaService,
    productos: cargar('src/services/productosService.ts'),
    datos,
    bloquear: (clave) => { claveBloqueada = clave; }
  };
}

test('todos los detalles de la ruta conservan exactamente el saldo original', () => {
  const { servicio, productos } = crearEntorno();
  const pendientes = servicio.getTiendasRuta().filter((tienda) => tienda.estado === 'pendiente');
  for (const tienda of pendientes) {
    const facturas = servicio.getPrefacturasByTienda(tienda.id);
    for (const factura of facturas) {
      assert.equal(factura.productos.length, 4);
      assert.equal(productos.totalProductos(factura.productos), factura.saldoTotalNum);
    }
    assert.equal(facturas.reduce((total, factura) => total + factura.saldoTotalNum, 0), tienda.saldoTotalNum);
  }
});

test('editar de 2 a 1 Alpinito recalcula 160.975 sin alterar el catálogo ni persistir el borrador', () => {
  const { servicio, productos, datos } = crearEntorno();
  const original = servicio.getPrefacturasByTienda('frescura')[0];
  const editada = productos.actualizarProductos(original, original.productos.map((p, i) => i === 0 ? { ...p, cantidad: 1 } : p));
  assert.equal(editada.saldoTotalNum, 160975);
  assert.equal(editada.saldoTotal, '$160.975');
  assert.equal(editada.esFacturaModificada, true);
  assert.equal(original.productos[0].cantidad, 2);
  assert.equal(servicio.getPrefacturasByTienda('frescura')[0].saldoTotalNum, 177200);
  assert.equal(datos.size, 0);
});

test('restaurar las cantidades originales retira la marca de factura modificada', () => {
  const { servicio, productos } = crearEntorno();
  const original = servicio.getPrefacturasByTienda('frescura')[0];
  const editada = productos.actualizarProductos(original, original.productos.map((p, i) => i === 0 ? { ...p, cantidad: 3 } : p));
  const restaurada = productos.actualizarProductos(editada, editada.productosOriginales);
  assert.equal(restaurada.saldoTotalNum, 177200);
  assert.equal(restaurada.esFacturaModificada, false);
});

test('eliminar y deshacer incluye el producto completo en el total', () => {
  const { servicio, productos } = crearEntorno();
  const original = servicio.getPrefacturasByTienda('frescura')[0];
  const sinAlpinito = productos.actualizarProductos(original, original.productos.slice(1));
  assert.equal(sinAlpinito.saldoTotalNum, 144750);
  assert.equal(sinAlpinito.esFacturaModificada, true);
  const restaurada = productos.actualizarProductos(sinAlpinito, original.productos);
  assert.equal(restaurada.saldoTotalNum, 177200);
  assert.equal(restaurada.esFacturaModificada, false);
});

test('rechaza cantidades cero, negativas, fraccionarias o fuera de límite', () => {
  const { servicio, productos } = crearEntorno();
  const original = servicio.getPrefacturasByTienda('frescura')[0];
  for (const cantidad of [0, -1, 1.5, 10000, NaN, Infinity]) {
    assert.throws(() => productos.actualizarProductos(original, [{ ...original.productos[0], cantidad }]));
  }
  const vacia = productos.actualizarProductos(original, []);
  assert.equal(vacia.saldoTotalNum, 0);
  assert.throws(() => servicio.guardarPrefactura('frescura', vacia));
});

test('generar guarda productos, nuevo saldo y bandera sin tocar otras facturas', () => {
  const { servicio, productos, datos } = crearEntorno();
  const original = servicio.getPrefacturasByTienda('frescura')[0];
  const editada = productos.actualizarProductos(original, original.productos.map((p, i) => i === 0 ? { ...p, cantidad: 1 } : p));
  servicio.guardarPrefactura('frescura', editada);
  const guardadas = servicio.getPrefacturasByTienda('frescura');
  assert.equal(guardadas[0].productos[0].cantidad, 1);
  assert.equal(guardadas[0].valorOriginalNum, 177200);
  assert.equal(guardadas[0].esFacturaModificada, true);
  assert.equal(guardadas[1].saldoTotalNum, 267500);
  assert.equal(servicio.getTiendaById('frescura').saldoTotalNum, 773675);
  assert.equal(servicio.getTiendaById('frescura').estado, 'pendiente');
  assert.ok(datos.has('enlace_transportista_prefacturas'));
  servicio.guardarPrefactura('frescura', editada);
  assert.equal(servicio.getTiendaById('frescura').saldoTotalNum, 773675);
});

test('si falla el guardado no deja el saldo de la ruta parcialmente actualizado', () => {
  const { servicio, productos, datos, bloquear } = crearEntorno();
  const original = servicio.getPrefacturasByTienda('frescura')[0];
  const editada = productos.actualizarProductos(original, original.productos.slice(1));
  bloquear('enlace_transportista_prefacturas');
  assert.throws(() => servicio.guardarPrefactura('frescura', editada));
  assert.equal(servicio.getTiendaById('frescura').saldoTotalNum, 789900);
  assert.equal(datos.has('enlace_transportista_rutas'), false);
});

test('una factura sin detalle conocido conserva su valor y puede seguir al cobro', () => {
  const { servicio, productos } = crearEntorno();
  const original = servicio.getPrefacturasByTienda('frescura')[0];
  const sinDetalle = productos.prepararPrefactura({ ...original, saldoTotalNum: 123, saldoTotal: '$123', productos: undefined, productosOriginales: undefined });
  assert.equal(sinDetalle.productos.length, 0);
  assert.equal(sinDetalle.saldoTotalNum, 123);
  servicio.guardarPrefactura('frescura', sinDetalle);
  assert.equal(servicio.getPrefacturasByTienda('frescura')[0].saldoTotalNum, 123);
});
