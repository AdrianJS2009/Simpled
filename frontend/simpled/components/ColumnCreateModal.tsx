"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const API = "https://localhost:7177";

type Props = {
  boardId: string;
  onClose: () => void;
  onCreated: () => void;
};

export default function ColumnCreateModal({
  boardId,
  onClose,
  onCreated,
}: Props) {
  const { auth } = useAuth();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.warning("El título es obligatorio.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/Columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          boardId,
          title,
          order: 0,
        }),
      });

      if (!res.ok) throw new Error("Error al crear la columna.");

      toast.success("Columna creada correctamente.");
      onCreated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("No se pudo crear la columna.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Nueva columna</h2>
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
                placeholder="Ej: Por hacer, En progreso, Completado"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
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
                  "Crear columna"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
