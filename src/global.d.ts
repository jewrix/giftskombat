declare namespace Telegram {
    interface WebApp {
        initData: string;
        initDataUnsafe: { query_id: string; user: any; receiver: any; start_param: string };
        isExpanded: boolean;
        ready(): void;
        onEvent(event: string, handler: (...args: any[]) => void): void;
        offEvent(event: string, handler: (...args: any[]) => void): void;
        requestFullscreen(): void;
    }
}

interface Window {
    Telegram: { WebApp: Telegram.WebApp };
}
