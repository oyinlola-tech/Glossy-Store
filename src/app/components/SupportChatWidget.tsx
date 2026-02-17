import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { ChevronLeft, MessageCircle, Plus, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

type Conversation = {
  id: number;
  subject?: string | null;
  status: 'open' | 'resolved' | 'closed';
  unread_count?: number;
  User?: { id: number; name: string; email: string };
  guest_name?: string | null;
  guest_email?: string | null;
};

type SupportMessage = {
  id: number;
  support_conversation_id?: number;
  sender_user_id: number | null;
  sender_role: 'user' | 'admin' | 'guest';
  sender_name?: string | null;
  sender?: { id: number | null; name: string; role: 'user' | 'admin' | 'guest'; email?: string | null } | null;
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

const parseDateSafe = (value: unknown): Date | null => {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateTimeSafe = (value: unknown): string => {
  const date = parseDateSafe(value);
  return date ? date.toLocaleString() : '';
};

const formatTimeSafe = (value: unknown): string => {
  const date = parseDateSafe(value);
  return date ? date.toLocaleTimeString() : '';
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
  const socketRef = useRef<SocketClient | null>(null);
  const typingStopTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
  const [attachments, setAttachments] = useState<File[]>([]);
  const [conversationSearch, setConversationSearch] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestConversationId, setGuestConversationId] = useState<number | null>(null);
  const [guestToken, setGuestToken] = useState<string | null>(null);
  const [guestMessages, setGuestMessages] = useState<SupportMessage[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const guestSessionKey = 'supportGuestSession';
  const isGuest = !user;
  const isAdminConsole = !isGuest && (user.role === 'admin' || user.role === 'superadmin');
  const canStartNewChat = isGuest || (!!user && user.role === 'user');

  const clearAttachments = () => {
    setAttachments([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const activeConversation = useMemo(
    () => conversations.find((item) => item.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  const filteredConversations = useMemo(() => {
    const q = conversationSearch.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((item) => {
      const name = item.User?.name || item.guest_name || '';
      const email = item.User?.email || item.guest_email || '';
      const subjectText = item.subject || '';
      return [name, email, subjectText].some((value) => String(value).toLowerCase().includes(q));
    });
  }, [conversations, conversationSearch]);

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

  const loadGuestSession = () => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(guestSessionKey);
    if (!raw) return;
    try {
      const session = JSON.parse(raw) as { id?: number; token?: string; name?: string; email?: string };
      if (session?.id && session?.token) {
        setGuestConversationId(session.id);
        setGuestToken(session.token);
        if (session.name) setGuestName(session.name);
        if (session.email) setGuestEmail(session.email);
      }
    } catch {
      // Ignore invalid stored session
    }
  };

  const persistGuestSession = (id: number, token: string, name: string, email: string) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(guestSessionKey, JSON.stringify({ id, token, name, email }));
  };

  const loadGuestMessages = async (conversationId: number, token: string) => {
    setLoading(true);
    try {
      const payload = await api.getGuestSupportMessages(conversationId, token) as { messages: SupportMessage[] };
      setGuestMessages(Array.isArray(payload?.messages) ? payload.messages : []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load support messages');
    } finally {
      setLoading(false);
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
    const media = window.matchMedia('(max-width: 768px)');
    const apply = () => setIsMobile(media.matches);
    apply();
    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', apply);
      return () => media.removeEventListener('change', apply);
    }
    media.addListener(apply);
    return () => media.removeListener(apply);
  }, []);

  useEffect(() => {
    if (!isGuest) return;
    loadGuestSession();
  }, [isGuest]);

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

  useEffect(() => {
    if (!open || !isGuest || !guestConversationId || !guestToken) return;
    void loadGuestMessages(guestConversationId, guestToken);
    const interval = window.setInterval(() => {
      void loadGuestMessages(guestConversationId, guestToken);
    }, 7000);
    return () => window.clearInterval(interval);
  }, [open, isGuest, guestConversationId, guestToken]);

  useEffect(() => {
    if (open && isMobile && !isGuest) {
      setMobileView('list');
    }
  }, [open, isMobile, isGuest]);

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
    const hasAttachments = attachments.length > 0;
    if (!message && !hasAttachments) return;
    setLoading(true);
    try {
      if (isGuest) {
        const normalizedEmail = guestEmail.trim().toLowerCase();
        if (!guestName.trim() || !/\S+@\S+\.\S+/.test(normalizedEmail)) {
          toast.error('Enter your name and a valid email');
          return;
        }
        if (!guestConversationId || !guestToken) {
          const created = await api.createGuestSupportConversation({
            name: guestName.trim(),
            email: normalizedEmail,
            subject: subject.trim() || 'Support Request',
            message,
            attachments,
          }) as { conversation: { id: number }; guest_token: string; firstMessage?: SupportMessage };
          const id = created?.conversation?.id;
          if (id && created?.guest_token) {
            setGuestConversationId(id);
            setGuestToken(created.guest_token);
            persistGuestSession(id, created.guest_token, guestName.trim(), normalizedEmail);
            setDraft('');
            clearAttachments();
            if (created.firstMessage) {
              setGuestMessages([created.firstMessage]);
            } else {
              await loadGuestMessages(id, created.guest_token);
            }
          }
        } else {
          await api.sendGuestSupportMessage(guestConversationId, guestToken, message, attachments);
          setDraft('');
          clearAttachments();
          await loadGuestMessages(guestConversationId, guestToken);
        }
        return;
      }

      if (!activeConversationId) {
        const created = await api.createSupportConversation({
          subject: subject.trim() || 'Support Request',
          message,
          attachments,
        }) as { conversation: { id: number }; firstMessage?: SupportMessage };
        const id = created?.conversation?.id;
        if (id) {
          setActiveConversationId(id);
          setDraft('');
          clearAttachments();
          if (created.firstMessage) {
            setMessages([created.firstMessage]);
          } else {
            await loadMessages(id);
          }
          await loadConversations();
          socketRef.current?.emit('support:join', { conversationId: id });
        }
      } else if (!hasAttachments && socketRef.current && socketReady) {
        socketRef.current.emit('support:message', { conversationId: activeConversationId, message });
        setDraft('');
        sendTypingSignal(false);
      } else {
        await api.sendSupportMessage(activeConversationId, message, attachments);
        setDraft('');
        clearAttachments();
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

  const openConversation = (conversationId: number) => {
    setActiveConversationId(conversationId);
    if (isMobile) setMobileView('chat');
  };

  const startNewChat = async () => {
    if (!canStartNewChat) {
      toast.error('Admins can only reply to existing user tickets');
      return;
    }
    setDraft('');
    clearAttachments();
    setSubject('Support Request');

    if (isGuest) {
      const normalizedEmail = guestEmail.trim().toLowerCase();
      const canCreateGuestTicket = guestName.trim() && /\S+@\S+\.\S+/.test(normalizedEmail);
      if (!canCreateGuestTicket) {
        setGuestConversationId(null);
        setGuestToken(null);
        setGuestMessages([]);
        if (typeof window !== 'undefined') window.localStorage.removeItem(guestSessionKey);
        if (isMobile) setMobileView('chat');
        return;
      }
      setLoading(true);
      try {
        const created = await api.createGuestSupportConversation({
          name: guestName.trim(),
          email: normalizedEmail,
          subject: 'Support Request',
        }) as { conversation?: { id: number }; guest_token?: string; firstMessage?: SupportMessage };
        const id = created?.conversation?.id;
        if (id && created?.guest_token) {
          setGuestConversationId(id);
          setGuestToken(created.guest_token);
          setGuestMessages(created.firstMessage ? [created.firstMessage] : []);
          persistGuestSession(id, created.guest_token, guestName.trim(), normalizedEmail);
        } else {
          setGuestConversationId(null);
          setGuestToken(null);
          setGuestMessages([]);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to create a new chat');
      } finally {
        setLoading(false);
      }
      if (isMobile) setMobileView('chat');
      return;
    }

    setLoading(true);
    try {
      const created = await api.createSupportConversation({
        subject: 'Support Request',
      }) as { conversation?: { id: number }; firstMessage?: SupportMessage };
      const id = created?.conversation?.id;
      if (id) {
        setActiveConversationId(id);
        setMessages(created.firstMessage ? [created.firstMessage] : []);
        await loadConversations();
        socketRef.current?.emit('support:join', { conversationId: id });
      } else {
        setActiveConversationId(null);
        setMessages([]);
      }
      if (isMobile) setMobileView('chat');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create a new chat');
    } finally {
      setLoading(false);
    }
  };

  const isAgent = !isGuest && user.role !== 'user';
  const showAuthListOnMobile = !isGuest && isMobile && mobileView === 'list';
  const showAuthChatOnMobile = !isGuest && isMobile && mobileView === 'chat';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="fixed bottom-5 right-5 z-50 size-14 rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 flex items-center justify-center"
        aria-label="Toggle support chat"
      >
        <MessageCircle className="size-6" />
        {!isGuest && unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-black text-white text-xs flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className={isMobile
          ? 'fixed inset-0 z-50 bg-[#efeae2] dark:bg-gray-900 overflow-hidden'
          : isAdminConsole
            ? 'fixed inset-3 md:inset-8 z-50 bg-[#efeae2] dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden'
            : 'fixed bottom-24 right-5 z-50 w-[calc(100vw-2.5rem)] max-w-[380px] h-[540px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden'}
        >
          <div className={`h-12 px-4 ${isAdminConsole || isMobile ? 'bg-[#b42318]' : 'bg-red-500'} text-white flex items-center justify-between`}>
            <div className="flex items-center gap-2 min-w-0">
              {showAuthChatOnMobile ? (
                <button onClick={() => setMobileView('list')} aria-label="Back to chats">
                  <ChevronLeft className="size-4" />
                </button>
              ) : null}
              <p className="font-semibold">
                {!isGuest && (user.role === 'admin' || user.role === 'superadmin') ? 'Admin Support Console' : 'Chat with Support'}
              </p>
              {!isGuest ? (
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
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {canStartNewChat ? (
                <button
                  type="button"
                  onClick={() => void startNewChat()}
                  className="text-[10px] px-2 py-1 rounded bg-white/20 hover:bg-white/30 flex items-center gap-1"
                >
                  <Plus className="size-3" /> New Chat
                </button>
              ) : null}
              {!isGuest && activeConversationId ? (
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
            {!isGuest && !isMobile ? (
              <div className={`grid ${isAdminConsole ? 'grid-cols-[320px_1fr]' : 'grid-cols-[260px_1fr]'} h-full`}>
                <div className={`border-r border-gray-200 dark:border-gray-700 overflow-y-auto ${isAdminConsole ? 'bg-[#f0f2f5] dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-950'}`}>
                  <div className="p-3 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/85">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Conversations</p>
                    <input
                      value={conversationSearch}
                      onChange={(e) => setConversationSearch(e.target.value)}
                      placeholder="Search by name or email"
                      className="mt-2 w-full px-2.5 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white text-xs"
                    />
                  </div>
                  {filteredConversations.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => openConversation(item.id)}
                      className={`w-full text-left px-3 py-3 border-b border-gray-100 dark:border-gray-800 ${
                        activeConversationId === item.id
                          ? `${isAdminConsole ? 'bg-[#fbe9e7] dark:bg-gray-900' : 'bg-white dark:bg-gray-900'}`
                          : `${isAdminConsole ? 'hover:bg-[#e9edef] dark:hover:bg-gray-900/80' : 'hover:bg-white dark:hover:bg-gray-900/80'}`
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-black dark:text-white truncate">
                          {item.User?.name || item.guest_name || item.guest_email || `Conversation #${item.id}`}
                        </p>
                        {Number(item.unread_count || 0) > 0 ? (
                          <span className="min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center">
                            {item.unread_count}
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {item.User?.email || item.guest_email || item.subject || 'Support conversation'}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                        <span className="capitalize">{item.status}</span>
                        <span>{formatDateTimeSafe(item.last_message_at)}</span>
                      </div>
                    </button>
                  ))}
                  {!filteredConversations.length ? (
                    <p className="p-3 text-xs text-gray-500 dark:text-gray-400">No conversations found</p>
                  ) : null}
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
                  isAdminView={isAgent}
                  isAdminConsole={isAdminConsole}
                  isMobile={isMobile}
                  typingNotice={typingNotice}
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                  fileInputRef={fileInputRef}
                />
              </div>
            ) : showAuthListOnMobile ? (
              <div className="h-full overflow-y-auto bg-[#f0f2f5] dark:bg-gray-950">
                <div className="p-3 border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-[#f0f2f5]/95 dark:bg-gray-950/95 backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Chats</p>
                  <input
                    value={conversationSearch}
                    onChange={(e) => setConversationSearch(e.target.value)}
                    placeholder="Search by name or email"
                    className="mt-2 w-full px-2.5 py-2 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-black dark:text-white text-xs"
                  />
                </div>
                {filteredConversations.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => openConversation(item.id)}
                    className={`w-full text-left px-3 py-3 border-b border-gray-100 dark:border-gray-800 ${
                      activeConversationId === item.id ? 'bg-[#fbe9e7] dark:bg-gray-900' : 'hover:bg-[#e9edef] dark:hover:bg-gray-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-black dark:text-white truncate">
                        {item.User?.name || item.guest_name || item.guest_email || `Conversation #${item.id}`}
                      </p>
                      {Number(item.unread_count || 0) > 0 ? (
                        <span className="min-w-5 h-5 px-1 rounded-full bg-[#b42318] text-white text-[10px] flex items-center justify-center">
                          {item.unread_count}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {item.User?.email || item.guest_email || item.subject || 'Support conversation'}
                    </p>
                  </button>
                ))}
              </div>
            ) : showAuthChatOnMobile ? (
              <ChatPanel
                loading={loading}
                messages={messages}
                draft={draft}
                setDraft={onDraftChange}
                onSend={sendMessage}
                subject={subject}
                setSubject={setSubject}
                hasConversation={Boolean(activeConversationId)}
                isUser={user.role === 'user'}
                isAdminView={isAgent}
                isAdminConsole={isAdminConsole}
                isMobile={isMobile}
                typingNotice={typingNotice}
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                fileInputRef={fileInputRef}
              />
            ) : (
              <ChatPanel
                loading={loading}
                messages={isGuest ? guestMessages : messages}
                draft={draft}
                setDraft={onDraftChange}
                onSend={sendMessage}
                subject={subject}
                setSubject={setSubject}
                hasConversation={isGuest ? Boolean(guestConversationId) : Boolean(activeConversationId)}
                isUser={!isGuest}
                isAdminView={false}
                isAdminConsole={isAdminConsole}
                isMobile={isMobile}
                typingNotice={typingNotice}
                guestName={guestName}
                guestEmail={guestEmail}
                setGuestName={setGuestName}
                setGuestEmail={setGuestEmail}
                showGuestFields={isGuest}
                attachments={attachments}
                onAttachmentsChange={setAttachments}
                fileInputRef={fileInputRef}
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
  isAdminView,
  isAdminConsole,
  isMobile,
  typingNotice,
  showGuestFields,
  guestName,
  guestEmail,
  setGuestName,
  setGuestEmail,
  attachments,
  onAttachmentsChange,
  fileInputRef,
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
  isAdminView: boolean;
  isAdminConsole: boolean;
  isMobile: boolean;
  typingNotice: string;
  showGuestFields?: boolean;
  guestName?: string;
  guestEmail?: string;
  setGuestName?: (value: string) => void;
  setGuestEmail?: (value: string) => void;
  attachments?: File[];
  onAttachmentsChange?: (value: File[]) => void;
  fileInputRef?: RefObject<HTMLInputElement>;
}) {
  return (
    <div className="h-full flex flex-col">
      {!hasConversation && showGuestFields ? (
        <div className="px-3 pt-3 space-y-2">
          <input
            value={guestName || ''}
            onChange={(e) => setGuestName?.(e.target.value)}
            maxLength={80}
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
            placeholder="Your name"
          />
          <input
            value={guestEmail || ''}
            onChange={(e) => setGuestEmail?.(e.target.value)}
            maxLength={120}
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white text-sm"
            placeholder="Your email"
          />
        </div>
      ) : null}

      {!hasConversation && (isUser || showGuestFields) ? (
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

      <div className={`flex-1 overflow-y-auto p-3 pb-24 space-y-2 ${isAdminConsole || isMobile ? 'bg-[#efeae2] dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-950'}`}>
        {messages.length ? (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[85%] px-3 py-2 rounded text-sm ${
                (isAdminView && message.sender_role === 'admin') || (!isAdminView && message.sender_role !== 'admin')
                  ? `ml-auto ${isAdminConsole || isMobile ? 'bg-[#b42318] text-white rounded-2xl rounded-br-md shadow-sm' : 'bg-black text-white'}`
                  : `${isAdminConsole || isMobile ? 'bg-white text-[#111b21] rounded-2xl rounded-bl-md shadow-sm' : 'bg-white dark:bg-gray-800 text-black dark:text-white'}`
              }`}
            >
              <p className="text-[10px] font-semibold opacity-80 mb-1">
                {message.sender_name || message.sender?.name || (message.sender_role === 'admin' ? 'Admin' : message.sender_role === 'guest' ? 'Guest' : 'User')}
              </p>
              <p>{message.message || '[Attachment]'}</p>
              <p className="text-[10px] opacity-70 mt-1">
                {formatTimeSafe(message.created_at)}
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

      <div className={`p-3 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 ${isAdminConsole || isMobile ? 'bg-[#f0f2f5] dark:bg-gray-900' : ''}`}>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []).slice(0, 5);
              onAttachmentsChange?.(files);
            }}
          />
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
            type="button"
            onClick={() => fileInputRef?.current?.click()}
            className="px-2 py-2 rounded border border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Attach{attachments && attachments.length ? ` (${attachments.length})` : ''}
          </button>
          <button
            onClick={() => void onSend()}
            disabled={loading || (!draft.trim() && !(attachments && attachments.length))}
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
