import { Leaf } from "lucide-react";

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[var(--color-border-subtle)] bg-[var(--color-background)]/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)]/10">
                        <Leaf className="h-5 w-5 text-[var(--color-primary)]" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight text-[var(--color-text-primary)]">
                        AgriVision <span className="text-[var(--color-primary)]">AI</span>
                    </span>
                </div>
            </div>
        </nav>
    );
}
