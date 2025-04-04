"use client";

import ColumnCreateModal from "@/components/ColumnCreateModal";
import ColumnEditModal from "@/components/ColumnEditModal";
import ItemCreateModal from "@/components/ItemCreateModal";
import ItemEditModal from "@/components/ItemEditModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, Edit, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";

const API = "https://localhost:7177";

export default function BoardDetails({ boardId }: { boardId: string }) {
  const { auth } = useAuth();

  const [board, setBoard] = useState<any>(null);
  const [columns, setColumns] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateColumn, setShowCreateColumn] = useState(false);
  const [createItemColumnId, setCreateItemColumnId] = useState<string | null>(
    null
  );
  const [editColumnId, setEditColumnId] = useState<string | null>(null);
  const [editColumnTitle, setEditColumnTitle] = useState<string>("");
  const [editItem, setEditItem] = useState<any>(null);

  const userId = getUserIdFromToken(auth.token);
  const userMember = Array.isArray(members)
    ? members.find((m) => m.userId === userId)
    : null;
  const userRole = userMember?.role;
  const canEdit = userRole === "admin" || userRole === "editor";

  const headers: HeadersInit = {};
  if (auth.token) headers["Authorization"] = `Bearer ${auth.token}`;

  const fetchData = async () => {
    try {
      const [boardRes, columnRes, itemRes, membersRes] = await Promise.all([
        fetch(`${API}/api/Boards/${boardId}`, { headers }),
        fetch(`${API}/api/Columns`, { headers }),
        fetch(`${API}/api/Items`, { headers }),
        fetch(`${API}/api/BoardMembers/board/${boardId}`, { headers }),
      ]);

      if (!boardRes.ok) throw new Error("Error al cargar el tablero.");

      const boardData = await boardRes.json();
      const columnData = (await columnRes.json()).filter(
        (c: any) => c.boardId === boardId
      );
      const itemData = await itemRes.json();

      let membersData: any[] = [];
      try {
        const raw = await membersRes.text();
        membersData = raw ? JSON.parse(raw) : [];
      } catch {
        membersData = [];
      }

      setBoard(boardData);
      setColumns(columnData);
      setItems(itemData);
      setMembers(membersData);
    } catch (err) {
      console.error("Error al cargar el tablero:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [boardId, auth.token]);

  if (loading)
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );

  if (!board)
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">
          Tablero no encontrado
        </h2>
        <p className="text-muted-foreground">
          El tablero que buscas no existe o no tienes permisos para acceder
        </p>
        <Button asChild className="mt-4">
          <a href="/tableros">Volver a tableros</a>
        </Button>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{board.name}</h1>
            <Badge variant={board.isPublic ? "default" : "secondary"}>
              {board.isPublic ? "Público" : "Privado"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{members.length} miembros</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                Creado el {new Date(board.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {canEdit && (
          <Button onClick={() => setShowCreateColumn(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir columna
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto pb-6">
        {columns.map((col) => (
          <Card key={col.id} className="bg-muted/30 border shadow-sm">
            <div className="p-4 border-b bg-card flex justify-between items-center">
              <h2 className="font-semibold text-lg">{col.title}</h2>
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditColumnId(col.id);
                    setEditColumnTitle(col.title);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Editar columna</span>
                </Button>
              )}
            </div>
            <div className="p-3 space-y-2 min-h-[200px]">
              {items
                .filter((item) => item.columnId === col.id)
                .map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-md p-3 bg-background cursor-pointer hover:shadow-sm transition-shadow"
                    onClick={() => canEdit && setEditItem(item)}
                  >
                    <h3 className="font-medium mb-1">{item.title}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.description}
                      </p>
                    )}
                    {item.dueDate && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>
                          {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}

              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreateItemColumnId(col.id)}
                  className="w-full justify-center text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Añadir tarea
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

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
        />
      )}

      {editColumnId && (
        <ColumnEditModal
          columnId={editColumnId}
          currentTitle={editColumnTitle}
          onClose={() => setEditColumnId(null)}
          onUpdated={fetchData}
          token={auth.token!}
        />
      )}

      {editItem && (
        <ItemEditModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onUpdated={fetchData}
        />
      )}
    </div>
  );

  function getUserIdFromToken(token: string | null): string | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];
    } catch {
      return null;
    }
  }
}
