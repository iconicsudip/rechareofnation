// Shown instantly while a public page's code/data streams in, so navigation never
// feels frozen. (Admin routes render their own loading states.)
export default function Loading() {
  return (
    <div className="flex flex-col gap-8 px-4 py-14 max-w-[1360px] mx-auto w-full" role="status" aria-label="Loading page">
      <div className="flex flex-col gap-3 items-start">
        <div className="skeleton h-4 w-32" />
        <div className="skeleton h-10 w-2/3 max-w-xl" />
        <div className="skeleton h-4 w-full max-w-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-64" />
        ))}
      </div>
    </div>
  );
}
