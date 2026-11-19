const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function crearEntorno() {
  const raiz = path.resolve(__dirname, '..');
  const datos = new Map();
  const cache = new Map();
  const contexto = vm.createContext({
    console, Date, Intl,
    localStorage: {
      getItem: (clave) => datos.get(clave) ?? null,
      removeItem: (clave) => datos.delete(clave),
      setItem: (clave, valor) => {
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
    datos
  };
}

test('el resumen de ruta inicial calcula correctamente totales, efectivo y digital', () => {
  const { servicio } = crearEntorno();
  const resumen = servicio.getResumenRutaDetallado();

  assert.equal(resumen.totalTiendas, 16);
  assert.equal(resumen.tiendasVisitadas, 10);
  assert.equal(resumen.tiendasPendientes, 6);
  assert.equal(resumen.totalRecaudado, 4886000);
  assert.equal(resumen.totalPendiente, 6573245);
  assert.equal(resumen.totalAsignado, 11459245);
  assert.equal(resumen.totalEfectivo, 1940700);
  assert.equal(resumen.totalDigital, 2945300);
  assert.equal(resumen.totalEfectivo + resumen.totalDigital, resumen.totalRecaudado);
  assert.equal(resumen.porcentajeVisitadas, 63);
  assert.equal(resumen.cierre, null);
});

test('registrar un pago detallado actualiza el arqueo en efectivo y el recaudo', () => {
  const { servicio } = crearEntorno();
  // Cobrar Tiendas Frescura con pago en efectivo
  servicio.registrarPagoFacturaDetallado('frescura', '9868499', '$789.900', {
    tipo: 'efectivo',
    montoEfectivo: 789900
  });

  const resumen = servicio.getResumenRutaDetallado();
  assert.equal(resumen.tiendasVisitadas, 11);
  assert.equal(resumen.tiendasPendientes, 5);
  assert.equal(resumen.totalRecaudado, 4886000 + 789900);
  assert.equal(resumen.totalEfectivo, 1940700 + 789900);
  assert.equal(resumen.totalDigital, 2945300);
});

test('realizar cierre de ruta guarda acta con folio y permite reabrir', () => {
  const { servicio, datos } = crearEntorno();
  const acta = servicio.realizarCierreRuta('Ruta cerrada con entrega completa de valores.');

  assert.ok(acta.id.startsWith('CRD-'));
  assert.equal(acta.cerrada, true);
  assert.equal(acta.transportista, 'Leonardo Moreno');
  assert.equal(acta.totalRecaudado, 4886000);
  assert.ok(datos.has('enlace_transportista_cierre_ruta'));

  const guardado = servicio.getCierreRuta();
  assert.equal(guardado.id, acta.id);
  assert.equal(guardado.cerrada, true);

  servicio.reabrirRuta();
  assert.equal(servicio.getCierreRuta(), null);
  assert.equal(servicio.getResumenRutaDetallado().cierre, null);
});

