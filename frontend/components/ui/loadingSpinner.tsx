export default function LoadingSpinner({ isLoading=true }: { isLoading: boolean }) {
    if (!isLoading) return null;
  return (
    <div className="flex flex-col items-center justify-center py-4 text-gray-500 text-sm">
      <div className="w-6 h-6 mb-2 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      Loading...
    </div>
  );
}
