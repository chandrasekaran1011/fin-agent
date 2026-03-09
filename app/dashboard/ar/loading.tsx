export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl border border-[var(--border-default)] bg-white animate-pulse"
          />
        ))}
      </div>
      <div className="h-96 rounded-xl border border-[var(--border-default)] bg-white animate-pulse" />
    </div>
  );
}
