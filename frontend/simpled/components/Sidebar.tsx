'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Grid2x2, Home, Menu, RefreshCw, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useBoards } from '@/contexts/BoardsContext';

import { useAuth } from '@/contexts/AuthContext';
import { useParams, useRouter } from 'next/navigation';

const API = 'http://localhost:5193';

const Sidebar = () => {
  const { auth } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { boards, fetchBoards } = useBoards();
  const params = useParams();
  const router = useRouter();
  const selectedBoardId = params.id as string;
  const [columns, setColumns] = useState<any[]>([]);
  const headers: HeadersInit = {};
  if (auth.token) headers['Authorization'] = `Bearer ${auth.token}`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [columnRes] = await Promise.all([fetch(`${API}/api/Columns`, { headers })]);

      const columnData = await columnRes.json();

      setColumns(columnData);
    } catch (err) {
      console.error('Error al cargar el tablero:', err);
    }
  };

  return (
    <aside
      className={cn(
        'flex flex-col border-r p-4 transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64',
      )}
      style={{ maxHeight: '90vh', overflowY: 'auto' }}
    >
      <Button
        variant="ghost"
        className="mb-4 flex items-center gap-2"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Menu />
        {!isCollapsed && <span>Menú</span>}
      </Button>

      <nav className="space-y-2">
        {!isCollapsed && (
          <div className="flex flex-row gap-1">
            <Select
              defaultValue={selectedBoardId}
              onValueChange={(value) => router.push(`/tableros/${value}`)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Tableros disponibles</SelectLabel>

                  {boards.map((board) => (
                    <SelectItem key={board.id} value={board.id}>
                      <Grid2x2 />
                      <div className="pl-1">{board.name}</div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="mb-4 flex items-center gap-2"
              onClick={() => fetchBoards()}
            >
              <RefreshCw />
            </Button>
          </div>
        )}
        <NavItem icon={<Home />} isCollapsed={isCollapsed}>
          Home
        </NavItem>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="settings">
            <AccordionTrigger className="flex w-full items-center gap-2">
              <Settings />
              {!isCollapsed && <span>Configuración</span>}
              {!isCollapsed && (
                <ChevronDown className="text-muted-foreground pointer-events-none size-5 shrink-0 translate-y-0.5 transition-transform duration-200" />
              )}
            </AccordionTrigger>
            <AccordionContent className="pl-6">
              <NavItem icon={<ChevronRight />} isCollapsed={isCollapsed}>
                Perfil
              </NavItem>
              <NavItem icon={<ChevronRight />} isCollapsed={isCollapsed}>
                Cerrar sesion
              </NavItem>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </nav>
    </aside>
  );
};

const NavItem = ({
  icon,
  children,
  isCollapsed,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  isCollapsed: boolean;
}) => (
  <div className="hover:bg-accent flex cursor-pointer items-center gap-2 rounded-md p-2">
    {icon}
    {!isCollapsed && <span>{children}</span>}
  </div>
);

export default Sidebar;
