'use client';

import EditProfileModal from '@/components/EditProfileModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { API_URL } from '@/next.config';
import Image from 'next/image';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isOnline: boolean;
  isExternal?: boolean;
  provider?: string;
}

interface ProfileHeaderProps {
  readonly user: User;
  readonly isOwner: boolean;
}

const getImageSrc = (imageUrl: string) => {
  if (!imageUrl) return '/images/default/avatar-default.jpg';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  return `${API_URL}${imageUrl}`;
};

export default function ProfileHeader({ user, isOwner }: ProfileHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Card className="h-full">
      <CardContent className="flex flex-col items-center md:flex-row">
        <div className="relative">
          <div
            className={`absolute h-full w-full rounded-full border-2 ${user.isOnline ? 'border-green-500' : 'border-gray-400'}`}
          ></div>
          <div
            className={`relative h-32 w-32 overflow-hidden rounded-full ${user.isOnline ? 'border-green-500' : 'border-gray-400'} border-2`}
          >
            <Image src={getImageSrc(user.imageUrl)} alt={user.name} fill className="object-cover" />
          </div>
        </div>

        <div className="mt-4 flex-1 text-center md:mt-0 md:ml-8 md:text-left">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
        </div>

        {isOwner && (
          <div className="mt-4 md:mt-0">
            <Button onClick={() => setIsModalOpen(true)}>Editar Perfil</Button>
          </div>
        )}

        {isOwner && (
          <EditProfileModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            user={user}
          />
        )}
      </CardContent>
    </Card>
  );
}
