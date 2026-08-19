export default function Loading() {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <div className="h-6 w-32 animate-pulse rounded bg-stone-200" />
      {[0, 1, 2].map((key) => (
        <div key={key} className="h-24 animate-pulse rounded-xl bg-stone-100" />
      ))}
      <span className="sr-only">กำลังโหลด...</span>
    </div>
  );
}
