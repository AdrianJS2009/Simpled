'use client';

import * as signalR from '@microsoft/signalr';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

type SignalRContextType = {
  connection: signalR.HubConnection | null;
};

const SignalRContext = createContext<SignalRContextType>({ connection: null });

export const useSignalR = () => useContext(SignalRContext);

// Banner de conexión global
function ConnectionBanner({ status }: { status: 'connected' | 'reconnecting' | 'disconnected' }) {
  if (status === 'connected') return null;
  return (
    <div
      className={`fixed top-0 left-0 z-[2000] flex w-full items-center justify-center py-2 text-center font-semibold transition-all ${
        status === 'reconnecting'
          ? 'animate-pulse bg-yellow-400 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100'
          : 'animate-pulse bg-red-500 text-white dark:bg-red-700 dark:text-white'
      } `}
      style={{ letterSpacing: 0.5 }}
    >
      {status === 'reconnecting' ? (
        <>
          <svg className="mr-2 inline h-5 w-5 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
            />
          </svg>
          Reconectando a notificaciones…
        </>
      ) : (
        <>
          <svg
            className="mr-2 inline h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.364 5.636l-1.414 1.414A9 9 0 105.636 18.364l1.414-1.414"
            />
          </svg>
          Conexión perdida. Intentando reconectar…
        </>
      )}
    </div>
  );
}

export const SignalRProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth } = useAuth();
  const { isAuthenticated } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [status, setStatus] = useState<'connected' | 'reconnecting' | 'disconnected'>(
    'disconnected',
  );

  useEffect(() => {
    if (!auth.token) return;
    if (connection) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5193/hubs/board', {
        accessTokenFactory: () => auth.token!,
      })
      .withAutomaticReconnect()
      .build();

    conn.onreconnecting((error) => {
      console.warn('SignalR reconectando', error);
      setStatus('reconnecting');
      toast.info('Reconectando a notificaciones…', {
        toastId: 'sigr-reconnecting',
      });
    });
    conn.onreconnected(() => {
      setStatus('connected');
      toast.dismiss('sigr-reconnecting');
      toast.success('Reconectado a notificaciones', {
        toastId: 'sigr-reconnected',
      });
    });
    conn.onclose((error) => {
      setStatus('disconnected');
      console.error('SignalR cerrado', error);
      toast.error('Se perdió conexión de notificaciones', {
        toastId: 'sigr-closed',
      });
    });

    conn.on('InvitationReceived', (data) => {
      toast.info(`📩 Invitación al tablero "${data.boardName}" como ${data.role}`, {
        toastId: `board-invite-${data.invitationToken}`,
      });
    });
    conn.on('TeamInvitationReceived', (data) => {
      toast.info(`📩 Invitado al equipo "${data.teamName}" como ${data.role}`, {
        toastId: `team-invite-${data.invitationToken}`,
      });
    });
    conn.on('BoardUpdated', (_boardId, action, payload) => {
      // Filter out toasts for the user who originated the action
      const currentUserId = auth.id;
      // Prefer payload.userId, fallback to payload.assigneeId for assignment events
      const originUserId = payload?.userId ?? payload?.assigneeId ?? null;
      if (originUserId && originUserId === currentUserId) {
        // Do not show toast for self-originated events
        return;
      }
      // Notificación in-app para acciones relevantes
      const actionMap: Record<string, { icon: string; color: string; label: string }> = {
        ColumnCreated: { icon: '📌', color: '#2563eb', label: 'Columna creada' },
        ColumnDeleted: { icon: '🗑️', color: '#ef4444', label: 'Columna eliminada' },
        ItemCreated: { icon: '✅', color: '#22c55e', label: 'Tarea creada' },
        ItemDeleted: { icon: '🗑️', color: '#ef4444', label: 'Tarea eliminada' },
        ItemUpdated: { icon: '✏️', color: '#f59e42', label: 'Tarea actualizada' },
        ItemStatusChanged: { icon: '📍', color: '#6366f1', label: 'Estado de tarea cambiado' },
        SubtaskCreated: { icon: '📝', color: '#0ea5e9', label: 'Subtarea creada' },
        SubtaskDeleted: { icon: '🗑️', color: '#ef4444', label: 'Subtarea eliminada' },
      };
      if (actionMap[action]) {
        const { icon, color, label } = actionMap[action];
        toast.info(
          <span style={{ color }} className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <span>{label}</span>
            {payload?.title && <span className="ml-1 font-semibold">{payload.title}</span>}
          </span>,
          {
            toastId: `board-action-${action}-${payload?.id || payload?.columnId}`,
            autoClose: 3500,
          },
        );
      }
      // Puedes añadir más lógica aquí para banners, sonidos, etc.
      console.log('📡 BoardUpdated', { action, payload });
    });

    conn
      .start()
      .then(() => {
        setConnection(conn);
        setStatus('connected');
        console.log('✅ SignalR conectado');
      })
      .catch((err) => {
        console.error('❌ Error al conectar SignalR', err);
        toast.error('No se pudo conectar a notificaciones');
        setStatus('disconnected');
      });

    const handleUnload = () => conn.stop();
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [auth.token, connection]);

  useEffect(() => {
    if (!auth.token && connection) {
      connection.stop();
      setConnection(null);
      setStatus('disconnected');
    }
  }, [auth.token, connection]);

  const value = useMemo(() => ({ connection }), [connection]);

  return (
    <SignalRContext.Provider value={value}>
      {isAuthenticated && <ConnectionBanner status={status} />}
      {children}
    </SignalRContext.Provider>
  );
};
