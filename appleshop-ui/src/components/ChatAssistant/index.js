import classNames from 'classnames/bind';
import styles from './ChatAssistant.module.scss';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChatbotService } from '~/service/chatbotService';
import jwt_decode from 'jwt-decode';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const cx = classNames.bind(styles);

const QUICK_ACTIONS = [
    'Gợi ý iPhone đáng mua',
    'Tìm iPhone 256GB màu đen',
    'Hướng dẫn đặt hàng',
    'Hướng dẫn sử dụng website',
    'Kiểm tra đơn hàng',
];

const DEFAULT_GREETING_MESSAGE = {
    role: 'ai',
    content: 'Chào bạn, mình là AppleShop Assistant. Bạn cần tìm sản phẩm, đặt hàng hay hướng dẫn sử dụng website?',
};

function getChatUserId() {
    try {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwt_decode(token);
            if (decoded?.id) {
                return String(decoded.id);
            }
        }
    } catch (error) {
        // keep guest fallback
    }

    const storageKey = 'appleShopChatGuestId';
    const found = localStorage.getItem(storageKey);
    if (found) {
        return found;
    }

    const generated = `guest_${Date.now()}`;
    localStorage.setItem(storageKey, generated);
    return generated;
}

function ChatAssistant() {
    const chatbotService = useMemo(() => new ChatbotService(), []);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([DEFAULT_GREETING_MESSAGE]);
    const [draft, setDraft] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const messageListRef = useRef(null);
    const userId = useMemo(() => getChatUserId(), []);

    useEffect(() => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const loadHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const res = await chatbotService.getHistory({ userId });
                const history = Array.isArray(res?.history) ? res.history : [];

                if (!history.length) {
                    setMessages([DEFAULT_GREETING_MESSAGE]);
                    return;
                }

                const normalizedHistory = history
                    .map((item) => {
                        const role = item?.role === 'user' ? 'user' : 'ai';
                        const content = String(item?.content || '').trim();
                        if (!content) return null;
                        return { role, content };
                    })
                    .filter(Boolean);

                setMessages(normalizedHistory.length ? normalizedHistory : [DEFAULT_GREETING_MESSAGE]);
            } catch (error) {
                setMessages((prev) => (prev.length ? prev : [DEFAULT_GREETING_MESSAGE]));
            } finally {
                setIsLoadingHistory(false);
            }
        };

        loadHistory();
    }, [isOpen, chatbotService, userId]);

    useEffect(() => {
        if (!isOpen) {
            document.body.style.overflow = '';
            return;
        }

        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const sendMessage = async (customText = '') => {
        const text = (customText || draft).trim();
        if (!text || isSending) return;

        const userMessage = { role: 'user', content: text };
        const assistantMessageId = `ai_${Date.now()}`;
        setMessages((prev) => [...prev, userMessage, { id: assistantMessageId, role: 'ai', content: '' }]);
        setDraft('');
        setIsSending(true);

        let typingTimer = null;
        let queuedText = '';
        let renderedText = '';
        let streamFinished = false;
        let resolveDrain = null;
        const drainPromise = new Promise((resolve) => {
            resolveDrain = resolve;
        });

        const patchAssistantMessage = (content) => {
            setMessages((prev) =>
                prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, content } : msg)),
            );
        };

        const startTyping = () => {
            if (typingTimer) return;

            typingTimer = setInterval(() => {
                if (!queuedText.length) {
                    if (streamFinished) {
                        clearInterval(typingTimer);
                        typingTimer = null;
                        if (resolveDrain) resolveDrain();
                    }
                    return;
                }

                const step = queuedText.slice(0, 3);
                queuedText = queuedText.slice(3);
                renderedText += step;
                patchAssistantMessage(renderedText);
            }, 18);
        };

        const enqueueAssistantMessage = (delta) => {
            queuedText += delta;
            startTyping();
        };

        try {
            const streamed = await chatbotService.chatStream({
                userId,
                message: text,
                onDelta: enqueueAssistantMessage,
            });

            streamFinished = true;
            if (!typingTimer) {
                if (resolveDrain) resolveDrain();
            }
            await drainPromise;

            if (!streamed?.reply?.trim() || !renderedText.trim()) {
                throw new Error('empty stream reply');
            }
        } catch (error) {
            if (typingTimer) {
                clearInterval(typingTimer);
                typingTimer = null;
            }
            try {
                const res = await chatbotService.chat({ userId, message: text });
                patchAssistantMessage(res?.reply || 'Mình chưa thể phản hồi lúc này, bạn thử lại giúp mình nhé.');
            } catch (fallbackError) {
                patchAssistantMessage('Mình đang gặp lỗi kết nối chatbot. Bạn vui lòng thử lại sau ít phút.');
            }
        } finally {
            setIsSending(false);
        }
    };

    const onEnterSubmit = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    const onClearChat = async () => {
        try {
            await chatbotService.clearHistory({ userId });
        } catch (error) {
            // ignore clear API errors and still reset local messages
        }

        setMessages([
            {
                role: 'ai',
                content: 'Mình đã làm mới cuộc trò chuyện. Bạn muốn hỗ trợ gì tiếp theo?',
            },
        ]);
    };

    return (
        <div className={cx('assistantRoot', { open: isOpen })}>
            <button
                className={cx('floatingButton', { hidden: isOpen })}
                onClick={() => setIsOpen(true)}
                type="button"
                aria-label="Open AppleShop Assistant"
            >
                <span className={cx('floatingDot')} />
                Trợ lý Apple
            </button>

            <button
                type="button"
                className={cx('backdrop', { visible: isOpen })}
                aria-label="Đóng khung chat"
                onClick={() => setIsOpen(false)}
            />

            <aside className={cx('chatPanel', { open: isOpen })} aria-hidden={!isOpen}>
                <div className={cx('chatHeader')}>
                    <div className={cx('headerText')}>
                        <h4>AppleShop Assistant</h4>
                        <span>Tư vấn sản phẩm, đặt hàng, hướng dẫn website</span>
                    </div>
                    <div className={cx('headerActions')}>
                        <button type="button" onClick={onClearChat}>
                            Làm mới
                        </button>
                        <button type="button" onClick={() => setIsOpen(false)}>
                            Đóng
                        </button>
                    </div>
                </div>

                <div className={cx('quickActions')}>
                    {QUICK_ACTIONS.map((item) => (
                        <button key={item} type="button" onClick={() => sendMessage(item)} disabled={isSending}>
                            {item}
                        </button>
                    ))}
                </div>

                <div className={cx('messageList')} ref={messageListRef}>
                    {isLoadingHistory && (
                        <div className={cx('messageRow', 'ai')}>
                            <div className={cx('bubble')}>Đang tải lịch sử chat...</div>
                        </div>
                    )}
                    {messages.map((msg, index) => (
                        <div key={msg.id || `${msg.role}_${index}`} className={cx('messageRow', msg.role)}>
                            <div className={cx('bubble')}>
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                        a: ({ node, ...props }) => (
                                            <a {...props} target="_blank" rel="noopener noreferrer" />
                                        ),
                                    }}
                                >
                                    {msg.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={cx('composer')}>
                    <textarea
                        rows={2}
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onKeyDown={onEnterSubmit}
                        placeholder="Nhập câu hỏi, ví dụ: iPhone 15 256GB màu đen"
                    />
                    <button type="button" onClick={() => sendMessage()} disabled={isSending || !draft.trim()}>
                        Gửi
                    </button>
                </div>
            </aside>
        </div>
    );
}

export default ChatAssistant;
