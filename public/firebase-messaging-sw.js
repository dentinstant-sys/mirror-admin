// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBw2kCw9bvaBq8QsAaSxF2VkkKhaZ8WAqg",
    authDomain: "maison-mirror-1ab5b.firebaseapp.com",
    projectId: "maison-mirror-1ab5b",
    storageBucket: "maison-mirror-1ab5b.firebasestorage.app",
    messagingSenderId: "33315771783",
    appId: "1:33315771783:web:22733677650f80995d6f22",
    measurementId: "G-RZ3ZVV4681"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Recibir notificaciones cuando la pestaña está cerrada o en segundo plano
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.notification.title || '¡Nuevo Pedido en Decoespejos!';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon.png', // asegúrate de tener una imagen en public/icon.png
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});