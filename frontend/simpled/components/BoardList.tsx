'use client';
import { useBoards } from '@/contexts/BoardsContext';
import BoardCard from './BoardCard';

export default function BoardList() {
  const { boards, loading } = useBoards();

  if (loading) return <p>Cargando tableros...</p>;

  if (!boards.length) return <p>No tienes tableros todavía.</p>;

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {boards.map((board) => (
          <BoardCard key={board.id} board={board} />
        ))}
      </div>
    </div>
  );
}
