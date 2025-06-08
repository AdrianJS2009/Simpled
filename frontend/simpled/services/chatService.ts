// Tipos mínimos para el chat
export type ChatRoomReadDto = {
  id: string;
  roomType: 'Team' | 'Board';
  entityId: string;
};

export type ChatMessageReadDto = {
  id: string;
  chatRoomId: string;
  userId: string;
  text: string;
  sentAt: string;
};

export type ChatMessageCreateDto = {
  chatRoomId: string;
  text: string;
};

const API = 'http://localhost:5193/api/Chat';

export async function getOrCreateRoom(
  roomType: 'Team' | 'Board',
  entityId: string,
  token: string,
): Promise<ChatRoomReadDto> {
  const res = await fetch(`${API}/rooms/${roomType}/${entityId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No se pudo obtener la sala de chat.');
  return res.json();
}

export async function getMessages(roomId: string, token: string): Promise<ChatMessageReadDto[]> {
  const res = await fetch(`${API}/rooms/${roomId}/messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('No se pudieron obtener los mensajes.');
  return res.json();
}

export async function sendMessage(
  dto: ChatMessageCreateDto,
  token: string,
): Promise<ChatMessageReadDto> {
  const res = await fetch(`${API}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error('No se pudo enviar el mensaje.');
  return res.json();
}
