import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Board } from '@/types';
import { ArrowRight, BarChart2, Layers } from 'lucide-react';
import Link from 'next/link';

interface ProjectOverviewProps {
  readonly boards: Board[];
}

export function ProjectOverview({ boards }: ProjectOverviewProps) {
  // Function to generate random progress for demo purposes
  const getRandomProgress = () => Math.floor(Math.random() * 100);

  // Function to get a color based on progress
  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-amber-500';
    if (progress < 70) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Resumen de Proyectos</CardTitle>
          <CardDescription>Estado actual de tus tableros y proyectos</CardDescription>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/tableros">
            <Layers className="mr-2 h-4 w-4" />
            Ver todos
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {boards && boards.length > 0 ? (
          <div className="space-y-6">
            {boards.slice(0, 5).map((board) => {
              const progress = getRandomProgress();
              return (
                <div key={board.id} className="group">
                  <div className="mb-1 flex items-center justify-between">
                    <Link href={`/tableros/${board.id}`} className="font-medium hover:underline">
                      {board.name}
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">{progress}%</span>
                      <Link
                        href={`/tableros/${board.id}/gantt`}
                        className="text-muted-foreground invisible group-hover:visible"
                      >
                        <BarChart2 className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <Progress value={progress} className={getProgressColor(progress)} />
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {Math.floor(progress / 10)} tareas completadas
                    </span>
                    <span className="text-muted-foreground">
                      {10 - Math.floor(progress / 10)} pendientes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Layers className="text-muted-foreground mb-2 h-12 w-12" />
            <h3 className="mb-1 text-lg font-medium">No hay proyectos</h3>
            <p className="text-muted-foreground mb-4 text-center">
              No tienes ningún tablero o proyecto creado todavía.
            </p>
            <Button asChild>
              <Link href="/tableros">
                Crear un tablero
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
