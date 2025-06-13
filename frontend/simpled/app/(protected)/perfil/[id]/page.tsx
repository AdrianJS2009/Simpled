'use client';

import AchievementCounter from '@/components/AchievementCounter';
import FavoriteList from '@/components/FavoriteList';
import InvitationsModal from '@/components/InvitationModal';
import ProfileHeader from '@/components/ProfileHeader';
import TeamsList from '@/components/TeamsList';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/next.config';
import { notFound } from 'next/navigation';
import { use, useEffect, useState } from 'react';

interface FavoriteBoard {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isOnline: boolean;
  roles: string[];
  achievementsCompleted: number;
  achievements: Achievement[];
  teams: Team[];
  isBanned: boolean;
}

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

export default function ProfilePage({ params }: { readonly params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { fetchUserProfile, auth } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [showInvites, setShowInvites] = useState(false);
  const [userFavorites, setUserFavorites] = useState<FavoriteBoard[]>([]);

  useEffect(() => {
    const loadUser = async () => {
      const data = await fetchUserProfile(id);
      setUser(data);
    };
    loadUser();
  }, [id, fetchUserProfile]);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const response = await fetch(`${API_URL}/api/favorite-boards/user/${id}`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });
        if (!response.ok) throw new Error('Error al obtener favoritos.');
        const data = await response.json();
        setUserFavorites(data);
      } catch (error) {
        console.error('Error al cargar favoritos:', error);
        setUserFavorites([]);
      }
    };

    if (auth.token) {
      loadFavorites();
    }
  }, [id, auth.token]);

  if (!user) {
    return <div className="py-12 text-center">Loading user profile...</div>;
  }
  if (!user.id) {
    notFound();
  }

  const isOwner = auth.id === user.id;

  return (
    <div className="container mx-auto min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <ProfileHeader user={user} isOwner={isOwner} />
        <div className="mt-4">
          <FavoriteList list={userFavorites} />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <AchievementCounter achievements={user.achievementsCompleted} userId={user.id} />
          <TeamsList teams={user.teams} />
        </div>
      </div>

      {showInvites && <InvitationsModal onClose={() => setShowInvites(false)} />}
    </div>
  );
}
