'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowBigDown, Image } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface User {
  id: string;
  name: string;
  email: string;
  imageUrl: string;
  isExternal?: boolean;
  provider?: string;
}

interface EditProfileModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly user: User;
}

export default function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { updateUser, logout } = useAuth();

  const [modifyPassword, setModifyPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    imageUrl: user.imageUrl || '',
    password: '',
  });

  const [image, setImage] = useState<File | null>(null);

  const isExternal = (user as any).isExternal || (user as any).provider;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedImage = e.target.files[0];
      if (selectedImage.size > 2 * 1024 * 1024) {
        toast.error('La imagen es demasiado grande (máximo 2MB)');
        return;
      }
      setImage(selectedImage);
      formData.imageUrl = '';
    }
  };

  const handleDefaultImage = () => {
    setImage(null);

    formData.imageUrl = 'default';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!modifyPassword) {
        formData.password = '';
      }

      await updateUser(
        user.id,
        formData.name,
        formData.email,
        formData.imageUrl,
        formData.password,
        image,
      );
      onClose();

      if (formData.password.trim() !== '') {
        logout();
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      toast.error('Error al actualizar el perfil.');
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Editar Perfil</SheetTitle>
          <SheetDescription>Actualiza tu información de perfil</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 font-medium">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isExternal}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Foto de Perfil</Label>
            <div className="flex items-center gap-4">
              <Image className="h-16 w-16 rounded-full object-cover" />
              <Input
                id="image"
                name="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <Button type="button" onClick={handleDefaultImage} className="w-full">
              Seleccionar imagen por defecto
            </Button>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              onClick={() => setModifyPassword(!modifyPassword)}
              className="w-full"
              disabled={isExternal}
            >
              <span>Modificar contraseña</span>
              <div
                className={`transition-transform duration-300 ${
                  modifyPassword ? 'rotate-180' : ''
                }`}
              >
                <ArrowBigDown className="h-4 w-4 transform" />
              </div>
            </Button>
            <p className="text-muted-foreground text-sm">
              Si este campo está abierto durante el envío se cerrará sesión, si está cerrado se
              perderán los cambios.
            </p>

            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${
                modifyPassword ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              {modifyPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                    disabled={isExternal}
                  />
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="pt-4">
            <Button type="submit" className="w-full">
              Guardar Cambios
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
