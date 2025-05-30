import Banner from '@/components/Banner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Heart, Lightbulb, Users, Zap } from 'lucide-react';
import Image from 'next/image';
import type React from 'react';

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <Banner className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <h1 className="mb-6 text-4xl font-bold md:text-5xl">Conoce a Simpled</h1>
        <p className="mx-auto mb-8 max-w-3xl text-lg md:text-xl">
          Descubre nuestra historia, misión y el equipo detrás de la plataforma que está
          transformando la gestión de proyectos colaborativos.
        </p>
      </Banner>

      <section className="bg-background px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <Badge className="mb-4">Nuestra Misión</Badge>
              <h2 className="mb-6 text-3xl font-bold">Simplificando la colaboración en equipos</h2>
              <p className="text-muted-foreground mb-6 text-lg">
                En Simpled, creemos que la colaboración efectiva no debería ser complicada. Nuestra
                misión es proporcionar herramientas intuitivas que permitan a los equipos
                organizarse, comunicarse y alcanzar sus objetivos sin obstáculos tecnológicos.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle2 className="mt-0.5 mr-3 h-6 w-6 shrink-0 text-indigo-500" />
                  <p>Facilitar la gestión de proyectos para equipos de cualquier tamaño</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="mt-0.5 mr-3 h-6 w-6 shrink-0 text-indigo-500" />
                  <p>Promover la transparencia y comunicación efectiva</p>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="mt-0.5 mr-3 h-6 w-6 shrink-0 text-indigo-500" />
                  <p>Crear tecnología accesible que se adapte a diferentes flujos de trabajo</p>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] overflow-hidden rounded-xl shadow-xl">
              <Image src="/imagen.png" alt="Equipo colaborando" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge className="mb-4">Nuestros Valores</Badge>
            <h2 className="mb-4 text-3xl font-bold">Los principios que nos guían</h2>
            <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
              Estos valores fundamentales definen nuestra cultura y cómo desarrollamos nuestros
              productos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <ValueCard
              icon={<Lightbulb className="h-10 w-10 text-indigo-500" />}
              title="Innovación"
              description="Buscamos constantemente nuevas formas de mejorar la experiencia de nuestros usuarios."
            />
            <ValueCard
              icon={<Zap className="h-10 w-10 text-indigo-500" />}
              title="Simplicidad"
              description="Creemos que las mejores herramientas son aquellas que son fáciles de usar y entender."
            />
            <ValueCard
              icon={<Users className="h-10 w-10 text-indigo-500" />}
              title="Colaboración"
              description="Fomentamos el trabajo en equipo, tanto internamente como en nuestros productos."
            />
            <ValueCard
              icon={<Heart className="h-10 w-10 text-indigo-500" />}
              title="Empatía"
              description="Diseñamos con una profunda comprensión de las necesidades de nuestros usuarios."
            />
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge className="mb-4">Nuestra Historia</Badge>
            <h2 className="mb-4 text-3xl font-bold">El camino hasta aquí</h2>
            <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
              Desde nuestra fundación, hemos estado comprometidos con la creación de herramientas
              que faciliten el trabajo colaborativo.
            </p>
          </div>

          <div className="space-y-12">
            <TimelineItem
              year="2020"
              title="Los inicios"
              description="Simpled nace como una idea para resolver los problemas de organización que enfrentábamos en nuestros propios proyectos."
              isLeft={true}
            />
            <TimelineItem
              year="2021"
              title="Primer lanzamiento"
              description="Lanzamos la primera versión de Simpled, con funcionalidades básicas de gestión de tableros y tareas."
              isLeft={false}
            />
            <TimelineItem
              year="2022"
              title="Crecimiento y expansión"
              description="Incorporamos nuevas funcionalidades como la edición en tiempo real y vistas personalizables."
              isLeft={true}
            />
            <TimelineItem
              year="2023"
              title="Consolidación"
              description="Alcanzamos más de 10,000 usuarios activos y expandimos nuestro equipo para mejorar el producto."
              isLeft={false}
            />
            <TimelineItem
              year="2024"
              title="Presente y futuro"
              description="Continuamos innovando y mejorando nuestra plataforma, con un enfoque en la experiencia del usuario y nuevas integraciones."
              isLeft={true}
            />
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <Badge className="mb-4">Nuestro Equipo</Badge>
            <h2 className="mb-4 text-3xl font-bold">Las personas detrás de Simpled</h2>
            <p className="text-muted-foreground mx-auto max-w-3xl text-lg">
              Un grupo diverso de profesionales apasionados por crear herramientas que mejoren la
              forma en que trabajamos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <TeamMemberCard
              name="Adrián Jiménez Santiago"
              role="CEO & Co-fundador"
              bio="Con más de 10 años de experiencia en desarrollo de productos, Adrián lidera la visión estratégica de Simpled."
              imageUrl="/imagen.png"
            />
            <TeamMemberCard
              name="Elías Robles Ruiz"
              role="CEO & Co-fundador"
              bio="Ingeniero de software con experiencia en startups tecnológicas, Elías supervisa el desarrollo técnico de la plataforma."
              imageUrl="/imagen.png"
            />
          </div>
        </div>
      </section>

      <section className="bg-background px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <StatCard number="10K+" label="Usuarios activos" />
            <StatCard number="500+" label="Empresas" />
            <StatCard number="1M+" label="Tareas completadas" />
            <StatCard number="25+" label="Países" />
          </div>
        </div>
      </section>

      <Banner className="bg-gradient-to-r from-indigo-600 to-purple-600">
        <h2 className="mb-4 text-3xl font-bold">¿Listo para simplificar tu trabajo en equipo?</h2>
        <p className="mb-8 text-xl">
          Únete a miles de equipos que ya están mejorando su productividad con Simpled.
        </p>
        <Button asChild size="lg" className="bg-white text-indigo-600 hover:bg-white/90">
          <a href="/registro">
            Comenzar gratis
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </Button>
      </Banner>
    </main>
  );
}

