'use client';

import { useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotification';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const { setupNotifications } = useNotifications();

    useEffect(() => {
        // Menjalankan setup notifikasi saat pertama kali aplikasi dimuat di browser
        setupNotifications();
    }, []);

    return <>{children}</>;
}