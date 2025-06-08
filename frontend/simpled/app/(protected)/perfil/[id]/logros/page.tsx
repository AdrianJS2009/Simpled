import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Trophy } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API = 'http://localhost:5193';

type Achievement = {
  key: string;
  title: string;
  description: string;
};

type UserAchievement = {
  key: string;
  unlockedDate: string;
};

const getAllAchievements = async (): Promise<Achievement[]> => {
  const res = await fetch(`${API}/api/Achievements/achievements`);
  if (!res.ok) throw new Error('Error al obtener los logros globales');
  return res.json();
};

const getUserAchievements = async (id: string): Promise<UserAchievement[]> => {
  const res = await fetch(`${API}/api/Achievements/${id}`);
  if (!res.ok) throw new Error('Error al obtener los logros del usuario');
  return res.json();
};

const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export default async function AchievementsPage({
  params,
}: {
  readonly params: { readonly id: string };
}) {
  const allAchievements = await getAllAchievements();
  const unlockedAchievements = await getUserAchievements(params.id);

  if (!allAchievements || !unlockedAchievements) {
    notFound();
  }

  const unlockedMap = new Map(unlockedAchievements.map((a) => [a.key, a.unlockedDate]));
  const completedAchievements = allAchievements.filter((a) => unlockedMap.has(a.key));
  const pendingAchievements = allAchievements.filter((a) => !unlockedMap.has(a.key));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Link href={`/perfil/${params.id}`}>
            <Button variant="outline" className="px-3 py-2" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al perfil
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Logros</h1>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 flex items-center text-xl font-semibold">
            <Trophy className="mr-2 h-5 w-5 text-yellow-500" />
            Logros Completados ({completedAchievements.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {completedAchievements.map((achievement) => (
              <Card
                key={achievement.key}
                className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-800">
                      <Trophy className="h-5 w-5 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Desbloqueado el {formatDate(unlockedMap.get(achievement.key)!)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 flex items-center text-xl font-semibold">
            <Trophy className="mr-2 h-5 w-5 text-gray-400" />
            Logros Bloqueados ({pendingAchievements.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {pendingAchievements.map((achievement) => (
              <Card key={achievement.key} className="bg-gray-50 dark:bg-gray-800/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-gray-100 p-2 dark:bg-gray-700">
                      <Trophy className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-medium">{achievement.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
