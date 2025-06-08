'use client';

import { useAuth } from '@/contexts/AuthContext';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5193';

export type Team = {
  id: string;
  name: string;
  ownerId: string;
  ownerName?: string;
  members: { userId: string; userName: string; role: string }[];
};

type TeamsContextType = {
  teams: Team[];
  loading: boolean;
  fetchTeams: () => Promise<void>;
  createTeam: (name: string) => Promise<void>;
  inviteToTeam: (teamId: string, email: string) => Promise<void>;
  removeMember: (teamId: string, userId: string) => Promise<void>;
};

const TeamsContext = createContext<TeamsContextType | undefined>(undefined);

export const TeamsProvider = ({ children }: { children: React.ReactNode }) => {
  const { auth } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/Teams`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTeams(data);
    } catch {
      toast.error('No se pudieron cargar los equipos.');
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async (name: string) => {
    try {
      const res = await fetch(`${API_URL}/api/Teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error();
      toast.success('Equipo creado.');
      await fetchTeams();
    } catch {
      toast.error('Error al crear equipo.');
    }
  };

  const inviteToTeam = async (teamId: string, email: string) => {
    try {
      const res = await fetch(`${API_URL}/api/TeamInvitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ teamId, email }),
      });
      if (!res.ok) throw new Error();
      toast.success('Invitación enviada.');
      await fetchTeams();
    } catch {
      toast.error('Error al enviar invitación.');
    }
  };

  const removeMember = async (teamId: string, userId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/Teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error();
      toast.success('Miembro eliminado.');
      await fetchTeams();
    } catch {
      toast.error('No se pudo eliminar el miembro.');
    }
  };

  useEffect(() => {
    if (auth.token) fetchTeams();
  }, [auth.token]);

  const contextValue = useMemo(
    () => ({ teams, loading, fetchTeams, createTeam, inviteToTeam, removeMember }),
    [teams, loading, auth.token],
  );

  return <TeamsContext.Provider value={contextValue}>{children}</TeamsContext.Provider>;
};

export const useTeams = (): TeamsContextType => {
  const context = useContext(TeamsContext);
  if (!context) throw new Error('useTeams debe usarse dentro de un TeamsProvider');
  return context;
};
