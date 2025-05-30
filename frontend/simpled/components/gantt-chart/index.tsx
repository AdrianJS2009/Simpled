'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { format } from 'date-fns';
import type React from 'react';
import { useRef, useState } from 'react';

import { GanttTaskCreator } from './gantt-task-creator';
import { GanttTaskDependencyDialog } from './gantt-task-dependency-dialog';
import { GanttTaskDialog } from './gantt-task-dialog';
import { GanttToolbar } from './gantt-toolbar';
import { GanttView } from './gantt-view';
import { useGanttData } from './use-gantt-data';
import { useGanttFilters } from './use-gantt-filters';
import { useGanttTimeline } from './use-gantt-timeline';

export interface Task {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  progress: number;
  columnId?: string;
  boardId?: string;
  assignedTo?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'delayed';
  groupId?: string;
  isGroup?: boolean;
  order?: number;
  dependencies?: string[];
}

export interface Dependency {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish';
}

interface GanttChartProps {
  readonly boardId: string;
  readonly className?: string;
}

export function GanttChart({ boardId, className }: GanttChartProps) {
  // Contexto de autenticación
  const { auth } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  // Estados locales para diálogos y creación de tarea
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDependencyDialogOpen, setIsDependencyDialogOpen] = useState(false);
  const [taskCreatorPosition, setTaskCreatorPosition] = useState<{
    x: number;
    y: number;
    date: Date;
  } | null>(null);

  // Hook de datos: tareas, dependencias y operaciones CRUD
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    updateTask,
    updateTaskDates,
    createTask,
    dependencies,
    addDependency,
    removeDependency,
  } = useGanttData(boardId, auth);

  // Hook de timeline: fechas visibles y navegación
  const {
    viewMode,
    setViewMode,
    startDate,
    setStartDate,
    daysToShow,
    timelineDates,
    timelineHeaders,
    navigateTimeline,
  } = useGanttTimeline();

  // Hook de filtros: búsqueda, agrupación y visibilidad
  const {
    showCompleted,
    setShowCompleted,
    filterStatus,
    setFilterStatus,
    searchTerm,
    setSearchTerm,
    groupBy,
    setGroupBy,
    zoomLevel,
    setZoomLevel,
    filteredTasks,
    groupedTasks,
    toggleGroupExpansion,
  } = useGanttFilters(tasks);

  // Sensores para drag-and-drop
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  /**
   * Abrir modal de edición de tarea
   */
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  /**
   * Al terminar drag, actualizar fechas de tarea
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newStart = new Date(active.data.current?.startDate);
    const newEnd = new Date(active.data.current?.endDate);
    updateTaskDates(taskId, newStart, newEnd);
  };

  /**
   * Al hacer clic en timeline, posicionar creador de tarea
   * Solo usuarios autenticados pueden crear
   */
  const handleTimelineClick = (e: React.MouseEvent, date: Date) => {
    if (!auth.id) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTaskCreatorPosition({ x, y, date });
  };

  /**
   * Crear nueva tarea y refrescar vista
   */
  const handleCreateTask = async (data: Partial<Task>) => {
    if (!data.title || !data.startDate || !data.endDate) return;
    await createTask({ ...data, boardId, progress: data.progress ?? 0 });
    setTaskCreatorPosition(null);
  };

  /**
   * Abrir diálogo de dependencias para una tarea
   */
  const handleManageDependencies = (task: Task) => {
    setSelectedTask(task);
    setIsDependencyDialogOpen(true);
  };

  /**
   * Adaptadores para el diálogo de dependencias
   */
  const handleAddDependency = async (dep: Omit<Dependency, 'id'>) => {
    await addDependency(dep.fromTaskId, dep.toTaskId, dep.type);
  };
  const handleRemoveDependency = async (id: string) => {
    await removeDependency(id);
  };

  /**
   * Exportar datos a CSV
   */
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Título',
      'Descripción',
      'Fecha Inicio',
      'Fecha Fin',
      'Progreso',
      'Estado',
      'Dependencias',
    ];
    const csvRows = [
      headers.join(','),
      ...tasks.map((task) =>
        [
          task.id,
          `"${task.title.replace(/"/g, '""')}"`,
          `"${(task.description || '').replace(/"/g, '""')}"`,
          format(new Date(task.startDate), 'yyyy-MM-dd'),
          format(new Date(task.endDate), 'yyyy-MM-dd'),
          task.progress,
          task.status || 'pending',
          task.dependencies?.join(';') || '',
        ].join(','),
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gantt-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goToToday = () => setStartDate(new Date());
  const setDateRange = (startDate: Date, days: number) => {
    setStartDate(startDate);
    // If you have a daysToShow state, set it here as well
    // setDaysToShow(days);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Diagrama de Gantt</CardTitle>
              <CardDescription>Visualización de tareas y cronograma del proyecto</CardDescription>
            </div>
          </div>
          <GanttToolbar
            viewMode={viewMode}
            setViewMode={setViewMode}
            showCompleted={showCompleted}
            setShowCompleted={setShowCompleted}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            groupBy={groupBy}
            setGroupBy={setGroupBy}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            navigateTimeline={navigateTimeline}
            exportData={exportToCSV}
            goToToday={goToToday}
            setDateRange={setDateRange}
          />
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm">
            <div className="font-medium">Tipos de dependencias:</div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 bg-blue-500"></div>
              <span>Fin a Inicio (FS)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 border-t border-dashed border-green-500 bg-green-500"></div>
              <span>Inicio a Inicio (SS)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 border-t-2 border-dashed border-amber-500 bg-amber-500"></div>
              <span>Fin a Fin (FF)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 border-t-2 border-dotted border-red-500 bg-red-500"></div>
              <span>Inicio a Fin (SF)</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="border-foreground h-12 w-12 animate-spin rounded-full border-b-2" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-500">{error}</div>
        ) : (
          <div className="gantt-container overflow-x-auto" ref={containerRef}>
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <GanttView
                tasks={tasks}
                dependencies={dependencies}
                groupedTasks={groupedTasks}
                timelineDates={timelineDates}
                timelineHeaders={timelineHeaders}
                viewMode={viewMode}
                startDate={startDate}
                daysToShow={daysToShow}
                zoomLevel={zoomLevel}
                onTaskClick={handleTaskClick}
                onTimelineClick={handleTimelineClick}
                onManageDependencies={handleManageDependencies}
                toggleGroupExpansion={toggleGroupExpansion}
              />
            </DndContext>

            {taskCreatorPosition && (
              <GanttTaskCreator
                position={taskCreatorPosition}
                onClose={() => setTaskCreatorPosition(null)}
                onSave={handleCreateTask}
                columns={Array.from(
                  new Set(tasks.map((t) => t.columnId).filter((id): id is string => Boolean(id))),
                ).map((id) => ({ id, title: id }))}
              />
            )}
          </div>
        )}
      </CardContent>

      {/* Diálogos modales para edición y dependencias */}
      {selectedTask && (
        <>
          <GanttTaskDialog
            task={selectedTask}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onUpdate={updateTask}
            onManageDependencies={() => {
              setIsDialogOpen(false);
              setIsDependencyDialogOpen(true);
            }}
            allTasks={tasks}
          />

          <GanttTaskDependencyDialog
            task={selectedTask}
            open={isDependencyDialogOpen}
            onOpenChange={setIsDependencyDialogOpen}
            allTasks={tasks.filter((t) => t.id !== selectedTask.id)}
            dependencies={dependencies.filter(
              (d) => d.fromTaskId === selectedTask.id || d.toTaskId === selectedTask.id,
            )}
            onAddDependency={handleAddDependency}
            onRemoveDependency={handleRemoveDependency}
          />
        </>
      )}
    </Card>
  );
}