interface ValueCardProps {
  readonly icon: React.ReactNode;
  readonly title: string;
  readonly description: string;
}

function ValueCard({ icon, title, description }: ValueCardProps) {
  return (
    <Card className="border-none shadow-md">
      <CardContent className="pt-6">
        <div className="mb-4">{icon}</div>
        <h3 className="mb-2 text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

interface TeamMemberCardProps {
  readonly name: string;
  readonly role: string;
  readonly bio: string;
  readonly imageUrl: string;
}

function TeamMemberCard({ name, role, bio, imageUrl }: TeamMemberCardProps) {
  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="relative aspect-square">
        <Image src={imageUrl || '/placeholder.svg'} alt={name} fill className="object-cover" />
      </div>
      <CardContent className="p-6">
        <h3 className="mb-1 text-xl font-semibold">{name}</h3>
        <p className="mb-3 font-medium text-indigo-500">{role}</p>
        <p className="text-muted-foreground">{bio}</p>
      </CardContent>
    </Card>
  );
}

interface TimelineItemProps {
  year: string;
  title: string;
  description: string;
  isLeft: boolean;
}

function TimelineItem({ year, title, description, isLeft }: Readonly<TimelineItemProps>) {
  return (
    <div
      className={`flex flex-col md:flex-row ${
        isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
      } items-center`}
    >
      <div className="flex justify-center p-4 md:w-1/2">
        <div className="rounded-lg bg-indigo-500 px-6 py-3 text-2xl font-bold text-white shadow-lg">
          {year}
        </div>
      </div>
      <div className="p-4 md:w-1/2">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <h3 className="mb-2 text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  readonly number: string;
  readonly label: string;
}

function StatCard({ number, label }: StatCardProps) {
  return (
    <Card className="border-none text-center shadow-md">
      <CardContent className="p-6">
        <p className="mb-2 text-4xl font-bold text-indigo-500">{number}</p>
        <p className="text-muted-foreground text-lg">{label}</p>
      </CardContent>
    </Card>
  );
}
