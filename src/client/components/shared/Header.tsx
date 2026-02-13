import { Beaker, Settings, Moon, Github } from 'lucide-react';
import { Button } from '@client/components/ui/button';
import { Separator } from '@client/components/ui/separator';
import { cn } from '@client/lib/utils';

/* ─────────────────────────────────────────────
 * Header — App top bar with branding
 * ───────────────────────────────────────────── */

interface HeaderProps {
    className?: string;
}

export function Header({ className }: HeaderProps) {
    return (
        <header className={cn(
            'flex items-center justify-between px-4 h-12 border-b border-border bg-card/80 backdrop-blur-sm',
            className
        )}>
            {/* Logo + name */}
            <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-[#2ADDB0] to-[#4CCFC0] flex items-center justify-center">
                    <Beaker className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-bold tracking-tight">
                    Cucumber<span className="text-primary"> Maths</span>
                </span>
                <Separator orientation="vertical" className="h-4 mx-1" />
                <span className="text-[11px] text-muted-foreground">Phase 1 — Spark</span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Settings className="h-4 w-4" />
                </Button>
            </div>
        </header>
    );
}
