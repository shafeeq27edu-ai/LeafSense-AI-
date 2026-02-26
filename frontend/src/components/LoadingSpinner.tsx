export default function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 border-opacity-20"></div>
                <div className="absolute inset-0 rounded-full border-t-4 border-emerald-500 border-l-transparent animate-spin"></div>

                {/* Inner static generic sci-fi dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_2px_rgba(52,211,153,0.5)]"></div>
                </div>
            </div>
            <p className="text-emerald-400 font-mono text-sm tracking-widest animate-pulse">
                ANALYZING BIO-SIGNATURES...
            </p>
        </div>
    );
}
