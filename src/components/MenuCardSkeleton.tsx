export default function MenuCardSkeleton() {
  return (
    <div className="bg-card border border-line rounded-3xl overflow-hidden flex flex-col h-[372px]">
      {/* Image slot */}
      <div className="relative h-52 w-full bg-card-2 overflow-hidden">
        <div className="absolute inset-0 shimmer-bg opacity-60" />
        <div className="absolute top-3 left-3 w-24 h-6 bg-card/70 rounded-full" />
        <div className="absolute bottom-3 right-3 w-16 h-7 bg-card/70 rounded-full" />
      </div>

      {/* Body */}
      <div className="p-4 space-y-3 flex-1">
        <div className="h-5 bg-card-2 rounded-md w-2/3 relative overflow-hidden">
          <div className="absolute inset-0 shimmer-bg opacity-50" />
        </div>
        <div className="space-y-2">
          <div className="h-3.5 bg-card-2 rounded-md w-full" />
          <div className="h-3.5 bg-card-2 rounded-md w-5/6" />
        </div>
        <div className="flex gap-1.5 pt-1">
          <div className="h-6 bg-card-2 rounded-full w-16" />
          <div className="h-6 bg-card-2 rounded-full w-20" />
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 pt-0 flex items-center justify-between">
        <div className="h-3 bg-card-2 rounded w-12" />
        <div className="h-4 bg-card-2 rounded w-24" />
      </div>
    </div>
  );
}
