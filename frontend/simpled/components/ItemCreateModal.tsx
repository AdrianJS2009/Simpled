"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const API = "https://localhost:7177";

type Props = {
  readonly columnId: string;
  readonly onCreated: () => void;
  readonly onClose: () => void;
};

export default function ItemCreateModal({
  columnId,
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.warning("El título es obligatorio.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API}/api/Items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          title,
          description: description || null,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          columnId,
        }),
      });

      if (!response.ok) throw new Error("No se pudo crear la tarea.");

      toast.success("Tarea creada correctamente.");
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Error al crear tarea.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Nueva tarea</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Título de la tarea"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Descripción detallada de la tarea"
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
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreate}
                disabled={loading || !title.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear tarea"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
