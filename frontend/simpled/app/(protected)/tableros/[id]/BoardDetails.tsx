'use client';

import ColumnCreateModal from '@/components/ColumnCreateModal';
import ColumnEditModal from '@/components/ColumnEditModal';
import ItemCreateModal from '@/components/ItemCreateModal';
import ItemEditModal from '@/components/ItemEditModal';
import { useAuth } from '@/contexts/AuthContext';
import { BookUser, Lock, LockOpen, PenLine, Plus, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const API = 'http://localhost:5193';

type User = {
  id: string;
  name: string;
  imageUrl: string;
};

export default function BoardDetails({ boardId }: Readonly<{ boardId: string }>) {
  const { auth } = useAuth();

  const [board, setBoard] = useState<any>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [createItemColumnId, setCreateItemColumnId] = useState<string | null>(null);
  const [editColumnId, setEditColumnId] = useState<string | null>(null);
  const [editColumnTitle, setEditColumnTitle] = useState<string>('');
  const [editItem, setEditItem] = useState<any>(null);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');

  const getUserIdFromToken = (token: string | null): string | null => {
    if (!token) return null;
    try {
      const pl = JSON.parse(atob(token.split('.')[1]));
      return pl['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [boardRes, columnRes, itemRes, membersRes, usersRes] = await Promise.all([
        fetch(`${API}/api/Boards/${boardId}`, { headers }),
        fetch(`${API}/api/Columns`, { headers }),
        fetch(`${API}/api/Items`, { headers }),
        fetch(`${API}/api/BoardMembers/board/${boardId}`, { headers }),
        fetch(`${API}/api/Users`, { headers }),
      ]);

      if (!boardRes.ok) throw new Error('Error al cargar el tablero.');

      const boardData = await boardRes.json();
      const columnData = (await columnRes.json()).filter((c: any) => c.boardId === boardId);
      const itemData = await itemRes.json();
      const membersData = await membersRes.json();
      const usersData = await usersRes.json();

      setBoard(boardData);
      setColumns(columnData);
      setItems(itemData);
      setMembers(membersData);
      setUsers(usersData);
    } catch (err) {
      console.error('Error al cargar el tablero:', err);
      toast.error('No se pudieron cargar los datos del tablero.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [boardId, auth.token]);

  if (loading) return <div className="p-8">Cargando tablero...</div>;
  if (!board) return <div className="p-8 text-red-600">Tablero no encontrado</div>;

  const assignees: User[] = members
    .map((m) => users.find((u) => u.id === m.userId))
    .filter((u): u is User => Boolean(u));

  const sendInvitation = async () => {
    try {
      const res = await fetch(`${API}/api/BoardInvitations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ boardId, email: inviteEmail, role: inviteRole }),
      });

      if (!res.ok) throw new Error('No se pudo enviar la invitación.');

      toast.success('Invitación enviada correctamente.');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('editor');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error al enviar la invitación.');
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{board.name}</h1>
        <span className="rounded bg-gray-200 p-2 text-sm dark:bg-gray-700">
          {board.isPublic ? (
            <div className="inline-flex items-center gap-1">
              <LockOpen className="h-5 w-5" /> Público
            </div>
          ) : (
            <div className="inline-flex items-center gap-1">
              <Lock className="h-5 w-5" /> Privado
            </div>
          )}
        </span>
      </div>

      {/* Actions */}
      {userRole === 'admin' && (
        <div className="mb-3 flex gap-2">
          <button
            onClick={() => setShowCreateColumn(true)}
            className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
          >
            <Plus className="mr-1 inline-block h-4 w-4" /> Añadir columna
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="rounded bg-green-600 px-3 py-2 text-white hover:bg-green-700"
          >
            <UserPlus className="mr-1 inline-block h-4 w-4" /> Invitar usuarios
          </button>
        </div>
      )}

      {/* Member count */}
      <p className="mb-6 flex items-center gap-1 text-sm text-gray-500">
        <BookUser className="h-5 w-5" /> Miembros: {members.length}
      </p>

      {/* Columns & Items */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {columns.map((col) => (
          <div key={col.id} className="rounded bg-white p-4 shadow">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{col.title}</h2>
              {canEdit && (
                <button
                  onClick={() => {
                    setEditColumnId(col.id);
                    setEditColumnTitle(col.title);
                  }}
                  className="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
                >
                  <PenLine className="mr-1 inline-block h-4 w-4" /> Editar
                </button>
              )}
            </div>
            <div className="mb-2 flex flex-col gap-2">
              {items
                .filter((item) => item.columnId === col.id)
                .map((item) => (
                  <button
                    key={item.id}
                    className="rounded border bg-gray-50 p-2 text-left"
                    onClick={() => canEdit && setEditItem(item)}
                  >
                    <strong>{item.title}</strong>
                    {item.description && <p className="text-sm">{item.description}</p>}
                  </button>
                ))}
            </div>
            {canEdit && (
              <button
                onClick={() => setCreateItemColumnId(col.id)}
                className="rounded bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
              >
                <Plus className="mr-1 inline-block h-4 w-4" /> Añadir tarea
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      {showCreateColumn && (
        <ColumnCreateModal
          boardId={boardId}
          onClose={() => setShowCreateColumn(false)}
          onCreated={fetchData}
        />
      )}
      {createItemColumnId && (
        <ItemCreateModal
          columnId={createItemColumnId}
          onClose={() => setCreateItemColumnId(null)}
          onCreated={fetchData}
          assignees={assignees}
          userRole={userRole}
        />
      )}
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
      {editItem && (
        <ItemEditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onUpdated={fetchData}
          assignees={assignees}
          userRole={userRole}
          currentUserId={userId!}
        />
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="bg-opacity-40 fixed inset-0 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Invitar a un usuario</h2>
            <label className="mb-1 block" htmlFor="invite-email">
              Correo electrónico
            </label>
            <input
              id="invite-email"
              type="email"
              className="mb-4 w-full rounded border p-2"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="email@ejemplo.com"
            />
            <label className="mb-1 block" htmlFor="invite-role">
              Rol asignado
            </label>
            <select
              id="invite-role"
              className="mb-4 w-full rounded border p-2"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              title="Selecciona un rol para el usuario invitado"
            >
              <option value="editor">Editor</option>
              <option value="viewer">Visualizador</option>
            </select>
            <div className="flex justify-end gap-2">
              <button
                className="rounded bg-gray-400 px-4 py-2 text-white hover:bg-gray-500"
                onClick={() => setShowInviteModal(false)}
              >
                Cancelar
              </button>
              <button
                className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                onClick={sendInvitation}
              >
                Enviar invitación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
