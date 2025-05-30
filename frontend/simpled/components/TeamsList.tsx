import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

interface Team {
  key: string;
  name: string;
  role: string;
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
          {teams.map((team) => (
            <li key={team.key}>
              <Card>
                <CardContent className="flex items-center justify-between">
                  <span className="font-medium">{team.name}</span>
                  <Badge className={`${getRoleBadgeColor(team.role)}`}>{team.role}</Badge>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
