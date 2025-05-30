'use client';

import EditProfileModal from '@/components/EditProfileModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useState } from 'react';

const API_URL = 'http://localhost:5193';

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isOnline: boolean;
}

interface ProfileHeaderProps {
  readonly user: User;
  readonly isOwner: boolean;
}

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
            <Image
              src={
                `${API_URL}${user.imageUrl}` ||
                'https://s3.amazonaws.com/comicgeeks/characters/avatars/23353.jpg'
              }
              alt={user.name}
              fill
              className="object-cover"
            />
          </div>
          <div
            className={`absolute right-1 bottom-1 h-4 w-4 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-400'} border-2 border-white dark:border-gray-800`}
          ></div>
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
