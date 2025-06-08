const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5193';

export async function updateBoardMemberRole({
  boardId,
  userId,
  role,
  token,
}: {
  boardId: string;
  userId: string;
  role: string;
  token: string;
}) {
  const res = await fetch(`${API_URL}/api/BoardMembers`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ boardId, userId, role }),
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error actualizando rol');
}

export async function deleteBoardMember(boardId: string, userId: string, token: string) {
  const res = await fetch(`${API_URL}/api/BoardMembers/${boardId}/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Error eliminando miembro');
}
