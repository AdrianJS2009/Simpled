"use client";
import { useBoards } from "@/contexts/BoardsContext";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

type Props = {
  item: {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    columnId: string;
  };
  onClose: () => void;
  onUpdated: () => void;
};

export default function ItemEditModal({ item, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || "");
  const [dueDate, setDueDate] = useState(item.dueDate?.slice(0, 10) || "");
  const [loading, setLoading] = useState(false);
  const { updateBoard } = useBoards(); // reutilizamos contexto por si se refresca al cerrar

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.warning("El título es obligatorio.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://localhost:7177/api/Items/${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              localStorage.getItem("token") || sessionStorage.getItem("token")
            }`,
          },
          body: JSON.stringify({
            id: item.id,
            title,
            description,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            columnId: item.columnId,
          }),
        }
      );

      if (!response.ok) throw new Error("Error al actualizar la tarea.");
      toast.success("Tarea actualizada.");
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar la tarea.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Editar tarea</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha de vencimiento
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !title.trim()}>
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
