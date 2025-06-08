'use client';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const API_URL = 'http://localhost:5193';

export type Board = {
  id: string;
  name: string;
  isPublic: boolean;
  ownerId?: string;
  userRole?: 'admin' | 'editor' | 'viewer';
  isFavorite: boolean;
};

type BoardsContextType = {
  boards: Board[];
  loading: boolean;
  fetchBoards: () => Promise<void>;
  createBoard: (name: string, isPublic?: boolean) => Promise<void>;
  updateBoard: (id: string, data: { name: string; isPublic: boolean }) => Promise<void>;
  deleteBoard: (id: string) => Promise<void>;
};

const BoardsContext = createContext<BoardsContextType | undefined>(undefined);

export const BoardsProvider = ({ children }: { children: React.ReactNode }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const { auth } = useAuth();

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const headers: HeadersInit = {};
      if (auth.token) {
        headers['Authorization'] = `Bearer ${auth.token}`;
      }

      const res = await fetch(`${API_URL}/api/Boards`, {
        method: 'GET',
        headers,
      });

      if (!res.ok) throw new Error('Error al obtener tableros.');

      const data: Board[] = await res.json();
      setBoards(data);
    } catch (err) {
      console.error(err);
      toast.error('No se pudieron cargar los tableros.');
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (name: string, isPublic = false) => {
    try {
      const res = await fetch(`${API_URL}/api/Boards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ name, isPublic }),
      });

      if (!res.ok) throw new Error('No se pudo crear el tablero.');

      toast.success('Tablero creado correctamente.');
      await fetchBoards();
    } catch (err) {
      console.error(err);
      toast.error('Error al crear el tablero.');
    }
  };

  const updateBoard = async (id: string, data: { name: string; isPublic: boolean }) => {
    try {
      const res = await fetch(`${API_URL}/api/Boards/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ id, ...data }),
      });

      if (!res.ok) throw new Error('Error al actualizar el tablero.');

      toast.success('Tablero actualizado correctamente.');
      await fetchBoards();
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar el tablero.');
    }
  };

  const deleteBoard = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/api/Boards/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      if (!res.ok) throw new Error('Error al eliminar el tablero.');

      toast.success('Tablero eliminado.');
      await fetchBoards();
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar el tablero.');
    }
  };

  useEffect(() => {
    fetchBoards();
  }, [auth.token]);

  const contextValue = useMemo(
    () => ({
      boards,
      loading,
      fetchBoards,
      createBoard,
      updateBoard,
      deleteBoard,
    }),
    [boards, loading, auth.token],
  );

  return <BoardsContext.Provider value={contextValue}>{children}</BoardsContext.Provider>;
};

export const useBoards = (): BoardsContextType => {
  const context = useContext(BoardsContext);
  if (!context) {
    throw new Error('useBoards debe usarse dentro de un BoardsProvider');
  }
  return context;
};
