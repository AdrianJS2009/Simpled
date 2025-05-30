import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  ownerName?: string;
  members: { userId: string; userName: string; role: string }[];
}

interface TeamsListProps {
  readonly teams: Team[];
}

export default function TeamsList({ teams }: TeamsListProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'leader':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-500" />
          Equipos ({teams.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {teams.map((team) => {
            const totalMiembros = team.members.length + 1;
            return (
              <li key={team.id}>
                <Card className="border border-blue-100 shadow-sm">
                  <CardContent className="flex flex-col gap-2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold">{team.name}</span>
                      <Badge className="bg-blue-100 text-blue-700">
                        {totalMiembros} miembro{totalMiembros !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 text-sm">
                      <span>Propietario:</span>
                      <span className="font-medium text-blue-700">
                        {team.ownerName || 'Desconocido'}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs font-semibold text-gray-500">Miembros:</span>
                      {team.members.map((m) => (
                        <Badge key={m.userId} className={getRoleBadgeColor(m.role)}>
                          {m.userName} ({m.role})
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
