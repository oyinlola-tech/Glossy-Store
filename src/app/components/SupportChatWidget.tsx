import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

type Conversation = {
  id: number;
  subject?: string | null;
  status: 'open' | 'resolved' | 'closed';
  unread_count?: number;
  User?: { id: number; name: string; email: string };
};

type SupportMessage = {
  id: number;
  support_conversation_id?: number;
  sender_user_id: number;
  sender_role: 'user' | 'admin';
  message?: string | null;
  created_at: string;
};

type SocketClient = {
  connected: boolean;
  emit: (event: string, payload?: any) => void;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
  disconnect: () => void;
};

declare global {
  interface Window {
    io?: (url?: string, opts?: Record<string, unknown>) => SocketClient;
  }
}

const loadSocketClientScript = async (): Promise<void> => {
  if (window.io) return;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-socket-io-client="true"]');
    if (existing) {
      if ((window as any).io) resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load socket client')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = '/socket.io/socket.io.js';
    script.async = true;
    script.setAttribute('data-socket-io-client', 'true');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load socket client'));
    document.head.appendChild(script);
  });
};

export function SupportChatWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const socketRef = useRef<SocketClient | null>(null);
  const typingStopTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socketReady, setSocketReady] = useState(false);
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'offline'>('offline');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [subject, setSubject] = useState('Support Request');
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingNotice, setTypingNotice] = useState('');

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  const loadConversations = async () => {
    if (!user) return;
    try {
      const [items, unread] = await Promise.all([
        api.getSupportConversations() as Promise<Conversation[]>,
        api.getSupportUnreadCount() as Promise<{ total_unread_count: number }>,
      ]);
      setConversations(Array.isArray(items) ? items : []);
      setUnreadCount(Number(unread?.total_unread_count || 0));
      if (!activeConversationId && items?.length) {
        setActiveConversationId(items[0].id);
      }
    } catch {
      // Widget should not block page rendering on this.
    }
  };

  const loadMessages = async (conversationId: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const payload = await api.getSupportMessages(conversationId) as { messages: SupportMessage[] };
      setMessages(Array.isArray(payload?.messages) ? payload.messages : []);
      await api.markSupportConversationRead(conversationId);
      socketRef.current?.emit('support:mark_read', { conversationId });
      await loadConversations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to load support messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    void loadConversations();
  }, [user]);

  useEffect(() => {
    let mounted = true;
    const connect = async () => {
      if (!user?.token) return;
      setSocketStatus('connecting');
      try {
        await loadSocketClientScript();
        if (!mounted || !window.io) return;

        const socket = window.io(undefined, {
          path: '/socket.io',
          transports: ['websocket', 'polling'],
          auth: { token: user.token },
        });
        socketRef.current = socket;

        const onConnect = () => {
          setSocketReady(true);
          setSocketStatus('connected');
        };
        const onDisconnect = () => {
          setSocketReady(false);
          setSocketStatus('reconnecting');
        };
        const onConnectError = () => {
          setSocketReady(false);
          setSocketStatus(navigator.onLine ? 'reconnecting' : 'offline');
        };
        const onReconnectAttempt = () => {
          setSocketStatus('reconnecting');
        };
        const onError = (payload: { message?: string }) => {
          if (payload?.message) toast.error(payload.message);
        };
        const onUnreadCount = (payload: { total_unread_count?: number }) => {
          setUnreadCount(Number(payload?.total_unread_count || 0));
          void loadConversations();
        };
        const onRefreshUnread = () => {
          void loadConversations();
        };
        const onNewMessage = (message: SupportMessage) => {
          const incomingConversationId = Number(message.support_conversation_id || 0);
          if (incomingConversationId && incomingConversationId !== activeConversationId) {
            void loadConversations();
            return;
          }
          setMessages((prev) => {
            if (prev.some((item) => item.id === message.id)) return prev;
            return [...prev, message];
          });
          if (activeConversationId) {
            socket.emit('support:mark_read', { conversationId: activeConversationId });
            void loadConversations();
          }
        };
        const onTyping = (payload: { conversationId: number; isTyping: boolean; user?: { name?: string } }) => {
          if (!activeConversationId || Number(payload.conversationId) !== Number(activeConversationId)) return;
          if (payload.isTyping) {
            setTypingNotice(`${payload.user?.name || 'Support'} is typing...`);
          } else {
            setTypingNotice('');
          }
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('connect_error', onConnectError);
        socket.on('reconnect_attempt', onReconnectAttempt);
        socket.on('support:error', onError);
        socket.on('support:unread_count', onUnreadCount);
        socket.on('support:refresh_unread', onRefreshUnread);
        socket.on('support:new_message', onNewMessage);
        socket.on('support:typing', onTyping);
      } catch {
        setSocketReady(false);
        setSocketStatus('offline');
      }
    };
    void connect();

    return () => {
      mounted = false;
      if (typingStopTimerRef.current) {
        window.clearTimeout(typingStopTimerRef.current);
        typingStopTimerRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocketStatus('offline');
    };
  }, [user?.token, activeConversationId]);

  useEffect(() => {
    const handleOnline = () => {
      setSocketStatus((prev) => (prev === 'connected' ? 'connected' : 'reconnecting'));
    };
    const handleOffline = () => {
      setSocketStatus('offline');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!open || !activeConversationId) return;
    socketRef.current?.emit('support:join', { conversationId: activeConversationId });
    void loadMessages(activeConversationId);
  }, [open, activeConversationId]);

  const openWidget = () => {
    if (!user) {
      toast.info('Please login to chat with support');
      navigate('/login');
      return;
    }
    setOpen(true);
  };

  const sendTypingSignal = (isTyping: boolean) => {
    if (!activeConversationId || !socketRef.current) return;
    socketRef.current.emit('support:typing', { conversationId: activeConversationId, isTyping });
  };

  const onDraftChange = (value: string) => {
    setDraft(value);
    if (!activeConversationId) return;
    sendTypingSignal(true);
    if (typingStopTimerRef.current) window.clearTimeout(typingStopTimerRef.current);
    typingStopTimerRef.current = window.setTimeout(() => sendTypingSignal(false), 1200);
  };

  const sendMessage = async () => {
    const message = draft.trim();
    if (!message) return;
    setLoading(true);
    try {
      if (!activeConversationId) {
        const created = await api.createSupportConversation({
          subject: subject.trim() || 'Support Request',
          message,
        }) as { conversation: { id: number }; firstMessage?: SupportMessage };
        const id = created?.conversation?.id;
        if (id) {
          setActiveConversationId(id);
          setDraft('');
          if (created.firstMessage) {
            setMessages([created.firstMessage]);
          } else {
            await loadMessages(id);
          }
          await loadConversations();
          socketRef.current?.emit('support:join', { conversationId: id });
        }
      } else if (socketRef.current && socketReady) {
        socketRef.current.emit('support:message', { conversationId: activeConversationId, message });
        setDraft('');
        sendTypingSignal(false);
      } else {
        await api.sendSupportMessage(activeConversationId, message);
        setDraft('');
        await loadMessages(activeConversationId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send support message');
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = async () => {
    if (!activeConversationId) return;
    setLoading(true);
    try {
      await api.clearSupportConversationMessages(activeConversationId);
      setMessages([]);
      toast.success('Chat messages cleared');
      await loadConversations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to clear chat');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async () => {
    if (!activeConversationId) return;
    setLoading(true);
    try {
      await api.deleteSupportConversation(activeConversationId);
      toast.success('Chat deleted');
      setMessages([]);
      setActiveConversationId(null);
      await loadConversations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete chat');
    } finally {
      setLoading(false);
    }
  };

  const updateConversationStatus = async (status: 'open' | 'resolved' | 'closed') => {
    if (!activeConversationId) return;
    setLoading(true);
    try {
      await api.updateSupportConversationStatus(activeConversationId, status);
      toast.success(`Conversation marked ${status}`);
      await loadConversations();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <button
        type="button"
        onClick={openWidget}
        className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 flex items-center justify-center"
        aria-label="Open support chat"
      >
        <MessageCircle className="size-6" />
      </button>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 flex items-center justify-center"
        aria-label="Toggle support chat"
      >
        <MessageCircle className="size-6" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-black text-white text-xs flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-[380px] h-[540px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="h-12 px-4 bg-red-500 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <p className="font-semibold">
                {user.role === 'admin' || user.role === 'superadmin' ? 'Admin Support Console' : 'Chat with Support'}
              </p>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  socketStatus === 'connected'
                    ? 'bg-green-600'
                    : socketStatus === 'reconnecting'
                      ? 'bg-amber-500'
                      : socketStatus === 'connecting'
                        ? 'bg-blue-500'
                        : 'bg-gray-700'
                }`}
                title={socketStatus}
              >
                {socketStatus === 'connected' ? 'Online' : socketStatus === 'reconnecting' ? 'Reconnecting...' : socketStatus === 'connecting' ? 'Connecting...' : 'Offline'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {activeConversationId ? (
                <>
                  {user.role === 'user' ? (
                    <>
                      <button
                        onClick={() => void clearMessages()}
                        className="text-[10px] px-2 py-1 rounded bg-white/20 hover:bg-white/30"
                      >
                        Clear
                      </button>
                      <button
                        onClick={() => void deleteConversation()}
                        className="text-[10px] px-2 py-1 rounded bg-black/30 hover:bg-black/40"
                      >
                        Delete
                      </button>
                    </>
                  ) : null}
                  {user.role !== 'user' ? (
                    <select
                      value={activeConversation?.status || 'open'}
                      onChange={(e) => void updateConversationStatus(e.target.value as 'open' | 'resolved' | 'closed')}
                      className="text-[10px] text-black bg-white rounded px-1 py-0.5"
                    >
                      <option value="open">Open</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  ) : null}
                </>
              ) : null}
              <button onClick={() => setOpen(false)} aria-label="Close support chat">
                <X className="size-4" />
              </button>
            </div>
          </div>

          <div className="h-[calc(100%-3rem)] grid grid-cols-1">
            {user.role !== 'user' ? (
              <div className="grid grid-cols-[140px_1fr] h-full">
                <div className="border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                  {conversations.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveConversationId(item.id)}
                      className={`w-full text-left px-3 py-2 border-b border-gray-100 dark:border-gray-800 ${
                        activeConversationId === item.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                      }`}
                    >
                      <p className="text-xs font-semibold text-black dark:text-white truncate">
                        {item.User?.name || item.subject || `Conversation #${item.id}`}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">{item.status}</p>
                    </button>
                  ))}
                </div>
                <ChatPanel
                  loading={loading}
                  messages={messages}
                  draft={draft}
                  setDraft={onDraftChange}
                  onSend={sendMessage}
                  subject={subject}
                  setSubject={setSubject}
                  hasConversation={Boolean(activeConversationId)}
                  isUser={false}
                  typingNotice={typingNotice}
                />
              </div>
            ) : (
              <ChatPanel
                loading={loading}
                messages={messages}
                draft={draft}
                setDraft={onDraftChange}
                onSend={sendMessage}
                subject={subject}
                setSubject={setSubject}
                hasConversation={Boolean(activeConversationId)}
                isUser
                typingNotice={typingNotice}
              />
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function ChatPanel({
  loading,
  messages,
  draft,
  setDraft,
  onSend,
  subject,
  setSubject,
  hasConversation,
  isUser,
  typingNotice,
}: {
  loading: boolean;
  messages: SupportMessage[];
  draft: string;
  setDraft: (value: string) => void;
  onSend: () => void;
  subject: string;
  setSubject: (value: string) => void;
  hasConversation: boolean;
  isUser: boolean;
  typingNotice: string;
}) {
  return (
    <div className="h-full flex flex-col">
      {!hasConversation && isUser ? (
        <div className="px-3 pt-3">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={120}
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
            placeholder="Conversation subject"
          />
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-950">
        {messages.length ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] px-3 py-2 rounded text-sm ${
                message.sender_role === 'admin'
                  ? 'bg-black text-white'
                  : 'bg-white dark:bg-gray-800 text-black dark:text-white ml-auto'
              }`}
            >
              <p>{message.message || '[Attachment]'}</p>
              <p className="text-[10px] opacity-70 mt-1">
                {new Date(message.created_at).toLocaleTimeString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {loading ? 'Loading messages...' : 'No messages yet. Start the conversation.'}
          </p>
        )}
        {typingNotice ? (
          <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">{typingNotice}</p>
        ) : null}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void onSend();
              }
            }}
            maxLength={2000}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
          />
          <button
            onClick={() => void onSend()}
            disabled={loading || !draft.trim()}
            className="size-9 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center"
            aria-label="Send support message"
          >
            <Send className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
