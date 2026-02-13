import { Header } from '@client/components/shared/Header';
import { DataPanel } from '@client/components/DataPanel/DataPanel';
import { ChatPanel } from '@client/components/Chat/ChatPanel';
import { Canvas } from '@client/components/Canvas/Canvas';
import { useLayoutPreference } from '@client/hooks/useLayoutPreference';
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from '@client/components/ui/resizable';

/**
 * Root application shell.
 *
 * Layout: Header + 3-pane resizable split.
 * Chat and Data sidebars are on opposite sides — user can swap them via the header toggle.
 * Canvas is always in the centre.
 */
export default function App() {
    const { chatSide, swapSidebars } = useLayoutPreference();

    const leftPanel =
        chatSide === 'left' ? <ChatPanel /> : <DataPanel />;
    const rightPanel =
        chatSide === 'left' ? <DataPanel /> : <ChatPanel />;

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
            <Header onSwapSidebars={swapSidebars} />

            <ResizablePanelGroup orientation="horizontal" className="flex-1">
                {/* Left sidebar */}
                <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
                    {leftPanel}
                </ResizablePanel>

                <ResizableHandle />

                {/* Centre — Canvas (always here) */}
                <ResizablePanel defaultSize={56} minSize={30}>
                    <Canvas />
                </ResizablePanel>

                <ResizableHandle />

                {/* Right sidebar */}
                <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
                    {rightPanel}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
