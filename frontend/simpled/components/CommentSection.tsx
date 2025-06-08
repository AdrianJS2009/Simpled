'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import type { Comment } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle, Edit2, Loader2, MoreHorizontal, Send, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

interface CommentSectionProps {
  readonly itemId: string;
  readonly comments: Comment[];
  readonly onAddComment: (text: string) => Promise<void>;
  readonly onUpdateComment: (commentId: string, text: string) => Promise<void>;
  readonly onDeleteComment: (commentId: string) => Promise<void>;
  readonly onResolveComment: (commentId: string, isResolved: boolean) => Promise<void>;
}

export function CommentSection({
  itemId,
  comments,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onResolveComment,
}: CommentSectionProps) {
  const { userData } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState<string | null>(null);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('No se pudo añadir el comentario');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEditing = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.text);
  };

  const handleCancelEditing = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editText.trim()) return;

    setIsUpdating(true);
    try {
      await onUpdateComment(commentId, editText.trim());
      setEditingCommentId(null);
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('No se pudo actualizar el comentario');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setIsDeleting(commentId);
    try {
      await onDeleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('No se pudo eliminar el comentario');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleResolveComment = async (commentId: string, currentStatus: boolean) => {
    setIsResolving(commentId);
    try {
      await onResolveComment(commentId, !currentStatus);
    } catch (error) {
      console.error('Error resolving comment:', error);
      toast.error('No se pudo actualizar el estado del comentario');
    } finally {
      setIsResolving(null);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Comentarios</h3>

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <Card
              key={comment.id}
              className={`relative ${comment.isResolved ? 'bg-muted/50' : ''}`}
            >
              {comment.isResolved && (
                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                  <CheckCircle className="h-3 w-3" />
                  <span>Resuelto</span>
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={
                          comment.userImageUrl
                            ? comment.userImageUrl.startsWith('http')
                              ? comment.userImageUrl
                              : `http://localhost:5193${comment.userImageUrl}`
                            : '/images/default/avatar-default.jpg'
                        }
                        alt={comment.userName}
                      />
                      <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.userName}</span>
                        <span className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                          <span className="text-muted-foreground text-xs italic">(editado)</span>
                        )}
                      </div>

                      {editingCommentId === comment.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateComment(comment.id)}
                              disabled={isUpdating}
                            >
                              {isUpdating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Edit2 className="mr-2 h-4 w-4" />
                              )}
                              Guardar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEditing}
                              disabled={isUpdating}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className={comment.isResolved ? 'text-muted-foreground' : ''}>
                          {comment.text}
                        </p>
                      )}
                    </div>
                  </div>

                  {userData?.id === comment.userId && editingCommentId !== comment.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartEditing(comment)}>
                          <Edit2 className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleResolveComment(comment.id, !!comment.isResolved)}
                        >
                          {isResolving === comment.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4" />
                          )}
                          {comment.isResolved ? 'Marcar como no resuelto' : 'Marcar como resuelto'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          {isDeleting === comment.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-2 h-4 w-4" />
                          )}
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-muted-foreground py-4 text-center">
            No hay comentarios. Sé el primero en comentar.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={
              userData?.imageUrl
                ? userData.imageUrl.startsWith('http')
                  ? userData.imageUrl
                  : `http://localhost:5193${userData.imageUrl}`
                : '/images/default/avatar-default.jpg'
            }
            alt={userData?.name || 'U'}
          />
          <AvatarFallback>{userData?.name?.charAt(0) ?? 'U'}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea
            placeholder="Añade un comentario..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
          <div className="flex justify-end">
            <Button onClick={handleSubmitComment} disabled={!newComment.trim() || isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Comentar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
