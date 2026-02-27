"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const MENU_ITEMS = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Members", path: "/members" },
    { name: "Tech Stack", path: "/tech-stack" },
    { name: "About / Vision", path: "/about" },
];

export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
    const shouldReduceMotion = useReducedMotion();

    // Close menu when route changes and manage body scroll lock
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
            // Check for touch screens to disable touch move
            document.documentElement.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            document.documentElement.style.overflow = "unset";
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = "unset";
            document.documentElement.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape" && isOpen) setIsOpen(false);
    };

    return (
        <div onKeyDown={handleKeyDown}>
            {/* Brand logo - top left */}
            <div className="fixed top-6 left-6 z-50">
                <a href="/" className="font-mono font-bold text-lg tracking-[0.15em] uppercase text-[#39ff14] drop-shadow-[0_0_8px_#39ff14] hover:drop-shadow-[0_0_15px_#39ff14] transition-all duration-300">
                    <span className="text-white">Leaf</span>Sense
                    <span className="text-[10px] text-[#8bc983] block -mt-1 tracking-[0.25em]">AI</span>
                </a>
            </div>

            <nav className="fixed top-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                    aria-label="Toggle navigation menu"
                    className="relative px-6 py-3 font-mono uppercase tracking-widest text-[#0c3b07] bg-[#39ff14] pixel-borders hover:scale-105 hover:shadow-[0_0_15px_#39ff14] transition-all duration-300 flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#39ff14] focus-visible:ring-offset-[#050a06]"
                    style={{ textShadow: "0 0 2px rgba(12, 59, 7, 0.5)" }}
                >
                    <span className="font-bold">{isOpen ? "CLOSE" : "MENU"}</span>
                    <div className="w-4 h-4 flex flex-col justify-center gap-1">
                        <span className={`block h-[2px] bg-[#0c3b07] transition-all duration-300 ${isOpen ? "rotate-45 translate-y-[3px]" : ""}`}></span>
                        <span className={`block h-[2px] bg-[#0c3b07] transition-all duration-300 ${isOpen ? "opacity-0" : ""}`}></span>
                        <span className={`block h-[2px] bg-[#0c3b07] transition-all duration-300 ${isOpen ? "-rotate-45 -translate-y-[3px]" : ""}`}></span>
                    </div>
                </button>
            </nav>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={shouldReduceMotion ? { opacity: 0 } : { clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)", opacity: 0 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", opacity: 1 }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)", opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="fixed inset-0 z-40 flex items-center justify-center glass-panel bg-[#050a06]/95"
                        role="dialog"
                        aria-modal="true"
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none translate-z-0"></div>

                        <ul className="flex flex-col items-center gap-6 sm:gap-8 font-mono text-xl sm:text-2xl relative z-10 w-full max-w-lg px-4 overflow-y-auto max-h-[90vh]">
                            {MENU_ITEMS.map((item, idx) => {
                                const isActive = pathname === item.path;
                                return (
                                    <motion.li
                                        key={item.path}
                                        initial={shouldReduceMotion ? { opacity: 0 } : { x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: shouldReduceMotion ? 0 : 0.1 + idx * 0.05 }}
                                        className="w-full text-center"
                                    >
                                        <Link
                                            href={item.path}
                                            onClick={() => setIsOpen(false)}
                                            className={`block py-3 px-8 uppercase tracking-widest transition-all duration-300 border-l-4 border-r-4 ${isActive
                                                ? "text-[#39ff14] border-[#39ff14] bg-[#39ff14]/10 shadow-[inset_0_0_20px_rgba(57,255,20,0.2)]"
                                                : "text-[#8bc983] border-transparent hover:text-[#39ff14] hover:bg-[#39ff14]/5 hover:border-[#39ff14]/50 hover:shadow-[0_0_10px_rgba(57,255,20,0.3)] hover:scale-105"
                                                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#39ff14]`}
                                        >
                                            {item.name}
                                        </Link>
                                    </motion.li>
                                );
                            })}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
