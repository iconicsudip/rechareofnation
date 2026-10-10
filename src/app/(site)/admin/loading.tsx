export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center py-24" role="status" aria-label="Loading">
      <div className="w-10 h-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
    </div>
  );
}
