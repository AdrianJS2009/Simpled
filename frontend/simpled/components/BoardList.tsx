"use client";
import { useBoards } from "@/contexts/BoardsContext";
import BoardCard from "./BoardCard";

export default function BoardList() {
  const { boards, loading } = useBoards();

  if (loading) return <p>Cargando tableros...</p>;

  if (!boards.length) return <p>No tienes tableros todavía.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}
