export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Simpled</h3>
            <p className="text-muted-foreground">
              Plataforma colaborativa para gestionar tareas y proyectos en
              equipo.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Inicio
                </a>
              </li>
              <li>
                <a
                  href="/nosotros"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Nosotros
                </a>
              </li>
              <li>
                <a
                  href="/tableros"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tableros
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/privacidad"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Política de privacidad
                </a>
              </li>
              <li>
                <a
                  href="/terminos"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Términos de servicio
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
          <p>&copy; {year} Simpled. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
