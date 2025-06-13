'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useDraggable } from '@dnd-kit/core';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronRight, Grip, Link2 } from 'lucide-react';
import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { Dependency, Task } from './index';

interface TimelineHeader {
  readonly label: string;
  readonly span: number;
  readonly startDate: Date;
}

interface GroupedTask {
  readonly id: string;
  readonly title: string;
  readonly isGroup: boolean;
  readonly tasks: Task[];
  readonly expanded: boolean;
}

interface GanttViewProps {
  readonly tasks: Task[];
  readonly dependencies: Dependency[];
  readonly groupedTasks: GroupedTask[];
  readonly timelineDates: Date[];
  readonly timelineHeaders: TimelineHeader[];
  readonly viewMode: 'day' | 'week' | 'month';
  readonly startDate: Date;
  readonly daysToShow: number;
  readonly zoomLevel: number;
  readonly onTaskClick: (task: Task) => void;
  readonly onTimelineClick: (e: React.MouseEvent, date: Date) => void;
  readonly onManageDependencies: (task: Task) => void;
  readonly toggleGroupExpansion: (groupId: string) => void;
}

export function GanttView({
  tasks,
  dependencies,
  groupedTasks,
  timelineDates,
  timelineHeaders,
  viewMode,
  startDate,
  daysToShow,
  zoomLevel,
  onTaskClick,
  onTimelineClick,
  onManageDependencies,
  toggleGroupExpansion,
}: GanttViewProps) {
  const [todayPosition, setTodayPosition] = useState<number | null>(null);
  const [dependencyLines, setDependencyLines] = useState<
    Array<{
      id: string;
      fromX: number;
      fromY: number;
      toX: number;
      toY: number;
      type: Dependency['type'];
    }>
  >([]);

  const todayFormatted = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  useEffect(() => {
    const today = new Date();
    const daysSinceStart = Math.floor(
      (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceStart >= 0 && daysSinceStart < daysToShow) {
      setTodayPosition(daysSinceStart);
    } else {
      setTodayPosition(null);
    }
  }, [startDate, daysToShow]);

  function findTaskIndexInGroups(groupedTasks: GroupedTask[], taskId: string) {
    let index = -1;
    let visible = true;
    groupedTasks.forEach((group, groupIdx) => {
      if (group.isGroup) {
        const inGroup = group.tasks.some((t) => t.id === taskId);
        if (!group.expanded && inGroup) visible = false;
        if (group.expanded) {
          group.tasks.forEach((task, taskIdx) => {
            if (task.id === taskId) index = groupIdx + taskIdx + 1;
          });
        }
      } else if (group.tasks[0].id === taskId) {
        index = groupIdx;
      }
    });
    return { index, visible };
  }

  function toDays(dateStr: string, startDate: Date, daysToShow: number) {
    const date = new Date(dateStr);
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diffDays, daysToShow - 1));
  }

  useEffect(() => {
    const lines: typeof dependencyLines = [];
    const dayWidth = 40 * zoomLevel;
    const rowHeight = 40;

    dependencies.forEach((dep) => {
      const fromTask = tasks.find((t) => t.id === dep.fromTaskId);
      const toTask = tasks.find((t) => t.id === dep.toTaskId);
      if (!fromTask || !toTask) return;

      const { index: fromIndex, visible: fromVisible } = findTaskIndexInGroups(
        groupedTasks,
        fromTask.id,
      );
      const { index: toIndex, visible: toVisible } = findTaskIndexInGroups(groupedTasks, toTask.id);
      if (fromIndex === -1 || toIndex === -1 || !fromVisible || !toVisible) return;

      const fromStartDay = toDays(fromTask.startDate, startDate, daysToShow);
      const fromEndDay = toDays(fromTask.endDate, startDate, daysToShow);
      const toStartDay = toDays(toTask.startDate, startDate, daysToShow);
      const toEndDay = toDays(toTask.endDate, startDate, daysToShow);

      let fromX: number, toX: number;
      switch (dep.type) {
        case 'finish-to-start':
          fromX = 200 + fromEndDay * dayWidth + dayWidth / 2;
          toX = 200 + toStartDay * dayWidth;
          break;
        case 'start-to-start':
          fromX = 200 + fromStartDay * dayWidth;
          toX = 200 + toStartDay * dayWidth;
          break;
        case 'finish-to-finish':
          fromX = 200 + fromEndDay * dayWidth + dayWidth / 2;
          toX = 200 + toEndDay * dayWidth + dayWidth / 2;
          break;
        case 'start-to-finish':
          fromX = 200 + fromStartDay * dayWidth;
          toX = 200 + toEndDay * dayWidth + dayWidth / 2;
          break;
      }

      const fromY = (fromIndex + 1) * rowHeight + rowHeight / 2;
      const toY = (toIndex + 1) * rowHeight + rowHeight / 2;

      lines.push({
        id: dep.id,
        fromX,
        fromY,
        toX,
        toY,
        type: dep.type,
      });
    });

    setDependencyLines(lines);
  }, [dependencies, tasks, groupedTasks, startDate, zoomLevel, daysToShow]);

  const handleTimelineClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x <= 200) return;

    const dayWidth = 40 * zoomLevel;
    const dayIndex = Math.floor((x - 200) / dayWidth);
    if (dayIndex >= 0 && dayIndex < timelineDates.length) {
      onTimelineClick(e, timelineDates[dayIndex]);
    }
  };

  return (
    <TooltipProvider>
      <div className="gantt-chart min-w-[800px]">
        <div
          className="gantt-timeline-header grid"
          style={{
            gridTemplateColumns: `200px repeat(${daysToShow}, minmax(${40 * zoomLevel}px, 1fr))`,
          }}
        >
          <div className="gantt-header-cell bg-muted/50 border-r border-b p-2">Tarea</div>
          {viewMode === 'day'
            ? timelineDates.map((date) => {
                const formatted = format(date, 'yyyy-MM-dd');
                let dayHeaderClass =
                  'gantt-header-cell gantt-day border-r border-b p-2 text-center text-xs';
                dayHeaderClass +=
                  formatted === todayFormatted
                    ? ' bg-blue-100 dark:bg-blue-900/20'
                    : ' bg-muted/50';
                return (
                  <div key={formatted} className={dayHeaderClass}>
                    {format(date, 'EEE d', { locale: es })}
                  </div>
                );
              })
            : timelineHeaders.map((header) => (
                <div
                  key={header.label}
                  className="gantt-header-cell bg-muted/50 border-r border-b p-2 text-center text-xs"
                  style={{ gridColumn: `span ${header.span}` }}
                >
                  {header.label}
                </div>
              ))}
        </div>

        {viewMode !== 'day' && (
          <div
            className="gantt-timeline-subheader grid"
            style={{
              gridTemplateColumns: `200px repeat(${daysToShow}, minmax(${40 * zoomLevel}px, 1fr))`,
            }}
          >
            <div className="gantt-header-cell bg-muted/30 border-r border-b p-2"></div>
            {timelineDates.map((date) => {
              const formatted = format(date, 'yyyy-MM-dd');
              let subHeaderClass = 'gantt-day border-r border-b p-1 text-center text-xs';
              subHeaderClass +=
                formatted === todayFormatted ? ' bg-blue-100 dark:bg-blue-900/20' : ' bg-muted/30';
              return (
                <div key={formatted} className={subHeaderClass}>
                  {format(date, 'd', { locale: es })}
                </div>
              );
            })}
          </div>
        )}

        <div className="gantt-body relative">
          <button
            type="button"
            className="absolute top-0 left-0 z-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Seleccionar fecha en el timeline"
            onClick={handleTimelineClick}
            tabIndex={0}
            style={{ outline: 'none' }}
          />
          {groupedTasks.length === 0 ? (
            <div className="col-span-full border-b py-8 text-center">
              No hay tareas para mostrar
            </div>
          ) : (
            groupedTasks.map((group) => (
              <div key={group.id}>
                {group.isGroup ? (
                  <>
                    <GroupRow
                      group={group}
                      daysToShow={daysToShow}
                      zoomLevel={zoomLevel}
                      toggleGroupExpansion={toggleGroupExpansion}
                      timelineDates={timelineDates}
                      startDate={startDate}
                    />
                    {group.expanded &&
                      group.tasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          daysToShow={daysToShow}
                          zoomLevel={zoomLevel}
                          startDate={startDate}
                          timelineDates={timelineDates}
                          onTaskClick={onTaskClick}
                          onManageDependencies={onManageDependencies}
                          isInGroup={true}
                          hasDependencies={dependencies.some(
                            (d) => d.fromTaskId === task.id || d.toTaskId === task.id,
                          )}
                        />
                      ))}
                  </>
                ) : (
                  <TaskRow
                    key={group.tasks[0].id}
                    task={group.tasks[0]}
                    daysToShow={daysToShow}
                    zoomLevel={zoomLevel}
                    startDate={startDate}
                    timelineDates={timelineDates}
                    onTaskClick={onTaskClick}
                    onManageDependencies={onManageDependencies}
                    isInGroup={false}
                    hasDependencies={dependencies.some(
                      (d) => d.fromTaskId === group.tasks[0].id || d.toTaskId === group.tasks[0].id,
                    )}
                  />
                )}
              </div>
            ))
          )}

          <svg
            className="pointer-events-none absolute top-0 left-0 h-full w-full"
            style={{ zIndex: 5 }}
          >
            {dependencyLines.map((line) => {
              const isVertical = Math.abs(line.toY - line.fromY) > Math.abs(line.toX - line.fromX);
              const controlDistance = isVertical ? 20 : Math.abs(line.toX - line.fromX) * 0.4;

              let path = '';
              const arrowSize = 6;

              path = `M ${line.fromX},${line.fromY} \
                        C ${line.fromX + controlDistance},${line.fromY} \
                          ${line.toX - controlDistance},${line.toY} \
                          ${line.toX},${line.toY}`;

              let strokeStyle = '';
              if (line.type === 'finish-to-start') {
                strokeStyle = '';
              } else if (line.type === 'start-to-start') {
                strokeStyle = '5,5';
              } else if (line.type === 'finish-to-finish') {
                strokeStyle = '8,3';
              } else {
                strokeStyle = '3,3,8,3';
              }

              let strokeColor = '';
              if (line.type === 'finish-to-start') {
                strokeColor = 'rgba(59, 130, 246, 0.6)';
              } else if (line.type === 'start-to-start') {
                strokeColor = 'rgba(16, 185, 129, 0.6)';
              } else if (line.type === 'finish-to-finish') {
                strokeColor = 'rgba(245, 158, 11, 0.6)';
              } else {
                strokeColor = 'rgba(239, 68, 68, 0.6)';
              }

              return (
                <g key={line.id}>
                  <path
                    d={path}
                    stroke={strokeColor}
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={strokeStyle}
                    markerEnd={`url(#arrowhead-${line.type})`}
                  />
                </g>
              );
            })}

            <defs>
              <marker
                id="arrowhead-finish-to-start"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 z" fill="rgba(59, 130, 246, 0.6)" />
              </marker>
              <marker
                id="arrowhead-start-to-start"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 z" fill="rgba(16, 185, 129, 0.6)" />
              </marker>
              <marker
                id="arrowhead-finish-to-finish"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 z" fill="rgba(245, 158, 11, 0.6)" />
              </marker>
              <marker
                id="arrowhead-start-to-finish"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <path d="M 0 0 L 8 4 L 0 8 z" fill="rgba(239, 68, 68, 0.6)" />
              </marker>
            </defs>
          </svg>

          {todayPosition !== null && (
            <div
              className="gantt-today-line pointer-events-none absolute top-0 bottom-0 z-10 w-[2px] bg-red-500/80"
              style={{
                left: `calc(200px + ${todayPosition * 40 * zoomLevel}px)`,
                height: '100%',
              }}
            >
              <div className="gantt-today-label absolute -top-6 left-1/2 -translate-x-1/2 transform rounded bg-red-500 px-2 py-1 text-xs whitespace-nowrap text-white">
                Hoy
              </div>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

interface GroupRowProps {
  readonly group: GroupedTask;
  readonly daysToShow: number;
  readonly zoomLevel: number;
  readonly toggleGroupExpansion: (groupId: string) => void;
  readonly timelineDates: Date[];
  readonly startDate: Date;
}

function GroupRow({
  group,
  daysToShow,
  zoomLevel,
  toggleGroupExpansion,
  timelineDates,
  startDate,
}: GroupRowProps) {
  const todayFormatted = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  return (
    <div
      className="gantt-row bg-muted/30 relative grid"
      style={{
        gridTemplateColumns: `200px repeat(${daysToShow}, minmax(${40 * zoomLevel}px, 1fr))`,
      }}
    >
      <button
        type="button"
        className="gantt-task-info w-full truncate border-r border-b p-2 text-left font-medium"
        onClick={() => toggleGroupExpansion(group.id)}
      >
        <div className="flex items-center">
          {group.expanded ? (
            <ChevronDown className="mr-1 h-4 w-4" />
          ) : (
            <ChevronRight className="mr-1 h-4 w-4" />
          )}
          <span>{`${group.title} (${group.tasks.length})`}</span>
        </div>
      </button>

      {timelineDates.map((date) => {
        const formatted = format(date, 'yyyy-MM-dd');
        let cellClass = 'gantt-cell border-r border-b';
        if (formatted === todayFormatted) {
          cellClass += ' bg-blue-100 dark:bg-blue-900/20';
        }
        return <div key={formatted} className={cellClass} />;
      })}
    </div>
  );
}

interface TaskRowProps {
  readonly task: Task;
  readonly daysToShow: number;
  readonly zoomLevel: number;
  readonly startDate: Date;
  readonly timelineDates: Date[];
  readonly onTaskClick: (task: Task) => void;
  readonly onManageDependencies: (task: Task) => void;
  readonly isInGroup: boolean;
  readonly hasDependencies: boolean;
}

function TaskRow({
  task,
  daysToShow,
  zoomLevel,
  startDate,
  timelineDates,
  onTaskClick,
  onManageDependencies,
  isInGroup,
  hasDependencies,
}: TaskRowProps) {
  const todayFormatted = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);
  const taskStart = new Date(task.startDate);
  const taskEnd = new Date(task.endDate);

  const startDiff = Math.max(
    0,
    Math.floor((taskStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const duration = Math.max(
    1,
    Math.floor((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24)) + 1,
  );

  let visibleDuration = Math.min(duration, daysToShow - startDiff);

  let isVisible = startDiff < daysToShow && startDiff + duration > 0;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: {
      type: 'task',
      startDate: taskStart,
      endDate: taskEnd,
      task,
    },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const getStatusColor = (status?: string, progress?: number) => {
    if (progress === 100 || status === 'completed') return 'bg-emerald-500 hover:bg-emerald-600';
    if (status === 'delayed') return 'bg-rose-500 hover:bg-rose-600';
    if (status === 'in-progress') return 'bg-blue-500 hover:bg-blue-600';
    return 'bg-amber-500 hover:bg-amber-600';
  };

  const statusLabel = useMemo(() => {
    switch (task.status) {
      case 'completed':
        return 'Completada';
      case 'delayed':
        return 'Retrasada';
      case 'in-progress':
        return 'En progreso';
      default:
        return 'Pendiente';
    }
  }, [task.status]);

  const getVisibleDay = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diffDays, daysToShow - 1));
  };

  const taskStartDay = getVisibleDay(task.startDate);
  const taskEndDay = getVisibleDay(task.endDate);

  const actualStartDate = new Date(task.startDate);
  const actualEndDate = new Date(task.endDate);
  const actualDuration =
    Math.floor((actualEndDate.getTime() - actualStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  visibleDuration = Math.max(1, taskEndDay - taskStartDay + 1);

  isVisible = taskStartDay < daysToShow && taskEndDay >= 0;

  return (
    <div
      className="gantt-row relative grid"
      style={{
        gridTemplateColumns: `200px repeat(${daysToShow}, minmax(${40 * zoomLevel}px, 1fr))`,
      }}
    >
      <div className={cn('gantt-task-info truncate border-r border-b p-2', isInGroup && 'pl-6')}>
        <div className="flex items-center truncate font-medium">
          {task.title}
          {hasDependencies && <Link2 className="text-muted-foreground ml-1 h-3 w-3" />}
        </div>
      </div>

      {timelineDates.map((date) => {
        const formatted = format(date, 'yyyy-MM-dd');
        let cellClass = 'gantt-cell border-r border-b';
        if (formatted === todayFormatted) {
          cellClass += ' bg-blue-100 dark:bg-blue-900/20';
        }
        return <div key={formatted} className={cellClass} />;
      })}

      {isVisible && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              ref={setNodeRef}
              {...attributes}
              {...listeners}
              className={cn(
                'gantt-task-bar absolute flex cursor-pointer items-center rounded-md px-2 text-xs text-white',
                getStatusColor(task.status, task.progress),
                isDragging && 'z-10 opacity-70',
              )}
              style={{
                gridColumnStart: taskStartDay + 2,
                gridColumnEnd: `span ${visibleDuration}`,
                top: '4px',
                height: 'calc(100% - 8px)',
                ...style,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick(task);
              }}
              aria-label={`Seleccionar tarea ${task.title}`}
            >
              <div className="gantt-task-content flex-1 truncate">
                <Grip className="mr-1 inline h-3 w-3 opacity-70" />
                {task.title}
              </div>

              {task.progress > 0 && (
                <div
                  className="absolute top-0 bottom-0 left-0 rounded-l-md bg-white/20"
                  style={{ width: `${task.progress}%`, maxWidth: '100%' }}
                />
              )}

              <button
                type="button"
                aria-label="Gestionar dependencias"
                title="Gestionar dependencias"
                className="gantt-task-handle absolute top-0 right-0 bottom-0 flex w-6 items-center justify-center opacity-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onManageDependencies(task);
                }}
              >
                <Link2 className="h-3 w-3" />
              </button>
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-xs">
              <div className="font-bold">{task.title}</div>
              {task.description && <div className="mt-1">{task.description}</div>}
              <div className="mt-1">
                <span className="font-medium">Inicio:</span> {format(taskStart, 'dd/MM/yyyy')}
              </div>
              <div>
                <span className="font-medium">Fin:</span> {format(taskEnd, 'dd/MM/yyyy')}
              </div>
              <div>
                <span className="font-medium">Progreso:</span> {task.progress}%
              </div>
              <div>
                <span className="font-medium">Estado:</span> {statusLabel}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
