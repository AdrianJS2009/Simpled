'use client';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5193';

type User = {
  id: string | null;
  name: string;
  email: string;
  imageUrl: string;
  isOnline: boolean;
  roles: string[];
  achievementsCompleted: number;
  achievements: Achievement[];
  teams: Team[];
  isBanned: boolean;
};

interface Achievement {
  id: string;
  title: string;
  description?: string;
}

interface Team {
  key: string;
  name: string;
  role: string;
}

interface FavoriteBoard {
  id: string;
  name: string;
}

type AuthContextType = {
  auth: { token: string | null; id: string | null };
  loginUser: (email: string, password: string, keepUserLoggedIn: boolean) => Promise<void>;
  userData: User | null;
  favoriteBoards: FavoriteBoard[] | undefined;
  registerUser: (
    name: string,
    email: string,
    password: string,
    image: File | null,
  ) => Promise<void>;
  updateUser: (
    id: string,
    name: string,
    email: string,
    imageUrl: string,
    password: string,
    image: File | null,
  ) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  fetchUserProfile: (userId: string) => Promise<User | null>;
  fetchFavoriteBoards: () => void;
  checkFavoriteBoard: (boardId: string) => void;
  toggleFavoriteBoard: (boardId: string) => void;
  externalLogin: (provider: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<{ token: string | null; id: string | null }>({
    token: null,
    id: null,
  });
  const [isAuthenticated, setAuthenticated] = useState(false);
  const [userData, setUserData] = useState<User | null>(null);
  const [favoriteBoards, setFavoriteBoards] = useState<FavoriteBoard[]>([]);
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== 'undefined'
        ? (sessionStorage.getItem('token') ?? localStorage.getItem('token'))
        : null;

    const id =
      typeof window !== 'undefined'
        ? (sessionStorage.getItem('userId') ?? localStorage.getItem('userId'))
        : null;

    if (token && id) {
      setAuth({ token, id });
    }
  }, []);

  useEffect(() => {
    setAuthenticated(!!auth.token);
  }, [auth.token]);

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/Users/${userId}`);
      if (!response.ok) throw new Error('Error al obtener perfil.');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener el perfil del usuario:', error);
      return null;
    }
  };

  useEffect(() => {
    const getUserData = async () => {
      if (auth.id && !userData) {
        const profile = await fetchUserProfile(auth.id);
        setUserData(profile);
      }
    };
    getUserData();
    fetchFavoriteBoards();
  }, [auth.id, userData]);

  const loginUser = async (email: string, password: string, keepUserLoggedIn: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/Auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.status === 403) {
        const msg = await response.text();
        if (msg && msg.toLowerCase().includes('baneado')) {
          throw { banned: true };
        }
      }

      if (!response.ok) {
        try {
          const userRes = await fetch(`${API_URL}/api/Users`);
          if (userRes.ok) {
            const users = await userRes.json();
            const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
            if (user && user.isBanned) {
              throw { banned: true };
            }
          }
        } catch {}
        throw new Error('Credenciales incorrectas o error en el servidor.');
      }

      const { token, id } = await response.json();
      const userRes = await fetch(`${API_URL}/api/Users/${id}`);
      if (!userRes.ok) throw new Error('Error al obtener perfil.');
      const user = await userRes.json();
      if (user.isBanned) {
        throw { banned: true };
      }
      setAuth({ token, id });

      if (keepUserLoggedIn) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', id);
      } else {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('userId', id);
      }

      toast.success('Sesión iniciada correctamente.');
      router.push('/');
    } catch (error: any) {
      if (error && error.banned) {
        throw { banned: true };
      }
      console.error('Error al iniciar sesión:', error);
      toast.error('Correo o contraseña incorrectos.');
    }
  };

  const registerUser = async (
    name: string,
    email: string,
    password: string,
    image: File | null,
  ) => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('password', password);
      if (image) formData.append('image', image);

      const response = await fetch(`${API_URL}/api/Users/register`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al registrar usuario.');

      toast.success('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
      router.push('/login');
    } catch (error) {
      console.error('Error registrando usuario:', error);
      toast.error('Error al registrar usuario. Intenta nuevamente.');
    }
  };

  const updateUser = async (
    id: string,
    name: string,
    email: string,
    imageUrl: string,
    password: string,
    image: File | null,
  ) => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('imageUrl', imageUrl);
      formData.append('password', password);
      if (image) formData.append('image', image);

      const response = await fetch(`${API_URL}/api/Users/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) throw new Error('Error al actualizar usuario.');

      toast.success('Perfil actualizado correctamente.');
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      toast.error('Error al actualizar usuario. Intenta nuevamente.');
    }
  };

  const logout = () => {
    setAuth({ token: null, id: null });
    setUserData(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userId');
    setAuthenticated(false);
    router.push('/login');
    toast.info('Sesión cerrada.');
  };

  const fetchFavoriteBoards = async () => {
    try {
      const response = await fetch(`${API_URL}/api/favorite-boards`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      if (!response.ok) throw new Error('Error al obtener la lista de favoritos.');
      const data = await response.json();
      setFavoriteBoards(data);
    } catch (error) {
      console.error('Error al obtener la lista de favoritos:', error);
      return null;
    }
  };

  const toggleFavoriteBoard = async (boardId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/favorite-boards/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ boardId }),
      });

      if (!response.ok) throw new Error('Error al actualizar favorito.');

      const data = await response.json();
      toast.success(
        data.favorite ? 'Tablero añadido a favoritos.' : 'Tablero eliminado de favoritos.',
      );

      return data.favorite;
    } catch (error) {
      console.error('Error modificando el estado del board', error);
      toast.error('No se pudo actualizar el estado del favorito.');
      return null;
    }
  };

  const checkFavoriteBoard = async (boardId: string): Promise<boolean | null> => {
    try {
      const response = await fetch(`${API_URL}/api/favorite-boards/check-favorite/${boardId}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error('Error al comprobar favorito.');

      const data = await response.json();
      return data.favorite;
    } catch (error) {
      console.error('Error comprobando si es favorito:', error);
      return null;
    }
  };

  const authContextValue = useMemo(
    () => ({
      auth,
      loginUser,
      registerUser,
      updateUser,
      logout,
      isAuthenticated,
      userData,
      favoriteBoards,
      fetchUserProfile,
      fetchFavoriteBoards,
      toggleFavoriteBoard,
      checkFavoriteBoard,
      externalLogin: (provider: string) => {
        const redirectUrl = `${API_URL}/api/Auth/external-login/${provider}`;
        window.location.href = redirectUrl;
      },
    }),
    [auth, isAuthenticated, userData],
  );

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
