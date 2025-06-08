import Banner from '@/components/Banner';
import FeatureCard from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle2, Layers, Users } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Banner className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-16 text-center">
        <h1 className="mb-6 text-4xl font-bold md:text-5xl">
          La herramienta definitiva para la gestión colaborativa de proyectos
        </h1>
        <p className="mx-auto mb-8 max-w-3xl text-lg md:text-xl">
          Organiza tareas, proyectos e ideas de manera sencilla y en tiempo real, con todo lo que
          necesitas para trabajar en equipo.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-white/90">
            <a href="#caracteristicas">Descubre más</a>
          </Button>
          <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-white/90">
            <a href="/registro">Comenzar gratis</a>
          </Button>
        </div>
      </Banner>

      <section id="caracteristicas" className="bg-background px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            ¿Qué puedes hacer con Simpled.?
          </h2>
          <p className="text-muted-foreground mx-auto mb-16 max-w-3xl text-center text-xl">
            Una plataforma completa para gestionar tus proyectos de forma eficiente y colaborativa
          </p>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Layers className="h-10 w-10 text-indigo-500" />}
              title="Organiza tu trabajo en Tableros"
              description="Crea tableros personalizados para dividir tus proyectos y hacer un seguimiento claro de las tareas."
              imageUrl="/imagen.png"
            />

            <FeatureCard
              icon={<Users className="h-10 w-10 text-indigo-500" />}
              title="Colabora en Tiempo Real"
              description="Trabaja simultáneamente con tu equipo, con cambios reflejados al instante gracias a la edición colaborativa."
              imageUrl="/imagen.png"
            />

            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-indigo-500" />}
              title="Gestión Avanzada"
              description="Utiliza vistas tipo Kanban y calendarios para organizar tus tareas de manera visual y eficiente."
              imageUrl="/imagen.png"
            />
          </div>
        </div>
      </section>

      <div className="px-4 py-8">
        <hr />
      </div>

      <section className="bg-muted/30 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold">Manejo de Roles y Permisos</h2>
              <p className="mb-6 text-lg">
                Asigna roles y permisos a tu equipo para controlar el acceso y la colaboración
                dentro de los tableros. De esta forma, puedes gestionar de manera estructurada quién
                puede ver, editar o administrar tareas.
              </p>
              <ul className="mb-8 space-y-3">
                <li className="flex items-start">
                  <CheckCircle2 className="mt-0.5 mr-2 h-6 w-6 shrink-0 text-indigo-500" />
                  <span>Administradores con control total sobre el tablero</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mt-0.5 mr-2 h-6 w-6 shrink-0 text-indigo-500" />
                  <span>Editores que pueden modificar tareas y columnas</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mt-0.5 mr-2 h-6 w-6 shrink-0 text-indigo-500" />
                  <span>Observadores con acceso de solo lectura</span>
                </li>
              </ul>
            </div>
            <div className="overflow-hidden rounded-xl shadow-lg">
              <Image
                src="/imagen.png"
                alt="Manejo de Roles y Permisos"
                width={600}
                height={400}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <Banner className="bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold">¡Comienza a organizar tus proyectos hoy mismo!</h2>
        <p className="mb-8 text-xl">
          Regístrate ahora y prueba todas las funciones de <b>Simpled.</b>. ¡Es completamente
          gratis!
        </p>
        <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-white/90">
          <a href="/registro">Regístrate</a>
        </Button>
      </Banner>
    </main>
  );
}
