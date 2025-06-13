'use client';

import { TooltipProvider } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
              <GroupRow
                key={group.id}
                group={group}
                daysToShow={daysToShow}
                zoomLevel={zoomLevel}
                toggleGroupExpansion={toggleGroupExpansion}
                timelineDates={timelineDates}
                startDate={startDate}
              />
            ))
          )}
        </div>

        <svg
          className="pointer-events-none absolute top-0 left-0 h-full w-full"
          style={{ zIndex: 1 }}
        >
          {dependencyLines.map((line) => (
            <g key={line.id}>
              <path
                d={`M ${line.fromX} ${line.fromY} C ${(line.fromX + line.toX) / 2} ${line.fromY}, ${
                  (line.fromX + line.toX) / 2
                } ${line.toY}, ${line.toX} ${line.toY}`}
                stroke="#94a3b8"
                strokeWidth="2"
                fill="none"
                markerEnd="url(#arrowhead)"
              />
            </g>
          ))}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
            </marker>
          </defs>
        </svg>
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

  const getStatusColor = (status?: string, progress?: number) => {
    if (status === 'completed') return '#22c55e';
    if (status === 'in-progress') return '#3b82f6';
    if (status === 'delayed') return '#ef4444';
    if (status === 'pending') return '#6b7280';
    if (progress && progress > 0) return '#3b82f6';
    return '#6b7280';
  };

  const getVisibleDay = (dateStr: string) => {
    const date = new Date(dateStr);
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diffDays, daysToShow - 1));
  };

  const startDay = getVisibleDay(group.tasks[0].startDate);
  const endDay = getVisibleDay(group.tasks[group.tasks.length - 1].endDate);
  const duration = endDay - startDay + 1;
  const progress = group.tasks[Math.floor(duration / 2)].progress || 0;
  const progressWidth = Math.max(0, Math.min(duration * progress, duration));
  const statusColor = getStatusColor(group.tasks[0].status, group.tasks[0].progress);
  const strokeStyle = group.tasks[0].status === 'delayed' ? '5,5' : 'none';

  return (
    <div className="gantt-row relative h-10 border-b">
      <div className="gantt-task-info bg-background absolute top-0 left-0 z-10 flex h-full w-[200px] items-center gap-2 border-r px-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleGroupExpansion(group.id)}
            className="flex-1 truncate text-left hover:underline"
            title={`Expandir/contraer grupo ${group.title}`}
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
        </div>
      </div>
      <div
        className="gantt-task-bars absolute top-0 left-[200px] h-full"
        style={{
          width: `${daysToShow * 40 * zoomLevel}px`,
        }}
      >
        <div
          className="gantt-task-bar absolute top-1/2 h-6 -translate-y-1/2 rounded"
          style={{
            left: `${startDay * 40 * zoomLevel}px`,
            width: `${duration * 40 * zoomLevel}px`,
            backgroundColor: statusColor,
            opacity: 0.2,
          }}
        />
        {progressWidth > 0 && (
          <div
            className="gantt-task-progress absolute top-1/2 h-6 -translate-y-1/2 rounded"
            style={{
              left: `${startDay * 40 * zoomLevel}px`,
              width: `${progressWidth * 40 * zoomLevel}px`,
              backgroundColor: statusColor,
            }}
          />
        )}
        <div
          className="gantt-task-border absolute top-1/2 h-6 -translate-y-1/2 rounded border-2"
          style={{
            left: `${startDay * 40 * zoomLevel}px`,
            width: `${duration * 40 * zoomLevel}px`,
            borderColor: statusColor,
            strokeDasharray: strokeStyle,
          }}
        />
      </div>
    </div>
  );
}
