'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function TaskProgressChart() {
  const [activeTab, setActiveTab] = useState('burndown');

  const burndownData = [
    { day: 'Lun', remaining: 30, ideal: 30 },
    { day: 'Mar', remaining: 28, ideal: 25 },
    { day: 'Mié', remaining: 25, ideal: 20 },
    { day: 'Jue', remaining: 21, ideal: 15 },
    { day: 'Vie', remaining: 18, ideal: 10 },
    { day: 'Sáb', remaining: 15, ideal: 5 },
    { day: 'Dom', remaining: 12, ideal: 0 },
  ];

  const velocityData = [
    { sprint: 'Sprint 1', completed: 18 },
    { sprint: 'Sprint 2', completed: 22 },
    { sprint: 'Sprint 3', completed: 20 },
    { sprint: 'Sprint 4', completed: 25 },
    { sprint: 'Sprint 5', completed: 28 },
    { sprint: 'Sprint 6', completed: 24 },
  ];

  const cumulativeFlowData = [
    { day: 'Lun', completed: 5, inProgress: 10, backlog: 15 },
    { day: 'Mar', completed: 8, inProgress: 12, backlog: 12 },
    { day: 'Mié', completed: 12, inProgress: 10, backlog: 10 },
    { day: 'Jue', completed: 15, inProgress: 8, backlog: 8 },
    { day: 'Vie', completed: 18, inProgress: 7, backlog: 5 },
    { day: 'Sáb', completed: 20, inProgress: 5, backlog: 3 },
    { day: 'Dom', completed: 22, inProgress: 3, backlog: 2 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progreso del Proyecto</CardTitle>
        <CardDescription>Visualización del progreso y velocidad del equipo</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="burndown">Burndown</TabsTrigger>
            <TabsTrigger value="velocity">Velocidad</TabsTrigger>
            <TabsTrigger value="cumulative">Flujo Acumulativo</TabsTrigger>
          </TabsList>

          <TabsContent value="burndown" className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={burndownData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRemaining" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="remaining"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRemaining)"
                  name="Tareas Restantes"
                />
                <Area
                  type="monotone"
                  dataKey="ideal"
                  stroke="#9ca3af"
                  strokeDasharray="5 5"
                  fill="none"
                  name="Progreso Ideal"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="velocity" className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={velocityData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sprint" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="completed" name="Tareas Completadas" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="cumulative" className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={cumulativeFlowData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorBacklog" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#9ca3af" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="backlog"
                  stackId="1"
                  stroke="#9ca3af"
                  fill="url(#colorBacklog)"
                  name="Pendientes"
                />
                <Area
                  type="monotone"
                  dataKey="inProgress"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="url(#colorInProgress)"
                  name="En Progreso"
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="#10b981"
                  fill="url(#colorCompleted)"
                  name="Completadas"
                />
              </AreaChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
