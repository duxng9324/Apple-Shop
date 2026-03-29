import axios from 'axios';

const CHAT_BOT_BASE_URL = process.env.REACT_APP_CHATBOT_API || 'http://localhost:8000/ai';

const chatbotClient = axios.create({
    baseURL: CHAT_BOT_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    timeout: 1000 * 60 * 5,
});

export class ChatbotService {
    chat = async (params) => {
        const { userId, message } = params;
        const response = await chatbotClient.post('/chat', {
            user_id: userId,
            message,
        });
        return response.data;
    };

    getHistory = async (params) => {
        const { userId } = params;
        const response = await chatbotClient.get(`/history/${userId}`);
        return response.data;
    };

    clearHistory = async (params) => {
        const { userId } = params;
        const response = await chatbotClient.delete(`/history/${userId}`);
        return response.data;
    };

    chatStream = async (params) => {
        const { userId, message, onDelta } = params;
        const response = await fetch(`${CHAT_BOT_BASE_URL}/chat_stream`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
            },
            body: JSON.stringify({
                user_id: userId,
                message,
            }),
        });

        if (!response.ok || !response.body) {
            throw new Error(`Streaming request failed with status ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let pending = '';
        let fullReply = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            pending += decoder.decode(value, { stream: true });
            const events = pending.split('\n\n');
            pending = events.pop() || '';

            for (const event of events) {
                const lines = event.split('\n');
                for (const line of lines) {
                    if (!line.startsWith('data:')) continue;

                    const payloadText = line.slice(5).trim();
                    if (!payloadText) continue;
                    if (payloadText === '[DONE]') {
                        return { reply: fullReply };
                    }

                    try {
                        const payload = JSON.parse(payloadText);
                        if (payload?.error) {
                            throw new Error(payload.error);
                        }

                        const delta = String(payload?.delta || '');
                        if (delta) {
                            fullReply += delta;
                            if (typeof onDelta === 'function') {
                                onDelta(delta);
                            }
                        }
                    } catch (error) {
                        if (error instanceof SyntaxError) {
                            continue;
                        }
                        throw error;
                    }
                }
            }
        }

        return { reply: fullReply };
    };
}
