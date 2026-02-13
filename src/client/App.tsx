import { TooltipProvider } from '@client/components/ui/tooltip';
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@client/components/ui/resizable';
import { Header } from '@client/components/shared/Header';
import { ChatPanel } from '@client/components/Chat/ChatPanel';
import { Canvas } from '@client/components/Canvas/Canvas';
import { DataPanel } from '@client/components/DataPanel/DataPanel';

/* ─────────────────────────────────────────────
 * App — Root layout
 *
 * ┌─────────────────────────────────────────────┐
 * │  Header                                      │
 * ├──────┬───────────┬──────────────────────────┤
 * │ Data │   Chat    │       Canvas             │
 * │Panel │  Panel    │                          │
 * │      │           │                          │
 * └──────┴───────────┴──────────────────────────┘
 * ───────────────────────────────────────────── */

export default function App() {
    return (
        <TooltipProvider delayDuration={300}>
            <div className="h-screen w-screen flex flex-col overflow-hidden">
                <Header />

                <ResizablePanelGroup orientation="horizontal" className="flex-1">
                    {/* Data Panel — collapsible left sidebar */}
                    <ResizablePanel
                        defaultSize={18}
                        minSize={14}
                        maxSize={30}
                        className="min-w-0"
                    >
                        <DataPanel />
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Chat Panel */}
                    <ResizablePanel
                        defaultSize={28}
                        minSize={20}
                        maxSize={45}
                        className="min-w-0"
                    >
                        <ChatPanel />
                    </ResizablePanel>

                    <ResizableHandle withHandle />

                    {/* Canvas — fills remaining space */}
                    <ResizablePanel
                        defaultSize={54}
                        minSize={30}
                        className="min-w-0"
                    >
                        <Canvas />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </div>
        </TooltipProvider>
    );
}
