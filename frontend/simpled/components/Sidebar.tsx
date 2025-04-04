"use client";

import type React from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useBoards } from "@/contexts/BoardsContext";
import { cn } from "@/lib/utils";
import {
  Home,
  Layers3,
  LogOut,
  PanelLeft,
  RefreshCw,
  Settings,
  User,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { boards, fetchBoards, loading } = useBoards();
  const { cerrarSesion } = useAuth();
  const params = useParams();
  const router = useRouter();
  const selectedBoardId = params.id as string;

  return (
    <aside
      className={cn(
        "h-[calc(100vh-4rem)] transition-all duration-300 flex flex-col border-r bg-card",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shrink-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft
            className={cn(
              "h-5 w-5 transition-transform",
              isCollapsed && "rotate-180"
            )}
          />
        </Button>
        {!isCollapsed && <h2 className="text-sm font-semibold">Navegación</h2>}
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        <NavItem
          href="/"
          icon={<Home className="h-5 w-5" />}
          label="Inicio"
          isCollapsed={isCollapsed}
        />

        <NavItem
          href="/tableros"
          icon={<Layers3 className="h-5 w-5" />}
          label="Tableros"
          isCollapsed={isCollapsed}
        />

        {!isCollapsed && (
          <div className="py-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-muted-foreground">
                Tableros recientes
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => fetchBoards()}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>

            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : (
              <div className="space-y-1">
                {boards.length > 0 ? (
                  <Select
                    defaultValue={selectedBoardId}
                    onValueChange={(value) => router.push(`/tableros/${value}`)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar tablero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Tableros disponibles</SelectLabel>
                        {boards.map((board) => (
                          <SelectItem key={board.id} value={board.id}>
                            {board.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-muted-foreground py-2">
                    No hay tableros disponibles
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t p-3">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="settings" className="border-none">
            <AccordionTrigger
              className={cn(
                "py-2 px-3 rounded-md hover:bg-accent hover:no-underline",
                isCollapsed && "justify-center"
              )}
            >
              {isCollapsed ? (
                <Settings className="h-5 w-5" />
              ) : (
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span>Configuración</span>
                </div>
              )}
            </AccordionTrigger>
            {!isCollapsed && (
              <AccordionContent className="pb-1 pt-1">
                <div className="space-y-1 pl-8">
                  <NavItem
                    href="/perfil"
                    icon={<User className="h-4 w-4" />}
                    label="Perfil"
                    isCollapsed={false}
                    nested
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start pl-2 font-normal"
                    onClick={cerrarSesion}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </Button>
                </div>
              </AccordionContent>
            )}
          </AccordionItem>
        </Accordion>

        {!isCollapsed && (
          <div className="mt-4 flex items-center gap-3 px-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">US</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Usuario</span>
              <span className="text-xs text-muted-foreground">
                usuario@email.com
              </span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  nested?: boolean;
}

const NavItem = ({
  href,
  icon,
  label,
  isCollapsed,
  nested = false,
}: NavItemProps) => (
  <Button
    variant="ghost"
    size={nested ? "sm" : "default"}
    className={cn(
      "w-full justify-start",
      nested && "pl-2 font-normal",
      isCollapsed && "justify-center px-0"
    )}
    asChild
  >
    <a href={href}>
      {icon}
      {!isCollapsed && (
        <span className={nested ? "ml-2" : "ml-3"}>{label}</span>
      )}
    </a>
  </Button>
);

export default Sidebar;
