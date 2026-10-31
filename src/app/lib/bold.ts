/**
 * Todo lo que el navegador supone sobre el checkout de Bold vive aquí.
 * El cobro llega firmado del servidor: la llave secreta nunca pasa por el navegador.
 */

export const URL_LIBRERIA_BOLD = 'https://checkout.bold.co/library/boldPaymentButton.js';

/** Forma del cobro que devuelve /api/checkout/bold (reemplaza a DatosCobroBold de @clasicol/shared). */
export interface DatosCobroBold {
  referencia: string;
  moneda: string;
  monto: number;
  llaveIdentidad: string;
  firmaIntegridad: string;
  descripcion: string;
  urlRetorno: string;
  modoApertura: 'embedded' | 'redirect';
  expiraEn: string; // fecha ISO
}

/**
 * La tabla de atributos de Bold dice nanosegundos. Se envía en nanosegundos:
 * si Bold esperara milisegundos, el cobro quedaría sin vencer, no al revés.
 */
export function expiracionParaBold(expiraEn: Date): number {
  return expiraEn.getTime() * 1_000_000;
}

/**
 * ¿Bold devolvió al cliente diciendo que el pago sigue en proceso?
 * Lee bold-tx-status de la dirección de retorno. Solo informa: lo que decide es el webhook.
 */
export function boldDiceEnProceso(buscar: string): boolean {
  const estado = new URLSearchParams(buscar).get('bold-tx-status')?.toLowerCase();
  return estado === 'pending' || estado === 'processing';
}

export function configuracionBoldCheckout(cobro: DatosCobroBold): Record<string, string | number> {
  return {
    orderId: cobro.referencia,
    currency: cobro.moneda,
    amount: String(cobro.monto),
    apiKey: cobro.llaveIdentidad,
    integritySignature: cobro.firmaIntegridad,
    description: cobro.descripcion,
    redirectionUrl: cobro.urlRetorno,
    renderMode: cobro.modoApertura,
    expirationDate: expiracionParaBold(new Date(cobro.expiraEn)),
  };
}

function cargarScript(): Promise<void> {
  return new Promise((resolver, rechazar) => {
    const script = document.createElement('script');
    script.src = URL_LIBRERIA_BOLD;
    script.async = true;
    script.onload = () => resolver();
    script.onerror = () => rechazar(new Error('La librería de Bold no cargó.'));
    document.head.appendChild(script);
  });
}

/** La librería se carga una sola vez por página; si falla, el siguiente intento la vuelve a pedir. */
let carga: Promise<void> | null = null;

function cargarLibreria(cargar: () => Promise<void>): Promise<void> {
  carga ??= cargar().catch((error: unknown) => {
    carga = null;
    throw error;
  });
  return carga;
}

type ConstructorBold = new (configuracion: Record<string, string | number>) => { open(): void };

export async function abrirCheckoutBold(
  cobro: DatosCobroBold,
  cargar: () => Promise<void> = cargarScript,
): Promise<'abierto' | 'no_abrio'> {
  if (typeof window === 'undefined') return 'no_abrio';
  try {
    await cargarLibreria(cargar);
    const BoldCheckout = (window as unknown as { BoldCheckout?: ConstructorBold }).BoldCheckout;
    if (BoldCheckout === undefined) {
      // Cargó pero no definió BoldCheckout: el siguiente intento la vuelve a pedir.
      carga = null;
      return 'no_abrio';
    }
    new BoldCheckout(configuracionBoldCheckout(cobro)).open();
    return 'abierto';
  } catch {
    return 'no_abrio';
  }
}