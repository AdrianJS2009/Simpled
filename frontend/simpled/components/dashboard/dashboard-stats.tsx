import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CheckCircle, Clock, ListTodo, TrendingUp } from 'lucide-react';

interface DashboardStatsProps {
  readonly stats: {
    readonly totalTasks: number;
    readonly completedTasks: number;
    readonly inProgressTasks: number;
    readonly delayedTasks: number;
    readonly upcomingDeadlines: number;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const completionRate =
    stats.totalTasks > 0 ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total de Tareas</CardTitle>
          <ListTodo className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTasks}</div>
          <p className="text-muted-foreground text-xs">Tareas en todos los proyectos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          <CheckCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedTasks}</div>
          <div className="mt-1 flex items-center">
            <span className="text-xs font-medium text-emerald-500">
              {completionRate}% completado
            </span>
            <div className="ml-2 h-2 w-16 rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
          <p className="text-muted-foreground text-xs">Tareas activas actualmente</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Retrasadas</CardTitle>
          <AlertTriangle className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.delayedTasks}</div>
          <p className="text-muted-foreground text-xs">Tareas que requieren atención</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Próximos Vencimientos</CardTitle>
          <Clock className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingDeadlines}</div>
          <p className="text-muted-foreground text-xs">Tareas que vencen pronto</p>
        </CardContent>
      </Card>
    </div>
  );
}
