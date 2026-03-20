import axios from 'axios';

const CHAT_BOT_BASE_URL = process.env.REACT_APP_CHATBOT_API || 'http://localhost:8000/ai';

const chatbotClient = axios.create({
    baseURL: CHAT_BOT_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    timeout: 15000,
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
}
