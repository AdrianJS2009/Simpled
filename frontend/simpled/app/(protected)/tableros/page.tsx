'use client';
import BoardList from '@/components/BoardList';
import type React from 'react';

import { Button } from '@/components/ui/button';
import { useBoards } from '@/contexts/BoardsContext';
import { Plus } from 'lucide-react';
import { useState } from 'react';

export default function BoardsPage() {
  const { createBoard } = useBoards();
  const [name, setName] = useState('');
  const [showCrudForm, setShowCrudForm] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createBoard(name);
    setName('');
    setShowCrudForm(false); // Hide form after creation
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Tus Tableros</h1>
        <Button
          onClick={() => setShowCrudForm(!showCrudForm)}
          className="flex items-center gap-1"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Tablero</span>
        </Button>
      </div>

      {showCrudForm && (
        <div className="bg-card mb-8 rounded-lg border p-4 shadow-sm transition-all duration-300 ease-in-out">
          <h2 className="mb-4 text-lg font-medium">Crear Nuevo Tablero</h2>
          <form onSubmit={handleCreate} className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Nombre del nuevo tablero"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-w-[200px] flex-1 rounded border px-4 py-2"
              autoFocus
            />
            <div className="flex gap-2">
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Crear
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCrudForm(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      <BoardList />
    </main>
  );
}
