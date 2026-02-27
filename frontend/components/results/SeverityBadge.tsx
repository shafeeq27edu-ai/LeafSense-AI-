export default function SeverityBadge({ severity }: { severity: string }) {
    const getSeverityStyle = (severity: string) => {
        switch (severity.toLowerCase()) {
            case "low": return "bg-emerald-500/20 text-emerald-400 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]";
            case "medium": return "bg-yellow-500/20 text-yellow-400 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]";
            case "high": return "bg-orange-500/20 text-orange-400 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]";
            case "critical": return "bg-red-500/20 text-red-400 border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.6)] animate-pulse";
            case "uncertain": return "bg-slate-500/20 text-slate-400 border-slate-500 border-dashed";
            default: return "bg-slate-500/20 text-slate-400 border-slate-500";
        }
    };
    return (
        <span className={`px-4 py-1.5 text-xs font-black uppercase rounded-full border tracking-widest ${getSeverityStyle(severity)}`}>
            {severity}
        </span>
    );
}
