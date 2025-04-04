"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { type Board, useBoards } from "@/contexts/BoardsContext";
import { Edit, Layers, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BoardEditModal from "./BoardEditModal";

export default function BoardCard({ board }: { board: Board }) {
  const { auth } = useAuth();
  const { deleteBoard } = useBoards();
  const [showEdit, setShowEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const userId = getUserIdFromToken(auth.token);
  const isOwner = userId === board.ownerId;

  const handleDelete = async () => {
    if (confirm("¿Seguro que deseas eliminar este tablero?")) {
      setIsDeleting(true);
      await deleteBoard(board.id);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <Link href={`/tableros/${board.id}`} className="block">
          <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
            <Layers className="h-12 w-12 text-white" />
          </div>
        </Link>

        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <Link href={`/tableros/${board.id}`}>
                <h2 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                  {board.name}
                </h2>
              </Link>
              <Badge
                variant={board.isPublic ? "default" : "secondary"}
                className="mb-2"
              >
                {board.isPublic ? "Público" : "Privado"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center text-sm text-muted-foreground mt-2">
            <Users className="h-4 w-4 mr-1" />
            <span>3 miembros</span>
          </div>
        </CardContent>

        {isOwner && (
          <CardFooter className="border-t p-3 bg-muted/30 flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEdit(true)}
              className="h-8 px-2"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 px-2 text-destructive hover:text-destructive"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Eliminar
            </Button>
          </CardFooter>
        )}
      </Card>

      {showEdit && (
        <BoardEditModal board={board} onClose={() => setShowEdit(false)} />
      )}
    </>
  );
}

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
