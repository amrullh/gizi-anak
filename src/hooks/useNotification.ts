import { useState } from 'react';
import { getToken } from 'firebase/messaging';
import { messaging } from '@/lib/firebase/client';
import { usePregnancy } from './usePregnancy';

export function useNotifications() {
    const { pregnancy, savePregnancy } = usePregnancy();
    const [loading, setLoading] = useState(false);

    const setupNotifications = async () => {
        if (!messaging) return;

        setLoading(true);
        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                const token = await getToken(messaging, {
                    vapidKey: 'MASUKKAN_PUBLIC_VAPID_KEY_DARI_CONSOLE'
                });

                if (token && pregnancy && pregnancy.fcmToken !== token) {
                    // Update data kehamilan dengan token baru
                    await savePregnancy({
                        ...pregnancy,
                        fcmToken: token,
                        notificationSettings: {
                            enableReminders: true,
                            reminderTime: '08:00' // Default jam 8 pagi
                        }
                    } as any);
                }
            }
        } catch (error) {
            console.error("Gagal setup FCM:", error);
        } finally {
            setLoading(false);
        }
    };

    return { setupNotifications, loading };
}