import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

//preuba
function initAdmin() {
  if (!admin.apps.length) {
    if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Las credenciales de Firebase Admin no están configuradas en las variables de entorno.');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        // Usamos la variable de entorno o respaldamos directamente con el ID de tu proyecto
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'maison-mirror-1ab5b',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

export async function POST(request: Request) {
  try {
    initAdmin();

    const { orderId, nombreCliente, total } = await request.json();

    const tokensSnap = await admin.firestore().collection('admin_tokens').get();
    const tokens = tokensSnap.docs.map(doc => doc.id);

    if (tokens.length === 0) {
      console.warn('No hay tokens de administrador registrados en Firestore.');
      return NextResponse.json({ message: 'No hay administradores suscritos.' }, { status: 200 });
    }

    const message = {
      notification: {
        title: '🛍️ ¡Nuevo pedido recibido!',
        body: `Orden #${orderId} de ${nombreCliente} por $${total?.toLocaleString('es-CO')} COP`,
      },
      tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`Notificaciones enviadas. Exitosas: ${response.successCount}, Fallidas: ${response.failureCount}`);
    
    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error('Error detallado enviando Push:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}