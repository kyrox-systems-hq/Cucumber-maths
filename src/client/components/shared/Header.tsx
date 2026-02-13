import { ArrowLeftRight, Settings, Sparkles } from 'lucide-react';
import { cn } from '@client/lib/utils';

interface HeaderProps {
    className?: string;
    onSwapSidebars: () => void;
}

/**
 * Application header — 48px, surface background, hairline bottom border.
 *
 * Left:  Logo + branding + phase label
 * Right: Sidebar swap toggle + settings
 */
export function Header({ className, onSwapSidebars }: HeaderProps) {
    return (
        <header
            className={cn(
                'flex h-12 items-center justify-between px-4 bg-card border-b border-border shrink-0',
                className,
            )}
        >
            {/* Left — Branding */}
            <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#2ADDB0] to-[#4CCFC0]">
                    <Sparkles className="h-4 w-4 text-[#0E1116]" />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight">
                        Cucumber <span className="text-primary">Maths</span>
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">
                        Phase 1 — Spark
                    </span>
                </div>
            </div>

            {/* Right — Controls */}
            <div className="flex items-center gap-1">
                <button
                    onClick={onSwapSidebars}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors duration-150"
                    title="Swap sidebars"
                    aria-label="Swap sidebar positions"
                >
                    <ArrowLeftRight className="h-4 w-4" />
                </button>
                <button
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-elevated transition-colors duration-150"
                    title="Settings"
                    aria-label="Settings"
                >
                    <Settings className="h-4 w-4" />
                </button>
            </div>
        </header>
    );
}
