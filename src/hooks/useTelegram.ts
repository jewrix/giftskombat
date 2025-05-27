import { useEffect, useState, useCallback } from 'react';

export function useTelegram() {
    const [tg, setTg] = useState<Telegram.WebApp | null>(null);

    useEffect(() => {
        if (window.Telegram && window.Telegram.WebApp) {
            const webApp = window.Telegram.WebApp;
            webApp.ready();                  // сигнализируем Telegram, что WebApp загружен
            webApp.requestFullscreen();
            setTg(webApp);
        }
    }, []);

    // Пример обработчика события кнопки "back"
    const onBack = useCallback((handler: () => void) => {
        if (!tg) return;
        tg.onEvent('backButtonClicked', handler);
        return () => tg.offEvent('backButtonClicked', handler);
    }, [tg]);

    return { tg, onBack };
}
