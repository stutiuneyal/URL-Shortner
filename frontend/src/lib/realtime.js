import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuthStore } from "../store/auth.store";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8091";

let stompClient = null;
let connected = false;
const activeSubscriptions = new Map();

function buildWsUrl() {
    return `${baseURL}/ws`;
}

export function connectRealtime() {
    if (stompClient && connected) return stompClient;

    stompClient = new Client({
        webSocketFactory: () => new SockJS(buildWsUrl()),
        reconnectDelay: 3000,
        debug: () => { },
        connectHeaders: (() => {
            const token = useAuthStore.getState().accessToken;
            return token ? { Authorization: `Bearer ${token}` } : {};
        })(),
        onConnect: () => {
            connected = true;
        },
        onDisconnect: () => {
            connected = false;
        },
        onStompError: (frame) => {
            console.error("STOMP error", frame);
        }
    });

    stompClient.activate();
    return stompClient;
}

export function disconnectRealtime() {
    if (stompClient) {
        activeSubscriptions.forEach((sub) => sub.unsubscribe());
        activeSubscriptions.clear();
        stompClient.deactivate();
        stompClient = null;
        connected = false;
    }
}

function ensureConnectedAndReady(callback, retryCount = 0) {
    if (stompClient?.connected) {
        callback();
        return;
    }

    if (retryCount > 20) {
        console.warn("Realtime client did not become ready in time.");
        return;
    }

    setTimeout(() => ensureConnectedAndReady(callback, retryCount + 1), 250);
}

export function subscribeTopic(key, destination, handler) {
    const client = connectRealtime();

    ensureConnectedAndReady(() => {
        if (activeSubscriptions.has(key)) {
            activeSubscriptions.get(key).unsubscribe();
            activeSubscriptions.delete(key);
        }

        const subscription = client.subscribe(destination, (message) => {
            try {
                const body = JSON.parse(message.body);
                handler(body);
            } catch (error) {
                console.error("Failed to parse realtime payload", error);
            }
        });

        activeSubscriptions.set(key, subscription);
    });
}

export function unsubscribeTopic(key) {
    if (activeSubscriptions.has(key)) {
        activeSubscriptions.get(key).unsubscribe();
        activeSubscriptions.delete(key);
    }
}