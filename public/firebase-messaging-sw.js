importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyC_dTnDHnL11k-es1Cmc0cA0ITA8hh4wtM",
    projectId: "gizi-monitoring",
    messagingSenderId: "278080247060",
    appId: "1:278080247060:web:14bf1b8dcd7e7b28eede01"
});

const messaging = firebase.messaging();

// Menangani notifikasi saat tab aplikasi tertutup/di background
messaging.onBackgroundMessage((payload) => {
    console.log('[sw.js] Notifikasi background diterima: ', payload);

    const notificationTitle = payload.notification.title || "Pengingat GiziAnak";
    const notificationOptions = {
        body: payload.notification.body || "Jangan lupa minum pil hari ini, Bunda!",
        icon: '/icons/icon.png', // Pastikan file ini ada di folder public/icons/
        badge: '/icons/icon.png', // Icon kecil di bar notifikasi
        data: {
            url: '/parent/pregnancy' // URL tujuan saat notifikasi diklik
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Logic agar saat notifikasi diklik, user langsung dibawa ke aplikasi
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    // Ambil URL dari data atau default ke dashboard
    const urlToOpen = event.notification.data?.url || '/parent/pregnancy';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Jika ada tab yang sudah terbuka, fokuskan ke tab itu
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Jika tidak ada tab terbuka, buka tab baru
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});