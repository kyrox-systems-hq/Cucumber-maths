import { ArrowLeftRight, Settings, ChevronDown, FolderKanban, GitBranch } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface HeaderProps {
    onSwapSidebars: () => void;
}

const MOCK_WORKSPACES = [
    { id: 'cucumber-maths', name: 'Cucumber Maths' },
    { id: 'q4-revenue', name: 'Q4 Revenue Analysis' },
    { id: 'portfolio-risk', name: 'Portfolio Risk Model' },
];

const MOCK_BRANCHES = [
    { id: 'main', name: 'Main' },
    { id: 'v1-baseline', name: 'v1.0 Baseline' },
    { id: 'exp-median', name: 'Test-Median-v2' },
];

function ContextSelector({ icon: Icon, items, defaultId }: {
    icon: React.ElementType;
    items: { id: string; name: string }[];
    defaultId: string;
}) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(defaultId);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function close(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const current = items.find(i => i.id === selected);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors duration-150"
            >
                <Icon className="h-3 w-3" />
                <span className="max-w-[120px] truncate">{current?.name}</span>
                <ChevronDown className="h-3 w-3 opacity-50" />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 min-w-[180px] rounded-[10px] border border-border bg-popover p-1 shadow-lg z-50">
                    {items.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setSelected(item.id); setOpen(false); }}
                            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-colors duration-150 ${item.id === selected
                                    ? 'bg-accent text-foreground'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                                }`}
                        >
                            <Icon className="h-3 w-3 shrink-0" />
                            <span className="truncate">{item.name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
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

            {/* Center: context selectors */}
            <div className="flex items-center gap-1">
                <ContextSelector
                    icon={FolderKanban}
                    items={MOCK_WORKSPACES}
                    defaultId="cucumber-maths"
                />
                <span className="text-border">/</span>
                <ContextSelector
                    icon={GitBranch}
                    items={MOCK_BRANCHES}
                    defaultId="main"
                />
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
