export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen">
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
