"use client";
import { type Board, useBoards } from "@/contexts/BoardsContext";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function BoardEditModal({
  board,
  onClose,
}: {
  board: Board;
  onClose: () => void;
}) {
  const [name, setName] = useState(board.name);
  const [isPublic, setIsPublic] = useState(board.isPublic);
  const [loading, setLoading] = useState(false);
  const { updateBoard } = useBoards();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.warning("El nombre es obligatorio");
      return;
    }

    setLoading(true);
    try {
      await updateBoard(board.id, { name, isPublic });
      toast.success("Tablero actualizado correctamente");
      onClose();
    } catch (error) {
      toast.error("Error al actualizar el tablero");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Editar tablero</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del tablero</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isPublic" className="cursor-pointer">
                Hacer público
              </Label>
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
            </div>

            <div className="pt-2 text-sm text-muted-foreground">
              {isPublic
                ? "Los tableros públicos pueden ser vistos por cualquier persona con el enlace."
                : "Los tableros privados solo son visibles para los miembros invitados."}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar cambios"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
