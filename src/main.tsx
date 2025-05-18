import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {store} from "./store/store.ts";
import {Provider} from "react-redux";
import {Client} from "colyseus.js";
import {ClientProvider} from "./context/ClientContext.tsx";

const client = new Client('ws://5.129.200.26:2567');

createRoot(document.getElementById('root')!).render(
    <ClientProvider value={client}>
        <Provider store={store}>
            <App/>
        </Provider>
    </ClientProvider>,
);
