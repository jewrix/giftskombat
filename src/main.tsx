import {createRoot} from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import {store} from './store/store.ts';
import {Provider} from 'react-redux';
import {Client} from 'colyseus.js';
import {ClientProvider} from './context/ClientContext.tsx';
import {init as initSDK, viewport} from '@telegram-apps/sdk-react';


// const prodUrl = 'wss://giftscombat.ru/'
const devUrl = 'ws://localhost:2567/'

async function bootstrap() {

    // ④ инициализируем SDK и viewport
    // initSDK();
    // if (viewport.mount.isAvailable()) {
    //     await viewport.mount();
    // }
    // if (viewport.requestFullscreen.isAvailable() && !viewport.isFullscreen()) {
    //     await viewport.requestFullscreen();
    // }

    // ⑤ остальной рендер
    const client = new Client(devUrl, {});
    createRoot(document.getElementById('root')!).render(
        <ClientProvider value={client}>
            <Provider store={store}>
                <App/>
            </Provider>
        </ClientProvider>
    );
}

bootstrap();
