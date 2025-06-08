'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import type { ActivityLog as ActivityLogBase } from '@/types';
import { formatDistanceToNow, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Clock, Edit, MessageSquare, Tag, Trash2, UserPlus } from 'lucide-react';
import React from 'react';

type ActivityLog = ActivityLogBase & {
  oldValueName?: string;
  newValueName?: string;
};

interface ActivityLogProps {
  logs: ActivityLog[];
  users?: { id: string; name: string }[];
}

function getUserNameById(id?: string | null, users?: { id: string; name: string }[]) {
  if (!id) return 'Sin asignar';
  if (!users) return id;
  const user = users.find((u) => u.id === id);
  return user ? user.name : id;
}

function formatDateString(dateStr?: string | null) {
  if (!dateStr) return '';
  // Intenta parsear la fecha
  let date: Date;
  try {
    date = new Date(dateStr);
  } catch {
    return dateStr;
  }
  if (!isValid(date)) return dateStr;
  // Formato local: dd/MM/yyyy HH:mm
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getActivityMessage(log: ActivityLog, users?: { id: string; name: string }[]) {
  switch (log.type) {
    case 'Created':
      return `Tarea creada por ${log.userName}`;
    case 'Updated':
      if (['StartDate', 'DueDate'].includes(log.field || '')) {
        return (
          <>
            {log.userName} cambió la fecha:{' '}
            <span className="font-semibold">'{formatDateString(log.oldValue)}'</span> →{' '}
            <span className="font-semibold">'{formatDateString(log.newValue)}'</span>
          </>
        );
      }
      if (log.field === 'assigneeId') {
        return (
          <>
            {log.userName} cambió el responsable:{' '}
            <span className="font-semibold">
              {log.oldValueName ||
                getUserNameById(
                  log.oldValue && typeof log.oldValue === 'string' ? log.oldValue : undefined,
                  users,
                )}
            </span>{' '}
            →{' '}
            <span className="font-semibold">
              {log.newValueName ||
                getUserNameById(
                  log.newValue && typeof log.newValue === 'string' ? log.newValue : undefined,
                  users,
                )}
            </span>
          </>
        );
      }
      // Si el campo parece una fecha, también lo formateo
      if (log.field && /date/i.test(log.field)) {
        return (
          <>
            {log.userName} actualizó <span className="font-semibold">{log.field}</span>: '
            {formatDateString(log.oldValue)}' → '{formatDateString(log.newValue)}'
          </>
        );
      }
      return log.field ? (
        <>
          {log.userName} actualizó <span className="font-semibold">{log.field}</span>: '
          {log.oldValue}' → '{log.newValue}'
        </>
      ) : (
        `${log.userName} actualizó la tarea`
      );
    case 'StatusChanged':
      return (
        <>
          {log.userName} cambió el estado: <span className="font-semibold">{log.oldValue}</span> →{' '}
          <span className="font-semibold">{log.newValue}</span>
        </>
      );
    case 'Assigned':
      return (
        <>
          {log.userName} cambió el responsable:{' '}
          <span className="font-semibold">
            {log.oldValueName ||
              getUserNameById(
                log.oldValue && typeof log.oldValue === 'string' ? log.oldValue : undefined,
                users,
              )}
          </span>{' '}
          →{' '}
          <span className="font-semibold">
            {log.newValueName ||
              getUserNameById(
                log.newValue && typeof log.newValue === 'string' ? log.newValue : undefined,
                users,
              )}
          </span>
        </>
      );
    case 'DateChanged':
      return (
        <>
          {log.userName} cambió la fecha:{' '}
          <span className="font-semibold">'{formatDateString(log.oldValue)}'</span> →{' '}
          <span className="font-semibold">'{formatDateString(log.newValue)}'</span>
        </>
      );
    case 'Deleted':
      return `${log.userName} eliminó la tarea`;
    case 'FileUploaded':
      return `${log.userName} subió un archivo: ${log.details}`;
    case 'SubtaskCreated':
      return `${log.userName} creó una subtarea: ${log.details}`;
    case 'SubtaskUpdated':
      return `${log.userName} actualizó una subtarea: ${log.details}`;
    case 'SubtaskDeleted':
      return `${log.userName} eliminó una subtarea`;
    default:
      return `${log.userName} realizó una acción`;
  }
}

const getActivityIcon = (type: string, field?: string) => {
  switch (type) {
    case 'Created':
      return <Edit className="h-4 w-4 text-blue-500" />;
    case 'Updated':
      if (['StartDate', 'DueDate'].includes(field || '')) {
        return <Clock className="h-4 w-4 text-amber-500" />;
      }
      return <Edit className="h-4 w-4 text-amber-500" />;
    case 'StatusChanged':
      return <Tag className="h-4 w-4 text-blue-500" />;
    case 'Assigned':
      return <UserPlus className="h-4 w-4 text-rose-500" />;
    case 'Deleted':
      return <Trash2 className="h-4 w-4 text-red-500" />;
    case 'FileUploaded':
      return <MessageSquare className="h-4 w-4 text-purple-500" />;
    case 'SubtaskCreated':
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    case 'SubtaskUpdated':
      return <CheckCircle2 className="h-4 w-4 text-amber-500" />;
    case 'SubtaskDeleted':
      return <Trash2 className="h-4 w-4 text-red-500" />;
    default:
      return <Edit className="h-4 w-4 text-gray-500" />;
  }
};

export const ActivityLogComponent: React.FC<ActivityLogProps> = ({ logs, users }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-medium">Historial de Actividad</h3>
    {logs.length > 0 ? (
      <div className="space-y-3">
        {logs.map((log) => (
          <Card key={log.id}>
            <CardContent className="p-3">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={
                      log.userAvatarUrl
                        ? log.userAvatarUrl.startsWith('http')
                          ? log.userAvatarUrl
                          : `http://localhost:5193${log.userAvatarUrl}`
                        : '/images/default/avatar-default.jpg'
                    }
                    alt={log.userName}
                  />
                  <AvatarFallback>{log.userName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getActivityIcon(
                      log.type,
                      log.field && typeof log.field === 'string' ? log.field : undefined,
                    )}
                    <span className="font-medium">{getActivityMessage(log, users)}</span>
                    <span className="text-muted-foreground text-xs">
                      {formatDistanceToNow(new Date(log.timestamp), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ) : (
      <p className="text-muted-foreground py-4 text-center">
        No hay actividad registrada para esta tarea.
      </p>
    )}
  </div>
);
