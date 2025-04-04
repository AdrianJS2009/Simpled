"use client";
import BoardList from "@/components/BoardList";
import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useBoards } from "@/contexts/BoardsContext";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";

export default function BoardsPage() {
  const { createBoard } = useBoards();
  const [name, setName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    await createBoard(name);
    setName("");
    setIsCreating(false);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Tus Tableros</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona y organiza tus proyectos
          </p>
        </div>

        <Card className="w-full md:w-auto">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-lg">Crear nuevo tablero</CardTitle>
            <CardDescription>Añade un tablero para tu proyecto</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <form onSubmit={handleCreate} className="flex gap-2">
              <Input
                type="text"
                placeholder="Nombre del tablero"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={isCreating || !name.trim()}>
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Crear
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <BoardList />
    </div>
  );
}
