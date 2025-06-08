import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useSignalR } from '@/contexts/SignalRContext';
import {
  ChatMessageReadDto,
  getMessages,
  getOrCreateRoom,
  sendMessage,
} from '@/services/chatService';
import { MessageSquare, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

const API_URL = 'https://localhost:7177';

interface MemberInfo {
  userId: string;
  name: string;
  imageUrl?: string;
}

interface ChatPanelProps {
  roomType: 'Team' | 'Board';
  entityId: string;
  members?: MemberInfo[]; // Lista de miembros para mostrar nombre y foto
}

export default function ChatPanel({ roomType, entityId, members }: ChatPanelProps) {
  const { auth, userData } = useAuth();
  const { connection } = useSignalR();
  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageReadDto[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastReadMessageRef = useRef<string | null>(null);

  // Para mostrar "escribiendo" (opcional, si se implementa en backend)
  // const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Obtener sala y mensajes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    (async () => {
      try {
        const room = await getOrCreateRoom(roomType, entityId, auth.token!);
        if (!isMounted) return;
        setRoomId(room.id);
        const msgs = await getMessages(room.id, auth.token!);
        if (!isMounted) return;
        setMessages(msgs);
        if (msgs.length > 0) {
          lastReadMessageRef.current = msgs[msgs.length - 1].id;
        }
      } catch (err) {
        toast.error('No se pudo cargar el chat');
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [roomType, entityId, auth.token]);

  // SignalR: unirse al grupo y recibir mensajes en tiempo real
  useEffect(() => {
    if (!connection || !roomId) return;
    let mounted = true;
    const join = async () => {
      try {
        if (roomType === 'Team') {
          await connection.invoke('JoinTeamRoom', entityId);
        } else {
          await connection.invoke('JoinBoardRoom', entityId);
        }
      } catch (err) {
        // Puede que ya esté unido
      }
    };
    join();
    const handler = (msg: ChatMessageReadDto) => {
      if (!mounted) return;
      setMessages((prev) => [...prev, msg]);
      if (!isVisible) {
        setUnreadMessages((prev) => prev + 1);
        toast.info(`Nuevo mensaje de ${getUserInfo(msg.userId).name}`, {
          toastId: `chat-msg-${msg.id}`,
        });
      } else {
        lastReadMessageRef.current = msg.id;
      }
    };
    connection.on('ReceiveMessage', handler);
    return () => {
      mounted = false;
      connection.off('ReceiveMessage', handler);
      if (roomId) connection.invoke('LeaveRoom', roomId).catch(() => {});
    };
  }, [connection, roomId, roomType, entityId, isVisible]);

  useEffect(() => {
    if (isVisible) {
      setUnreadMessages(0);
      if (messages.length > 0) {
        lastReadMessageRef.current = messages[messages.length - 1].id;
      }
    }
  }, [isVisible, messages]);

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !roomId) return;
    setSending(true);
    try {
      await sendMessage({ chatRoomId: roomId, text: input }, auth.token!);
      setInput('');
      // El mensaje llegará por SignalR
    } catch {
      toast.error('No se pudo enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  // Busca el usuario en la lista de miembros o usa el usuario autenticado
  const getUserInfo = (userId: string) => {
    if (userId === userData?.id) return { name: userData.name, imageUrl: userData.imageUrl };
    if (members) {
      const m = members.find((u) => u.userId === userId);
      if (m) return { name: m.name, imageUrl: m.imageUrl };
    }
    return { name: 'Usuario', imageUrl: undefined };
  };

  if (!isVisible) {
    return (
      <div className="fixed right-4 bottom-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          className="relative flex items-center gap-2"
          size="lg"
        >
          <MessageSquare className="h-5 w-5" />
          {unreadMessages > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadMessages}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="relative flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">
          Chat {roomType === 'Team' ? 'del Equipo' : 'del Tablero'}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="mb-10 max-h-[500px] flex-1 overflow-y-scroll px-0 pb-1">
        {loading ? (
          <div className="text-muted-foreground py-8 text-center">Cargando chat…</div>
        ) : (
          <div className="flex flex-col gap-3 px-2">
            {messages.length === 0 && (
              <div className="text-muted-foreground py-8 text-center">No hay mensajes aún.</div>
            )}
            {messages.map((msg) => {
              const isMe = msg.userId === userData?.id;
              const user = getUserInfo(msg.userId);
              return (
                <div
                  key={msg.id}
                  className={`flex w-full items-end ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {/* Avatar a la izquierda para otros, a la derecha para ti */}
                  {!isMe && (
                    <div className="mr-2 flex-shrink-0">
                      <Avatar className="h-8 w-8">
                        {user.imageUrl ? (
                          <img
                            src={`${API_URL}${user.imageUrl}`}
                            alt={user.name}
                            className="h-8 w-8 rounded-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-bold">
                            {user.name?.[0] || '?'}
                          </span>
                        )}
                      </Avatar>
                    </div>
                  )}
                  <div
                    className={`flex max-w-[70%] flex-col rounded-lg px-3 py-2 shadow ${isMe ? 'items-end bg-blue-600 text-white' : 'items-start bg-gray-800 text-white'}`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-semibold">{user.name}</span>
                      <span className="text-[10px] text-gray-300">
                        {new Date(msg.sentAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div className="text-sm break-words whitespace-pre-line">{msg.text}</div>
                  </div>
                  {isMe && (
                    <div className="ml-2 flex-shrink-0">
                      <Avatar className="h-8 w-8">
                        {userData?.imageUrl ? (
                          <img
                            src={`${API_URL}${userData.imageUrl}`}
                            alt={userData.name}
                            className="h-8 w-8 rounded-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-400 text-sm font-bold">
                            {userData?.name?.[0] || '?'}
                          </span>
                        )}
                      </Avatar>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </CardContent>
      <form
        onSubmit={handleSend}
        className="absolute right-0 bottom-0 left-0 flex items-center gap-2 p-3"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1"
          maxLength={1000}
          disabled={sending || loading}
          autoComplete="off"
        />
        <Button type="submit" disabled={sending || loading || !input.trim()}>
          Enviar
        </Button>
      </form>
    </Card>
  );
}
