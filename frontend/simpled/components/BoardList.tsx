'use client';
import { useBoards } from '@/contexts/BoardsContext';
import { Layers, Search, SortAsc, SortDesc } from 'lucide-react';
import { useEffect, useState } from 'react';
import BoardCard from './BoardCard';
import { Button } from './ui/button';
import { Input } from './ui/input';

type SortDirection = 'asc' | 'desc';
type SortField = 'name' | 'createdAt';

export default function BoardList() {
  const { boards, loading } = useBoards();
  const [filteredBoards, setFilteredBoards] = useState(boards);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [sortField, setSortField] = useState<SortField>('name');

  useEffect(() => {
    let result = [...boards];

    if (searchTerm) {
      result = result.filter((board) =>
        board.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    result.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return 0;
    });

    setFilteredBoards(result);
  }, [boards, searchTerm, sortDirection, sortField]);

  const toggleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  if (loading)
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="min-h-[200px]">
      <div className="mb-6 flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar tableros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSort}
          className="shrink-0"
          title={`Ordenar ${sortDirection === 'asc' ? 'descendente' : 'ascendente'}`}
        >
          {sortDirection === 'asc' ? (
            <SortAsc className="h-4 w-4" />
          ) : (
            <SortDesc className="h-4 w-4" />
          )}
        </Button>
      </div>

      {filteredBoards.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <Layers className="mb-4 h-16 w-16 text-gray-400" />
          <h2 className="mb-2 text-xl font-semibold">No tienes tableros</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {searchTerm
              ? 'No se encontraron tableros que coincidan con tu búsqueda.'
              : 'Crea tu primer tablero para comenzar a organizar tus proyectos y tareas.'}
          </p>
        </div>
      ) : (
        <div className="animate-fadeIn grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBoards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}
    </div>
  );
}
