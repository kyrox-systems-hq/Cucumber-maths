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

export default function App() {
    const { chatSide, swapSidebars } = useLayoutPreference();

    const leftPanel = chatSide === 'left' ? <ChatPanel /> : <DataPanel />;
    const rightPanel = chatSide === 'left' ? <DataPanel /> : <ChatPanel />;

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
            <Header onSwapSidebars={swapSidebars} />
            <ResizablePanelGroup orientation="horizontal" className="flex-1">
                <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
                    {leftPanel}
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={56} minSize={30}>
                    <Canvas />
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={22} minSize={15} maxSize={35}>
                    {rightPanel}
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
