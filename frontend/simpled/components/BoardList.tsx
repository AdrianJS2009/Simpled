"use client";
import { Skeleton } from "@/components/ui/skeleton";
import { useBoards } from "@/contexts/BoardsContext";
import BoardCard from "./BoardCard";

export default function BoardList() {
  const { boards, loading } = useBoards();

  if (loading)
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    );

  if (!boards.length)
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No tienes tableros todavía</h3>
        <p className="text-muted-foreground">
          Crea tu primer tablero para comenzar a organizar tus proyectos
        </p>
      </div>
    );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}
