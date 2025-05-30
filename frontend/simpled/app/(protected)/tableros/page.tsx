'use client';
import BoardList from '@/components/BoardList';
import { useBoards } from '@/contexts/BoardsContext';
import { useState } from 'react';

export default function BoardsPage() {
  const { createBoard } = useBoards();
  const [name, setName] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createBoard(name);
    setName('');
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">Tus Tableros</h1>

      <form onSubmit={handleCreate} className="mb-8 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Nombre del nuevo tablero"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 rounded border px-4 py-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Crear
        </button>
      </form>

      <BoardList />
    </main>
  );
}
