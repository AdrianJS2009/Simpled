// src/services/activityLogService.ts

import { API_URL } from '@/next.config';
import type { ActivityLog } from '@/types';

export async function fetchActivityLogs(itemId: string, token: string): Promise<ActivityLog[]> {
  const res = await fetch(`${API_URL}/api/items/${itemId}/activity`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Error al obtener el historial de actividad');
  }

  return res.json();
}
