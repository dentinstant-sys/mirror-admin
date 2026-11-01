// src/app/api/notificar-pedido/route.ts
import { NextResponse } from 'next/server';
import * as admin from 'firebase-admin';

function initAdmin() {
  if (!admin.apps.length) {
    // Si estamos en entorno de compilación y faltan las credenciales, evitamos que rompa el build
    if (!process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('Las credenciales de Firebase Admin no están configuradas en las variables de entorno.');
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
}

export async function POST(request: Request) {
  try {
    // Inicializar de manera segura en tiempo de ejecución
    initAdmin();

    const { orderId, nombreCliente, total } = await request.json();

    const tokensSnap = await admin.firestore().collection('admin_tokens').get();
    const tokens = tokensSnap.docs.map(doc => doc.id);

    if (tokens.length === 0) {
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
    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error('Error enviando Push:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}