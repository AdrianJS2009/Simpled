'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useSignalR } from '@/contexts/SignalRContext';
import { fadeIn, slideUp } from '@/lib/animation-variants';
import type { Column, Item, User } from '@/types';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Plus, Star, StarOff, Users } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import BoardInviteModal from './BoardInviteModal';
import BoardMembersList from './BoardMembersList';
import ChatPanel from './ChatPanel';
import ColumnCreateModal from './ColumnCreateModal';
import ColumnEditModal from './ColumnEditModal';
import ItemCreateModal from './ItemCreateModal';
import ItemEditModal from './ItemEditModal';
import KanbanColumn from './KanbanColumn';
import KanbanItem from './KanbanItem';

const API = 'http://localhost:5193';

// Helper functions for subtask, column, and item updates
function addSubtaskToItem(items: Item[], payload: any): Item[] {
  return items.map((item) => {
    if (item.id === payload.itemId) {
      const subtasks = item.subtasks || [];
      const newSubtasks = [...subtasks, payload];
      const subtasksCount = newSubtasks.length;
      const completedSubtasks = newSubtasks.filter((st) => st.isCompleted).length;
      const progress =
        subtasksCount > 0 ? Math.round((completedSubtasks / subtasksCount) * 100) : 0;
      return { ...item, subtasks: newSubtasks, progress };
    }
    return item;
  });
}

function updateSubtaskInItem(items: Item[], payload: any): Item[] {
  return items.map((item) => {
    if (item.id === payload.itemId) {
      const subtasks = item.subtasks || [];
      const updatedSubtasks = subtasks.map((st) => (st.id === payload.id ? payload : st));
      const subtasksCount = updatedSubtasks.length;
      const completedSubtasks = updatedSubtasks.filter((st) => st.isCompleted).length;
      const progress =
        subtasksCount > 0 ? Math.round((completedSubtasks / subtasksCount) * 100) : 0;
      return { ...item, subtasks: updatedSubtasks, progress };
    }
    return item;
  });
}

function deleteSubtaskFromItem(items: Item[], payload: any): Item[] {
  return items.map((item) => {
    if (item.id === payload.itemId) {
      const subtasks = item.subtasks || [];
      const updatedSubtasks = subtasks.filter((st) => st.id !== payload.id);
      const subtasksCount = updatedSubtasks.length;
      const completedSubtasks = updatedSubtasks.filter((st) => st.isCompleted).length;
      const progress =
        subtasksCount > 0 ? Math.round((completedSubtasks / subtasksCount) * 100) : 0;
      return { ...item, subtasks: updatedSubtasks, progress };
    }
    return item;
  });
}

function updateColumnInList(columns: Column[], payload: any): Column[] {
  return columns.map((col) =>
    col.id === payload.id ? { ...col, title: payload.title, order: payload.order } : col,
  );
}

function updateItemInList(items: Item[], payload: any): Item[] {
  return items.map((it) => (it.id === payload.id ? { ...it, ...payload } : it));
}

function updateItemStatusInList(items: Item[], payload: any): Item[] {
  return items.map((it) => (it.id === payload.id ? { ...it, status: payload.status } : it));
}

function removeColumnById(columns: Column[], columnId: string): Column[] {
  return columns.filter((col) => col.id !== columnId);
}

function removeItemsByColumnId(items: Item[], columnId: string): Item[] {
  return items.filter((it) => it.columnId !== columnId);
}

function handleItemDeleted(
  payload: any,
  currentUserId: string,
  setItems: Function,
  toast: any,
  showDesktopNotification: Function,
) {
  setItems((i: any[]) => i.filter((it) => it.id !== payload.id));
  if (payload.assigneeId === currentUserId) {
    const msg = `Tu tarea "${payload.title}" ha sido eliminada`;
    toast.info(`🗑️ ${msg}`, { toastId: `item-deleted-${payload.id}` });
    showDesktopNotification('🗑️ Tarea eliminada', { body: payload.title });
  }
}

