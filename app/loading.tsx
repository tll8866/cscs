export default function Loading() {
  return (
    <main className="flex h-full flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      <h2 className="text-center mt-4">加载中...</h2>
    </main>
  );
} 