import { ArrowLeftRight, Settings } from 'lucide-react';

interface HeaderProps {
    onSwapSidebars: () => void;
}

export function Header({ onSwapSidebars }: HeaderProps) {
    return (
        <header className="flex items-center justify-between h-11 px-4 border-b shrink-0" style={{ background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', borderColor: 'var(--glass-border)' }}>
            {/* Left: branding */}
            <div className="flex items-center gap-2.5">
                <span className="text-base font-semibold tracking-tight">
                    <span className="text-primary">
                        Cucumber
                    </span>
                    <span className="text-foreground/60 ml-1 font-normal">Maths</span>
                </span>
                <span className="inline-flex items-center rounded-md border border-border px-1.5 py-0.5 text-[9px] text-muted-foreground">
                    ALPHA
                </span>
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-1">
                <button
                    onClick={onSwapSidebars}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
                    title="Swap sidebars"
                >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Swap</span>
                </button>
                <button
                    className="flex items-center p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
                    title="Settings"
                >
                    <Settings className="h-3.5 w-3.5" />
                </button>
            </div>
        </header>
    );
}
