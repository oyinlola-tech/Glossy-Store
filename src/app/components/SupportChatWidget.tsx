import { useEffect, useMemo, useState } from 'react';
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
  sender_user_id: number;
  sender_role: 'user' | 'admin';
  message?: string | null;
  created_at: string;
};

export function SupportChatWidget() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [subject, setSubject] = useState('Support Request');
  const [unreadCount, setUnreadCount] = useState(0);

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
      // no-op for widget polling
    }
  };

  const loadMessages = async (conversationId: number) => {
    if (!user) return;
    setLoading(true);
    try {
      const payload = await api.getSupportMessages(conversationId) as { messages: SupportMessage[] };
      setMessages(Array.isArray(payload?.messages) ? payload.messages : []);
      await api.markSupportConversationRead(conversationId);
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
    if (!user || !open) return;
    const timer = setInterval(() => {
      void loadConversations();
      if (activeConversationId) void loadMessages(activeConversationId);
    }, 8000);
    return () => clearInterval(timer);
  }, [user, open, activeConversationId]);

  useEffect(() => {
    if (open && activeConversationId) {
      void loadMessages(activeConversationId);
    }
  }, [open, activeConversationId]);

  const openWidget = () => {
    if (!user) {
      toast.info('Please login to chat with support');
      navigate('/login');
      return;
    }
    setOpen(true);
  };

  const sendMessage = async () => {
    const message = draft.trim();
    if (!message) return;
    setLoading(true);
    try {
      if (!activeConversationId) {
        const created = await api.createSupportConversation({ subject: subject.trim() || 'Support Request', message }) as {
          conversation: { id: number };
        };
        const id = created?.conversation?.id;
        if (id) {
          setActiveConversationId(id);
          setDraft('');
          await loadConversations();
          await loadMessages(id);
        }
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
            <p className="font-semibold">
              {user.role === 'admin' || user.role === 'superadmin' ? 'Admin Support Console' : 'Chat with Support'}
            </p>
            <button onClick={() => setOpen(false)} aria-label="Close support chat">
              <X className="size-4" />
            </button>
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
                  setDraft={setDraft}
                  onSend={sendMessage}
                  subject={subject}
                  setSubject={setSubject}
                  hasConversation={Boolean(activeConversationId)}
                  isUser={false}
                />
              </div>
            ) : (
              <ChatPanel
                loading={loading}
                messages={messages}
                draft={draft}
                setDraft={setDraft}
                onSend={sendMessage}
                subject={subject}
                setSubject={setSubject}
                hasConversation={Boolean(activeConversationId)}
                isUser
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
}) {
  return (
    <div className="h-full flex flex-col">
      {!hasConversation && isUser ? (
        <div className="px-3 pt-3">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
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
