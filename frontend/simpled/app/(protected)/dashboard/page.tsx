'use client';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardStats } from '@/components/dashboard/dashboard-stats';
import { ProjectOverview } from '@/components/dashboard/project-overview';
import type { Activity } from '@/components/dashboard/recent-activity';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { TaskDistribution } from '@/components/dashboard/task-distribution';
import { TaskProgressChart } from '@/components/dashboard/task-progress-chart';
import { useAuth } from '@/contexts/AuthContext';
import { useBoards } from '@/contexts/BoardsContext';
import { useEffect, useState } from 'react';

const API_URL = 'http://localhost:5193';

export default function DashboardPage() {
  const { auth, userData } = useAuth();
  const { boards, fetchBoards } = useBoards();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<{
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    delayedTasks: number;
    upcomingDeadlines: number;
    completedTasksThisWeek: number;
    pendingTasksToday: number;
    pendingTasks: number;
  }>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    delayedTasks: 0,
    upcomingDeadlines: 0,
    completedTasksThisWeek: 0,
    pendingTasksToday: 0,
    pendingTasks: 0,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        if (auth.token && userData?.id) {
          await fetchBoards();

          // Obtener estadísticas
          const statsRes = await fetch(`${API_URL}/api/Users/${userData.id}/stats`);
          const statsData = await statsRes.json();
          setStats({
            totalTasks: statsData.totalTasks,
            completedTasks: statsData.completedTasks,
            inProgressTasks: statsData.inProgressTasks,
            delayedTasks: statsData.delayedTasks,
            upcomingDeadlines: statsData.upcomingDeadlines,
            completedTasksThisWeek: statsData.completedTasksThisWeek,
            pendingTasksToday: statsData.pendingTasksToday,
            pendingTasks: statsData.pendingTasks,
          });

          // Obtener actividad reciente
          const activityRes = await fetch(`${API_URL}/api/Users/${userData.id}/activity`);
          const activityData = await activityRes.json();
          setRecentActivity(
            activityData.map((a: any) => ({
              id: a.id,
              type: a.type,
              user: { name: a.userName, imageUrl: a.userImageUrl },
              task: a.taskTitle ? { title: a.taskTitle } : undefined,
              board: a.boardName ? { name: a.boardName } : undefined,
              comment: a.commentText ? { text: a.commentText } : undefined,
              oldStatus: a.oldStatus,
              newStatus: a.newStatus,
              assignee: a.assigneeName ? { name: a.assigneeName } : undefined,
              timestamp: a.timestamp,
            })),
          );
        }
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [auth.token, userData?.id]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-foreground h-12 w-12 animate-spin rounded-full border-b-2" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DashboardHeader
        user={userData}
        completedTasksThisWeek={stats.completedTasksThisWeek}
        pendingTasksToday={stats.pendingTasksToday}
      />

      <div className="mt-8">
        <DashboardStats stats={stats} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
        <TaskProgressChart />
        <TaskDistribution
          pending={stats.pendingTasks}
          inProgress={stats.inProgressTasks}
          completed={stats.completedTasks}
          delayed={stats.delayedTasks}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProjectOverview boards={boards} />
        </div>
        <div>
          <RecentActivity activities={recentActivity} />
        </div>
      </div>
    </div>
  );
}
