export default function ErrorCard({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="w-full max-w-xl mx-auto p-6 bg-red-900/20 border border-red-500/50 rounded-2xl flex flex-col items-center text-center animate-in slide-in-from-bottom-4">
      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-red-200 font-medium mb-6">{error}</p>
      <button onClick={onRetry} className="px-6 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition tracking-wide font-medium">
        Try Again
      </button>
    </div>
  );
}
