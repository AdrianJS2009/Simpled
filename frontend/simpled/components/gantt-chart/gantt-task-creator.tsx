'use client';

import type React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { addDays, format } from 'date-fns';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Task } from './index';

interface Column {
  id: string;
  title: string;
}

interface GanttTaskCreatorProps {
  readonly position: { x: number; y: number; date: Date };
  readonly onClose: () => void;
  readonly onSave: (task: Partial<Task>) => void;
  readonly columns: Column[];
}

export function GanttTaskCreator({ position, onClose, onSave, columns }: GanttTaskCreatorProps) {
  const [task, setTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    startDate: position.date.toISOString(),
    endDate: addDays(position.date, 1).toISOString(),
    progress: 0,
    status: 'pending',
  });

  useEffect(() => {
    setTask((prev) => ({
      ...prev,
      startDate: position.date.toISOString(),
      endDate: addDays(position.date, 1).toISOString(),
    }));
  }, [position.date]);

  const handleChange = (field: keyof Task, value: any) => {
    setTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(task);
  };

  return (
    <div
      className="absolute z-20"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Nueva tarea</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
            <div className="grid gap-1.5">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={task.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Título de la tarea"
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={task.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descripción (opcional)"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="startDate">Fecha inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={format(new Date(task.startDate!), 'yyyy-MM-dd')}
                  onChange={(e) =>
                    handleChange('startDate', new Date(e.target.value).toISOString())
                  }
                  required
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="endDate">Fecha fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={format(new Date(task.endDate!), 'yyyy-MM-dd')}
                  onChange={(e) => handleChange('endDate', new Date(e.target.value).toISOString())}
                  required
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="status">Estado</Label>
              <Select value={task.status} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in-progress">En progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="delayed">Retrasada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {columns.length > 0 && (
              <div className="grid gap-1.5">
                <Label htmlFor="columnId">Columna</Label>
                <Select
                  value={task.columnId}
                  onValueChange={(value) => handleChange('columnId', value)}
                >
                  <SelectTrigger id="columnId">
                    <SelectValue placeholder="Seleccionar columna" />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map((column) => (
                      <SelectItem key={column.id} value={column.id}>
                        {column.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Crear tarea
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
