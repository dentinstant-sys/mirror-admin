// app/api/notificar-pedido/route.ts
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

// Inicializar Firebase Admin de forma segura (evita reinicializaciones)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: Request) {
  try {
    const { orderId, nombreCliente, total } = await request.json();

    // 1. Obtener los tokens de los administradores guardados en Firestore
    const tokensSnap = await admin.firestore().collection('admin_tokens').get();
    const tokens = tokensSnap.docs.map(doc => doc.id);

    if (tokens.length === 0) {
      return NextResponse.json({ message: 'No hay administradores suscritos.' }, { status: 200 });
    }

    // 2. Construir el mensaje para Firebase Admin
    const message = {
      notification: {
        title: '🛍️ ¡Nuevo pedido recibido!',
        body: `Orden #${orderId} de ${nombreCliente} por $${total?.toLocaleString('es-CO')} COP`,
      },
      tokens: tokens, // admin.messaging().sendMulticast acepta un array de tokens directamente
    };

    // 3. Enviar notificación masiva mediante el servicio de administración
    const response = await admin.messaging().sendEachForMulticast(message);

    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error('Error enviando Push:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}