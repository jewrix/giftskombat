import { createContext, useContext } from 'react';
import { Client } from 'colyseus.js';

const ClientContext = createContext<Client | null>(null);

export function useClient(): Client {
    const client = useContext(ClientContext);
    if (!client) throw new Error("useClient must be inside ClientProvider");
    return client;
}

export const ClientProvider = ClientContext.Provider;