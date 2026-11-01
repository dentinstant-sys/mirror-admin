const admin = require('firebase-admin');
const serviceAccount = require('./maison.json'); // Carga el archivo que acabas de descargar

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

async function enviarPrueba() {
  // Pega aquí un token real copiado de tu colección 'admin_tokens' en Firestore
  const tokenFCM = 'fntoRjkPEjf4fZh0CiaRcA:APA91bEbYiRGwhjWCKyMdytZA26oLHi5HPte9sRaV_AhjuDHoKrb60a_6nNAlAp5tlinacf7JvZBKe4FHJ7rs7zpFGOuZE6f7aQxRt-FGzj4P_EEewzW4-Y'; 

  const message = {
    token: tokenFCM,
    notification: {
      title: 'Prueba desde el script',
      body: 'Si ves esto, FCM y el navegador funcionan perfectamente.',
    },
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('¡Notificación enviada con éxito por Google!', response);
  } catch (error) {
    console.error('Error al enviar la notificación:', error);
  }
}

enviarPrueba();