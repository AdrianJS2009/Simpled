'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { listItem, staggerChildren } from '@/lib/animation-variants';
import { cn } from '@/lib/utils';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import KanbanItem from './KanbanItem';

interface User {
  id: string;
  name: string;
  imageUrl: string;
}

interface KanbanColumnProps {
  readonly column: { id: string; title: string };
  readonly items: any[];
  readonly users: User[];
  readonly canEdit: boolean;
  readonly onAddItem: () => void;
  readonly onEditColumn: () => void;
  readonly onEditItem: (item: any) => void;
  readonly onDeleteColumn: () => void;
}

export default function KanbanColumn({
  column,
  items,
  users,
  canEdit,
  onAddItem,
  onEditColumn,
  onEditItem,
  onDeleteColumn,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const itemIds = items.map((item) => item.id);

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        'flex w-[300px] min-w-[300px] flex-col shadow-md transition-all duration-300',
        isOver && 'ring-primary/50 scale-[1.01] shadow-lg ring-2',
      )}
      interactive
    >
      <CardHeader className="flex flex-row items-center justify-between p-3 pb-2">
        <CardTitle className="text-lg font-medium">{column.title}</CardTitle>
        {canEdit && (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEditColumn}
              className="h-8 w-8 opacity-70 transition-opacity hover:opacity-100"
            >
              <PencilIcon className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDeleteColumn}
              className="text-destructive hover:bg-destructive/10 h-8 w-8 opacity-70 transition-opacity hover:opacity-100"
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="scrollbar-thin max-h-[calc(100vh-220px)] flex-grow overflow-y-auto p-3 pt-0">
        <motion.div
          className="flex flex-col gap-2"
          variants={staggerChildren}
          initial="hidden"
          animate="visible"
        >
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <AnimatePresence>
              {items.length > 0 ? (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    variants={listItem}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, y: 10, transition: { duration: 0.2 } }}
                  >
                    <KanbanItem
                      key={item.id}
                      item={item}
                      users={users}
                      onClick={() => canEdit && onEditItem(item)}
                    />
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className="text-muted-foreground rounded-md border border-dashed px-2 py-8 text-center text-sm italic"
                  variants={listItem}
                >
                  No hay tareas
                </motion.div>
              )}
            </AnimatePresence>
          </SortableContext>
        </motion.div>

        {canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddItem}
            className="text-muted-foreground hover:text-foreground mt-3 w-full transition-colors"
          >
            <PlusIcon className="mr-1 h-4 w-4" />
            Añadir tarea
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
