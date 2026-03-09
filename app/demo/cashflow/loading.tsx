export default function Loading() {
  return (
    <div className="grid grid-cols-[280px_1fr_280px] gap-4 min-h-[calc(100vh-8rem)]">
      <div className="h-64 rounded-xl border border-[var(--border-default)] bg-white animate-pulse" />
      <div className="h-96 rounded-xl border border-[var(--border-default)] bg-white animate-pulse" />
      <div className="h-64 rounded-xl border border-[var(--border-default)] bg-white animate-pulse" />
    </div>
  );
}
