'use client';

import { addDays } from 'date-fns';
import { useEffect, useState } from 'react';
import type { Dependency, Task } from './index';

// URL base de la API
const API_URL = 'http://localhost:5193';

type Auth = { token: string | null; id: string | null };

/**
 * Hook para manejar datos de Gantt: tareas y dependencias.
 * @param boardId Identificador del tablero.
 * @param auth Objeto con token e ID de usuario para autenticación.
 */
export function useGanttData(boardId: string, auth: Auth) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getDependencyTypeLabel = (type: Dependency['type']): string => {
    switch (type) {
      case 'finish-to-start':
        return 'Fin a Inicio (FS)';
      case 'start-to-start':
        return 'Inicio a Inicio (SS)';
      case 'finish-to-finish':
        return 'Fin a Fin (FF)';
      case 'start-to-finish':
        return 'Inicio a Fin (SF)';
      default:
        return type;
    }
  };

  /**
   * Obtiene tareas, columnas y dependencias del servidor.
   * En caso de no haber endpoint de dependencias, se simulan a partir de metadata.
   */
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      };

      const itemsRes = await fetch(`${API_URL}/api/Items`, { headers });
      if (!itemsRes.ok) throw new Error('Error fetching tasks');
      const items: any[] = await itemsRes.json();

      const colsRes = await fetch(`${API_URL}/api/Columns`, { headers });
      if (!colsRes.ok) throw new Error('Error fetching columns');
      const columns: any[] = await colsRes.json();
      const boardColumnIds = columns.filter((col) => col.boardId === boardId).map((col) => col.id);

      const boardItems = items.filter((item) => boardColumnIds.includes(item.columnId));

      const depsRes = await fetch(`${API_URL}/api/Dependencies?boardId=${boardId}`, {
        headers,
      }).catch(() => null);
      let deps: Dependency[] = [];
      if (depsRes?.ok) {
        deps = await depsRes.json();
      } else {
        deps = boardItems
          .filter((item) => (item.dependencies?.length ?? 0) > 0)
          .flatMap((item) =>
            (item.dependencies ?? []).map((depId: string, idx: number) => ({
              id: `dep-${item.id}-${depId}-${idx}`,
              fromTaskId: depId,
              toTaskId: item.id,
              type: 'finish-to-start' as const,
            })),
          );
      }

      const ganttTasks: Task[] = boardItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description ?? '',
        startDate: item.startDate ?? new Date().toISOString(),
        endDate: item.dueDate ?? addDays(new Date(), 3).toISOString(),
        progress: item.status === 'completed' ? 100 : (item.progress ?? 0),
        columnId: item.columnId,
        boardId,
        status: item.status ?? 'pending',
        assignedTo: item.assignedTo ?? null,
        dependencies: item.dependencies ?? [],
      }));

      setTasks(ganttTasks);
      setDependencies(deps);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Error al cargar las tareas. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza una tarea completa.
   */
  const updateTask = async (updated: Task): Promise<boolean> => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      };
      const body = {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        startDate: updated.startDate,
        dueDate: updated.endDate,
        columnId: updated.columnId,
        status: updated.status,
        progress: updated.progress,
        assigneeId: updated.assignedTo, // coincide con DTO AssigneeId
        dependencies: updated.dependencies ?? [],
      };
      const res = await fetch(`${API_URL}/api/Items/${updated.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error updating task');

      setTasks((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
      return true;
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Error al actualizar la tarea. Por favor, inténtalo de nuevo.');
      return false;
    }
  };

  /**
   * Actualiza sólo fechas de inicio y fin de una tarea, reutilizando updateTask
   */
  const updateTaskDates = async (
    taskId: string,
    newStart: Date,
    newEnd: Date,
  ): Promise<boolean> => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return false;

    return updateTask({
      ...task,
      startDate: newStart.toISOString(),
      endDate: newEnd.toISOString(),
    });
  };

  /**
   * Crea una nueva tarea.
   */
  const createTask = async (data: Partial<Task>): Promise<boolean> => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      };
      const body = {
        title: data.title,
        description: data.description ?? '',
        startDate: data.startDate,
        dueDate: data.endDate,
        columnId: data.columnId,
        status: data.status ?? 'pending',
        progress: data.progress ?? 0,
        assigneeId: data.assignedTo,
        dependencies: data.dependencies ?? [],
      };
      const res = await fetch(`${API_URL}/api/Items`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Error creating task');

      const newItem = await res.json();
      const newTask: Task = {
        ...newItem,
        endDate: newItem.dueDate,
        progress: newItem.progress ?? 0,
      };
      setTasks((ts) => [...ts, newTask]);
      return true;
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Error al crear la tarea. Por favor, inténtalo de nuevo.');
      return false;
    }
  };

  const validateDependency = (fromTask: Task, toTask: Task, type: Dependency['type']): boolean => {
    const fromStart = new Date(fromTask.startDate);
    const fromEnd = new Date(fromTask.endDate);
    const toStart = new Date(toTask.startDate);
    const toEnd = new Date(toTask.endDate);

    switch (type) {
      case 'finish-to-start':
        return true;
      case 'start-to-start':
        return true;
      case 'finish-to-finish':
        return true;
      case 'start-to-finish':
        return true;
      default:
        return true;
    }
  };

  /**
   * Añade una dependencia entre dos tareas.
   */
  const addDependency = async (
    fromTaskId: string,
    toTaskId: string,
    type: Dependency['type'],
  ): Promise<boolean> => {
    try {
      const fromTask = tasks.find((t) => t.id === fromTaskId);
      const toTask = tasks.find((t) => t.id === toTaskId);

      if (!fromTask || !toTask) {
        console.error('Error adding dependency: Task not found');
        setError('Error al añadir la dependencia. Tarea no encontrada.');
        return false;
      }

      if (!validateDependency(fromTask, toTask, type)) {
        console.error('Error adding dependency: Invalid dependency dates');
        setError('Error al añadir la dependencia. Fechas inválidas.');
        return false;
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
      };
      const res = await fetch(`${API_URL}/api/Dependencies`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ fromTaskId, toTaskId, type, boardId }),
      }).catch(() => null);
      let newDep: Dependency;
      if (res?.ok) {
        newDep = await res.json();
      } else {
        const toTask = tasks.find((t) => t.id === toTaskId);
        if (!toTask) throw new Error('Task not found');
        const updated = { ...toTask, dependencies: [...(toTask.dependencies ?? []), fromTaskId] };
        await updateTask(updated);
        newDep = { id: `dep-${fromTaskId}-${toTaskId}-${Date.now()}`, fromTaskId, toTaskId, type };
      }
      setDependencies((ds) => [...ds, newDep]);
      return true;
    } catch (err) {
      console.error('Error adding dependency:', err);
      setError('Error al añadir la dependencia. Por favor, inténtalo de nuevo.');
      return false;
    }
  };

  /**
   * Elimina una dependencia.
   */
  const removeDependency = async (dependencyId: string): Promise<boolean> => {
    try {
      const dep = dependencies.find((d) => d.id === dependencyId);
      if (!dep) throw new Error('Dependency not found');
      const headers: HeadersInit = auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
      const res = await fetch(`${API_URL}/api/Dependencies/${dependencyId}`, {
        method: 'DELETE',
        headers,
      }).catch(() => null);
      if (!res?.ok) {
        const toTask = tasks.find((t) => t.id === dep.toTaskId);
        if (!toTask) throw new Error('Task not found');
        const updated = {
          ...toTask,
          dependencies: (toTask.dependencies ?? []).filter((id) => id !== dep.fromTaskId),
        };
        await updateTask(updated);
      }
      setDependencies((ds) => ds.filter((d) => d.id !== dependencyId));
      return true;
    } catch (err) {
      console.error('Error removing dependency:', err);
      setError('Error al eliminar la dependencia. Por favor, inténtalo de nuevo.');
      return false;
    }
  };

  useEffect(() => {
    if (!boardId) return;
    fetchTasks();
  }, [boardId]);

  return {
    tasks,
    dependencies,
    loading,
    error,
    fetchTasks,
    updateTask,
    updateTaskDates,
    createTask,
    addDependency,
    removeDependency,
    getDependencyTypeLabel,
  };
}
