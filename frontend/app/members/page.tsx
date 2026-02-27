"use client";

import { motion } from "framer-motion";

const members = [
    {
        name: "Shafeeq",
        role: "Developer",
        focus: "Coding & AI Integration",
        avatar: "S"
    },
    {
        name: "Leslie",
        role: "Team Lead",
        focus: "Planning & Execution",
        avatar: "L"
    },
    {
        name: "Roshan",
        role: "Data Analyst",
        focus: "Resources & Data Operations",
        avatar: "R"
    }
];

export default function MembersPage() {
    return (
        <main className="container mx-auto px-4 py-16 max-w-5xl min-h-[calc(100vh-6rem)] relative">
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#39ff14]/10 blur-[150px] rounded-full pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-16 relative z-10"
            >
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                    Taskforce <span className="text-[#39ff14]">Alpha</span>
                </h1>
                <p className="text-[#8bc983] max-w-2xl mx-auto font-mono text-sm uppercase">
                    The engineers engineering the future of agriculture.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 pt-8">
                {members.map((member, index) => (
                    <motion.div
                        key={member.name}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 }}
                        className="glass-panel p-8 rounded-xl border-t-4 border-[#39ff14] flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300"
                    >
                        <div className="w-24 h-24 rounded-none bg-[#0c3b07] border border-[#39ff14] mb-6 flex items-center justify-center rotate-45 group-hover:rotate-0 transition-transform duration-500 shadow-[0_0_15px_#39ff14]">
                            <span className="text-3xl font-bold text-[#39ff14] -rotate-45 group-hover:rotate-0 transition-transform duration-500">{member.avatar}</span>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-1 uppercase tracking-widest">{member.name}</h2>
                        <div className="text-[#39ff14] font-mono text-sm mb-4 bg-[#39ff14]/10 px-3 py-1 inline-block">[ {member.role} ]</div>

                        <div className="w-full h-[1px] bg-[#112a14] my-2"></div>

                        <p className="text-[#8bc983] text-sm font-mono mt-2">
                            <span className="opacity-50">FOCUS:</span><br />
                            {member.focus}
                        </p>
                    </motion.div>
                ))}
            </div>
        </main>
    );
}
