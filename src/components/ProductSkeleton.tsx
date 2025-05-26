export default function ProductSkeleton() {
  return (
    <div className="rounded-2xl border bg-muted animate-pulse p-3 space-y-3 flex flex-col">
      <div className="aspect-square bg-muted-foreground/10 rounded-md w-full" />
      <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
      <div className="h-4 bg-muted-foreground/20 rounded w-1/2" />
      <div className="h-8 bg-muted-foreground/30 rounded w-full mt-auto" />
    </div>
  );
}
