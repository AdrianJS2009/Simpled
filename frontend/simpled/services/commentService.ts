import type { Comment } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5193';

export async function fetchComments(itemId: string, token: string): Promise<Comment[]> {
  const res = await fetch(`${API_URL}/api/items/${itemId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Error al obtener los comentarios');
  }
  return res.json();
}

export async function addComment(itemId: string, text: string, token: string): Promise<Comment> {
  const res = await fetch(`${API_URL}/api/items/${itemId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ itemId, text }),
  });
  if (!res.ok) {
    throw new Error('Error al añadir comentario');
  }
  return res.json();
}

export async function updateComment(
  commentId: string,
  itemId: string,
  text: string,
  token: string,
): Promise<Comment> {
  const res = await fetch(`${API_URL}/api/items/${itemId}/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ itemId, commentId, text }),
  });
  if (!res.ok) {
    throw new Error('Error al editar comentario');
  }
  return res.json();
}

export async function deleteComment(
  commentId: string,
  itemId: string,
  token: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/items/${itemId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Error al eliminar comentario');
  }
}

export async function resolveComment(
  commentId: string,
  itemId: string,
  resolved: boolean,
  token: string,
): Promise<void> {
  const res = await fetch(
    `${API_URL}/api/items/${itemId}/comments/${commentId}/resolve?resolved=${resolved}`,
    {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!res.ok) {
    throw new Error('Error al cambiar estado de comentario');
  }
}
