export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-bl from-primary/8 via-background to-violet-500/5 p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 start-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 end-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-[420px]">{children}</div>
    </div>
  );
}
