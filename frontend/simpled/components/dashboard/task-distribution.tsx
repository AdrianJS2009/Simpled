'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export function TaskDistribution() {
  // Simulated data for task distribution by status
  const statusData = [
    { name: 'Pendientes', value: 12, color: '#f59e0b' },
    { name: 'En Progreso', value: 15, color: '#3b82f6' },
    { name: 'Completadas', value: 21, color: '#10b981' },
    { name: 'Retrasadas', value: 4, color: '#ef4444' },
  ];

  // Simulated data for task distribution by assignee
  const assigneeData = [
    { name: 'Ana García', value: 8, color: '#8b5cf6' },
    { name: 'Carlos Rodríguez', value: 12, color: '#ec4899' },
    { name: 'Laura Martínez', value: 10, color: '#14b8a6' },
    { name: 'Miguel Sánchez', value: 7, color: '#f97316' },
    { name: 'Elena López', value: 15, color: '#6366f1' },
  ];

  // Simulated data for task distribution by priority
  const priorityData = [
    { name: 'Baja', value: 15, color: '#a3e635' },
    { name: 'Media', value: 22, color: '#facc15' },
    { name: 'Alta', value: 10, color: '#f97316' },
    { name: 'Urgente', value: 5, color: '#ef4444' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Tareas</CardTitle>
        <CardDescription>
          Análisis de la distribución de tareas por diferentes criterios
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="status">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">Por Estado</TabsTrigger>
            <TabsTrigger value="assignee">Por Asignado</TabsTrigger>
            <TabsTrigger value="priority">Por Prioridad</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tareas`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="assignee" className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assigneeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {assigneeData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tareas`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="priority" className="h-80 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {priorityData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} tareas`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
