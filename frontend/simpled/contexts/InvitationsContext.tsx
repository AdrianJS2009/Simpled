import { API_URL as API } from '@/next.config';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
export type BoardInvite = {
  id: string;
  boardId: string;
  boardName: string;
  role: string;
  token: string;
  createdAt: string;
};

export type TeamInvite = {
  id: string;
  teamId: string;
  teamName: string;
  token: string;
  createdAt: string;
};

type InvitationsContextType = {
  boardInvites: BoardInvite[];
  teamInvites: TeamInvite[];
  totalInvites: number;
  loading: boolean;
  refreshInvites: () => Promise<void>;
  removeBoardInvite: (token: string) => void;
  removeTeamInvite: (token: string) => void;
};

const InvitationsContext = createContext<InvitationsContextType | undefined>(undefined);

export const InvitationsProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth, userData } = useAuth();
  const [boardInvites, setBoardInvites] = useState<BoardInvite[]>([]);
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    if (!auth.token) return;
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.all([
        fetch(`${API}/api/BoardInvitations/user`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
        fetch(`${API}/api/TeamInvitations/user`, {
          headers: { Authorization: `Bearer ${auth.token}` },
        }),
      ]);
      if (!bRes.ok || !tRes.ok) throw new Error();
      setBoardInvites(await bRes.json());
      setTeamInvites(await tRes.json());
    } catch {
      setBoardInvites([]);
      setTeamInvites([]);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => {
    if (!auth.token || !userData?.email) return;
    let eventSource: EventSource | null = null;
    let isMounted = true;
    const connectSSE = () => {
      eventSource = new EventSource(`${API}/api/sse/invitations?access_token=${auth.token}`);
      eventSource.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'board') {
            setBoardInvites((prev) => [payload.data, ...prev]);
          } else if (payload.type === 'team') {
            setTeamInvites((prev) => [payload.data, ...prev]);
          }
        } catch {}
      };
      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
        }

        setTimeout(connectSSE, 5000);
      };
    };
    connectSSE();
    return () => {
      isMounted = false;
      if (eventSource) eventSource.close();
    };
  }, [auth.token, userData?.email]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const removeBoardInvite = (token: string) => {
    setBoardInvites((prev) => prev.filter((i) => i.token !== token));
  };
  const removeTeamInvite = (token: string) => {
    setTeamInvites((prev) => prev.filter((i) => i.token !== token));
  };

  const contextValue = useMemo(
    () => ({
      boardInvites,
      teamInvites,
      totalInvites: boardInvites.length + teamInvites.length,
      loading,
      refreshInvites: fetchInvites,
      removeBoardInvite,
      removeTeamInvite,
    }),
    [boardInvites, teamInvites, loading, fetchInvites, removeBoardInvite, removeTeamInvite],
  );

  return <InvitationsContext.Provider value={contextValue}>{children}</InvitationsContext.Provider>;
};

export const useInvitations = () => {
  const ctx = useContext(InvitationsContext);
  if (!ctx) throw new Error('useInvitations debe usarse dentro de InvitationsProvider');
  return ctx;
};
