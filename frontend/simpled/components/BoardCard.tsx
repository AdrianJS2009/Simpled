'use client';

import { useAuth } from '@/contexts/AuthContext';
import { type Board, useBoards } from '@/contexts/BoardsContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { CalendarDays, Clock, NotebookPen, Star, StarOff, Trash2Icon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'react-toastify';
import BoardEditModal from './BoardEditModal';

export default function BoardCard({ board }: { readonly board: Board }) {
  const { auth, toggleFavoriteBoard } = useAuth();
  const { deleteBoard, fetchBoards } = useBoards();
  const [showEdit, setShowEdit] = useState(false);
  const [isFavorite, setIsFavorite] = useState(board.isFavorite);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFavoriteToggling, setIsFavoriteToggling] = useState(false);

  const userId = getUserIdFromToken(auth.token);
  const isOwner = userId === board.ownerId;

  const handleDelete = async () => {
    if (confirm('¿Seguro que deseas eliminar este tablero?')) {
      setIsDeleting(true);
      try {
        deleteBoard(board.id);
      } catch (error) {
        console.error('Error al eliminar el tablero:', error);
        toast.error('Error al eliminar el tablero');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const toggleFavorite = async () => {
    setIsFavoriteToggling(true);
    try {
      toggleFavoriteBoard(board.id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error al actualizar favorito:', error);
      toast.error('No se pudo actualizar el estado de favorito');
    } finally {
      setIsFavoriteToggling(false);
    }
  };

  const formattedDate = (board as any).updatedAt
    ? new Date((board as any).updatedAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{ y: -5, transition: { duration: 0.2 } }}
      >
        <Link href={`/tableros/${board.id}`} className="block h-full">
          <div
            className={cn(
              'group bg-card flex h-full min-h-[180px] flex-col rounded border p-4 transition-all duration-300 hover:shadow-md',
              isDeleting && 'opacity-50',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="group-hover:text-primary mb-1 text-lg font-bold transition-colors">
                  {board.name}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {board.isPublic ? 'Público' : 'Privado'}
                </p>
              </div>
              <div className="flex min-w-[32px] flex-col items-center gap-2">
                <motion.button
                  disabled={isFavoriteToggling}
                  title={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                  className="text-yellow-500 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite();
                  }}
                >
                  {isFavorite ? (
                    <Star className="size-5 fill-yellow-500" />
                  ) : (
                    <StarOff className="size-5" />
                  )}
                </motion.button>
                {isOwner && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setShowEdit(true);
                      }}
                      title="Editar"
                      className="transition-all duration-300"
                    >
                      <NotebookPen className="size-5 text-blue-500 transition-transform hover:scale-110 hover:text-blue-700" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleDelete();
                      }}
                      disabled={isDeleting}
                      title="Eliminar"
                      className="transition-all duration-300"
                    >
                      <Trash2Icon className="size-5 text-red-500 transition-transform hover:scale-110 hover:text-red-700" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="text-muted-foreground mt-auto flex items-center justify-between pt-4 text-xs">
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {formattedDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                Actualizado
              </span>
            </div>
          </div>
        </Link>
      </motion.div>

      {showEdit && <BoardEditModal board={board} onClose={() => setShowEdit(false)} />}
    </>
  );
}

// Decodificación del token para obtener el ID del usuario
function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  } catch (error) {
    console.error('Error al decodificar el token:', error);
    return null;
  }
}