export default function KanbanBoard({ boardId }: { readonly boardId: string }) {
  const { auth, toggleFavoriteBoard } = useAuth();
  const { connection } = useSignalR();
  const lastRef = useRef<string | null>(null);

  const [board, setBoard] = useState<any>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<Item | null>(null);

  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [createItemColumnId, setCreateItemColumnId] = useState<string | null>(null);
  const [editColumnId, setEditColumnId] = useState<string | null>(null);
  const [editColumnTitle, setEditColumnTitle] = useState<string>('');
  const [editItem, setEditItem] = useState<Item | null>(null);

  const [showInvite, setShowInvite] = useState(false);

  const [isFavoriteToggling, setIsFavoriteToggling] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (board) setIsFavorite(board.isFavorite);
  }, [board]);

  useEffect(() => {
    if (
      'Notification' in window &&
      Notification.permission !== 'granted' &&
      Notification.permission !== 'denied'
    ) {
      Notification.requestPermission();
    }
  }, []);

  const showDesktopNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(title, options);
        }
      });
    }
  }, []);

  const getUserIdFromToken = (token: string | null): string | null => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    } catch {
      return null;
    }
  };

  const userId = getUserIdFromToken(auth.token);
  const userMember = members.find((m) => m.userId === userId);
  const userRole = userMember?.role;
  const canEdit = userRole === 'admin' || userRole === 'editor';

  const headers: HeadersInit = {};
  if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [bR, cR, iR, mR, uR] = await Promise.all([
        fetch(`${API}/api/Boards/${boardId}`, { headers }),
        fetch(`${API}/api/Columns`, { headers }),
        fetch(`${API}/api/Items`, { headers }),
        fetch(`${API}/api/BoardMembers/board/${boardId}`, { headers }),
        fetch(`${API}/api/Users`, { headers }),
      ]);
      if (!bR.ok) throw new Error('Error al cargar el tablero');
      const [bd, allCols, allItems, mem, us] = await Promise.all([
        bR.json(),
        cR.json(),
        iR.json(),
        mR.json(),
        uR.json(),
      ]);
      const cols = allCols.filter((c: any) => c.boardId === boardId);
      const its = allItems.filter((i: any) => cols.some((c: any) => c.id === i.columnId));

      const itemsWithSubtasks = await Promise.all(
        its.map(async (item: Item) => {
          try {
            const subtasksRes = await fetch(`${API}/api/items/${item.id}/subtasks`, { headers });
            if (subtasksRes.ok) {
              const subtasks = await subtasksRes.json();

              const subtasksCount = subtasks.length;
              const completedSubtasks = subtasks.filter((st: any) => st.isCompleted).length;
              const progress =
                subtasksCount > 0 ? Math.round((completedSubtasks / subtasksCount) * 100) : 0;

              return { ...item, subtasks, progress };
            }
            return item;
          } catch (error) {
            console.error(`Error fetching subtasks for item ${item.id}:`, error);
            return item;
          }
        }),
      );

      setBoard(bd);
      setColumns(cols);
      setItems(itemsWithSubtasks);
      setMembers(mem);
      setUsers(us);
    } catch (err) {
      console.error('[fetchData] Error:', err);
      toast.error('Error cargando datos');
      showDesktopNotification('Error cargando datos', {
        body: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setLoading(false);
    }
  }, [boardId, auth.token, showDesktopNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!connection) return;
    const handler = (id: string, action: string, payload: any) => {
      if (id !== boardId) return;
      const key = `${action}:${payload.id ?? payload.columnId}`;
      if (lastRef.current === key) return;
      lastRef.current = key;
      const currentUserId = userId;

      switch (action) {
        case 'ColumnCreated':
          toast.info('📌 Nueva columna añadida');
          showDesktopNotification('📌 Nueva columna añadida', { body: payload.title });
          setColumns((c) => [...c, payload]);
          break;

        case 'ColumnUpdated':
          toast.info('✏️ Columna actualizada');
          showDesktopNotification('✏️ Columna actualizada', { body: payload.title });
          setColumns((c) => updateColumnInList(c, payload));
          break;

        case 'ColumnDeleted':
          toast.info('🗑️ Columna eliminada');
          showDesktopNotification('🗑️ Columna eliminada', { body: `ID: ${payload.columnId}` });
          setColumns((c) => removeColumnById(c, payload.columnId));
          setItems((i) => removeItemsByColumnId(i, payload.columnId));
          break;

        case 'ItemCreated':
          setItems((i) => [...i, payload]);
          if (payload.assigneeId === currentUserId) {
            const msg = `Te han asignado la tarea "${payload.title}"`;
            toast.info(`✅ ${msg}`, { toastId: `item-assigned-${payload.id}` });
            showDesktopNotification('✅ Nueva tarea asignada', { body: payload.title });
          }
          break;

        case 'ItemUpdated':
          setItems((i) => updateItemInList(i, payload));
          if (payload.assigneeId === currentUserId) {
            const msg = `La tarea "${payload.title}" ha sido modificada`;
            toast.info(`🔁 ${msg}`, { toastId: `item-updated-${payload.id}` });
            showDesktopNotification('🔁 Tarea modificada', { body: payload.title });
          }
          break;

        case 'ItemDeleted':
          handleItemDeleted(payload, userId ?? '', setItems, toast, showDesktopNotification);
          break;

        case 'ItemStatusChanged':
          setItems((i) => updateItemStatusInList(i, payload));
          if (payload.assigneeId === currentUserId) {
            const msg = `Estado actualizado de "${payload.title}"`;
            toast.info(`📍 ${msg}`, { toastId: `item-status-${payload.id}` });
            showDesktopNotification('📍 Estado de tarea', {
              body: `${payload.title}: ${payload.status}`,
            });
          }
          break;

        case 'ItemFileUploaded':
          if (payload.assigneeId === currentUserId) {
            const msg = `Se ha subido un archivo a "${payload.title}"`;
            toast.info(`📎 ${msg}`, { toastId: `item-file-${payload.id}` });
            showDesktopNotification('📎 Archivo subido', { body: payload.title });
          }
          break;

        case 'SubtaskCreated':
          setItems((items) => addSubtaskToItem(items, payload));
          break;

        case 'SubtaskUpdated':
          setItems((items) => updateSubtaskInItem(items, payload));
          break;

        case 'SubtaskDeleted':
          setItems((items) => deleteSubtaskFromItem(items, payload));
          break;

        default:
          fetchData();
      }
    };

    connection.on('BoardUpdated', handler);
    return () => connection.off('BoardUpdated', handler);
  }, [connection, boardId, fetchData, userId, showDesktopNotification]);

  useEffect(() => {
    if (!connection) return;
    connection.invoke('JoinBoardGroup', boardId).catch(console.error);
    return () => {
      connection.invoke('LeaveBoardGroup', boardId).catch(console.error);
    };
  }, [connection, boardId]);

  const findActiveItem = (id: string) => items.find((it) => it.id === id);

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
    const it = findActiveItem(active.id as string);
    if (it) setActiveItem(it);
  };

  const handleDragOver = (_: DragOverEvent) => {};

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over) return resetDrag();
    const aId = active.id as string;
    const oId = over.id as string;
    if (aId === oId) return resetDrag();
    const it = findActiveItem(aId);
    if (!it) return resetDrag();
    const isCol = columns.some((c) => c.id === oId);
    if (isCol && it.columnId !== oId) {
      try {
        const res = await fetch(`${API}/api/Items/${aId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ ...it, columnId: oId }),
        });
        if (!res.ok) throw new Error();
        setItems((prev) => prev.map((i) => (i.id === aId ? { ...i, columnId: oId } : i)));
        toast.success('Tarea movida');
        showDesktopNotification('✅ Tarea movida', { body: it.title });
      } catch {
        toast.error('Error moviendo');
        showDesktopNotification('⚠️ Error moviendo tarea', { body: it.title });
        fetchData();
      }
    }
    resetDrag();
  };

  const handleDeleteColumn = async (colId: string) => {
    const tareas = items.filter((i) => i.columnId === colId);
    const confirmDelete = tareas.length
      ? confirm(`La columna tiene ${tareas.length} tareas. ¿Eliminar también?`)
      : confirm('¿Eliminar columna?');
    if (!confirmDelete) return;
    try {
      const url = new URL(`${API}/api/Columns/${colId}`);
      if (tareas.length) url.searchParams.set('cascadeItems', 'true');
      const res = await fetch(url.toString(), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setColumns((p) => p.filter((c) => c.id !== colId));
      setItems((p) => p.filter((i) => i.columnId !== colId));
      toast.success('Columna eliminada');
      showDesktopNotification('🗑️ Columna eliminada', { body: `ID: ${colId}` });
    } catch (e: any) {
      toast.error(e.message);
      showDesktopNotification('⚠️ Error eliminando columna', { body: e.message });
      fetchData();
    }
  };

  const resetDrag = () => {
    setActiveId(null);
    setActiveItem(null);
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

  if (loading)
    return (
      <motion.div
        className="flex h-[80vh] items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="h-12 w-12 rounded-full border-b-2 border-blue-600"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            ease: 'linear',
            repeat: Number.POSITIVE_INFINITY,
          }}
        />
      </motion.div>
    );

  if (!board) return <div className="p-8 text-red-600">Tablero no encontrado</div>;

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="min-w-0 flex-1">
        <motion.div className="mx-auto p-4" initial="hidden" animate="visible" variants={fadeIn}>
          <motion.div
            className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"
            variants={slideUp}
          >
            <div>
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={toggleFavorite}
                  disabled={isFavoriteToggling}
                  title={isFavorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
                  className="text-yellow-500 transition-all duration-300 hover:scale-110 disabled:opacity-50"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isFavorite ? (
                    <Star className="size-6 fill-yellow-500" />
                  ) : (
                    <StarOff className="size-6" />
                  )}
                </motion.button>
                <motion.h1 className="align-middle text-2xl font-bold">{board.name}</motion.h1>
              </div>
              <motion.p className="text-muted-foreground text-sm">
                {board.isPublic ? 'Público' : 'Privado'} • Miembros: {members.length}
              </motion.p>
            </div>

            <motion.div className="flex flex-wrap gap-2">
              {userRole === 'admin' && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={() => setShowInvite(true)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Users className="h-4 w-4" /> Invitar
                  </Button>
                </motion.div>
              )}
              {canEdit && (
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button
                    onClick={() => setShowCreateColumn(true)}
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" /> Añadir columna
                  </Button>
                </motion.div>
              )}
              {userRole === 'admin' && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      title="Gestionar miembros del tablero"
                    >
                      <Users className="h-4 w-4" /> Gestionar miembros
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Gestión de miembros</DialogTitle>
                    </DialogHeader>
                    <BoardMembersList
                      members={members}
                      users={users}
                      currentUserRole={userRole}
                      boardId={boardId}
                      onRoleUpdated={fetchData}
                      onMemberRemoved={fetchData}
                    />
                  </DialogContent>
                </Dialog>
              )}
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link href={`/tableros/${boardId}/gantt`}>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> Vista Gantt
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-6 overflow-x-auto pt-2 pb-4">
              <AnimatePresence>
                {columns.map((col) => (
                  <motion.div
                    key={col.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    layout
                  >
                    <KanbanColumn
                      column={col}
                      items={items.filter((i) => i.columnId === col.id)}
                      users={users}
                      canEdit={canEdit}
                      onAddItem={() => setCreateItemColumnId(col.id)}
                      onEditColumn={() => {
                        setEditColumnId(col.id);
                        setEditColumnTitle(col.title);
                      }}
                      onEditItem={(it) => {
                        if (userRole === 'admin' || it.assigneeId === userId) {
                          setEditItem(it);
                        }
                      }}
                      onDeleteColumn={() => handleDeleteColumn(col.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <DragOverlay>
              {activeItem && <KanbanItem item={activeItem} users={users} isOverlay />}
            </DragOverlay>
          </DndContext>

          <AnimatePresence>
            {showInvite && (
              <BoardInviteModal
                boardId={boardId}
                onClose={() => {
                  setShowInvite(false);
                  setTimeout(() => fetchData(), 100);
                }}
                onInvited={() => {
                  setShowInvite(false);
                  fetchData();
                }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCreateColumn && (
              <ColumnCreateModal
                boardId={boardId}
                onClose={() => setShowCreateColumn(false)}
                onCreated={fetchData}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {createItemColumnId && (
              <ItemCreateModal
                columnId={createItemColumnId}
                onClose={() => {
                  setCreateItemColumnId(null);
                  setTimeout(() => fetchData(), 100);
                }}
                onCreated={fetchData}
                assignees={
                  members.map((m) => users.find((u) => u.id === m.userId)).filter(Boolean) as User[]
                }
                userRole={userRole}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {editColumnId && (
              <ColumnEditModal
                columnId={editColumnId}
                currentTitle={editColumnTitle}
                boardId={boardId}
                token={auth.token!}
                onClose={() => setEditColumnId(null)}
                onUpdated={fetchData}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {editItem && (
              <ItemEditModal
                item={{
                  ...editItem,
                  status: editItem.status ?? 'pending',
                }}
                onClose={() => {
                  setEditItem(null);
                  setTimeout(() => fetchData(), 100);
                }}
                onUpdated={fetchData}
                assignees={
                  members.map((m) => users.find((u) => u.id === m.userId)).filter(Boolean) as User[]
                }
                userRole={userRole}
                currentUserId={userId!}
              />
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="flex min-h-[300px] w-full flex-col border-t pt-4 lg:min-h-[600px] lg:w-[380px] lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
        <ChatPanel
          roomType="Board"
          entityId={boardId}
          members={members.map((m) => {
            const user = users.find((u) => u.id === m.userId);
            return { userId: m.userId, name: user?.name || 'Usuario', imageUrl: user?.imageUrl };
          })}
        />
      </div>
    </div>
  );
}
