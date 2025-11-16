import { WebhookPayload, WebhookEvent, User } from '../types';

const WEBHOOK_URL_STORAGE_KEY = 'n8n_webhook_url';

export const webhookService = {
    getWebhookUrl: (): string | null => {
        try {
            return localStorage.getItem(WEBHOOK_URL_STORAGE_KEY);
        } catch (error) {
            console.error("Failed to access localStorage:", error);
            return null;
        }
    },

    saveWebhookUrl: (url: string): void => {
        try {
            localStorage.setItem(WEBHOOK_URL_STORAGE_KEY, url);
        } catch (error) {
            console.error("Failed to save to localStorage:", error);
        }
    },

    clearWebhookUrl: (): void => {
        try {
            localStorage.removeItem(WEBHOOK_URL_STORAGE_KEY);
        } catch (error) {
            console.error("Failed to remove from localStorage:", error);
        }
    },

    sendWebhook: async (event: WebhookEvent, user: Partial<User>): Promise<void> => {
        const url = webhookService.getWebhookUrl();
        if (!url) {
            // Silently return if no webhook is configured.
            return;
        }

        const payload: WebhookPayload = {
            event,
            timestamp: new Date().toISOString(),
            user,
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
                mode: 'cors', // Required for cross-origin requests
            });

            if (!response.ok) {
                console.error(`N8N Webhook: Failed to send event '${event}'. Status: ${response.status}`);
            }
        } catch (error) {
            console.error(`N8N Webhook: Error sending request for event '${event}'.`, error);
        }
    },
};
