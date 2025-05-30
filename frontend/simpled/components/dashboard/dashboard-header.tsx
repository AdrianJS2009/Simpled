import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, CheckCircle2, Clock } from 'lucide-react';

interface DashboardHeaderProps {
  readonly user: any;
  completedTasksThisWeek: number;
  pendingTasksToday: number;
}

export function DashboardHeader({
  user,
  completedTasksThisWeek,
  pendingTasksToday,
}: DashboardHeaderProps) {
  const currentTime = new Date();
  const hours = currentTime.getHours();

  let greeting = 'Buenos días';
  if (hours >= 12 && hours < 18) {
    greeting = 'Buenas tardes';
  } else if (hours >= 18 || hours < 5) {
    greeting = 'Buenas noches';
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel</h1>
        <p className="text-muted-foreground mt-2">
          {greeting}, {user?.name ?? 'Usuario'}. Aquí tienes un resumen de tus proyectos.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="flex items-center gap-3 p-3">
            <CalendarDays className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm font-medium">
                {new Date().toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="flex items-center gap-3 p-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-sm font-medium">
                {completedTasksThisWeek} tareas completadas esta semana
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="flex items-center gap-3 p-3">
            <Clock className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-sm font-medium">{pendingTasksToday} tareas pendientes para hoy</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
