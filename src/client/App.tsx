import { Header } from '@client/components/shared/Header';
import { DataPanel } from '@client/components/DataPanel/DataPanel';
import { ChatPanel } from '@client/components/Chat/ChatPanel';
import { Canvas } from '@client/components/Canvas/Canvas';
import { useLayoutPreference } from '@client/hooks/useLayoutPreference';
import { Group, Panel, Separator } from 'react-resizable-panels';

export default function App() {
    const { chatSide, swapSidebars } = useLayoutPreference();

    const leftPanel = chatSide === 'left' ? <ChatPanel /> : <DataPanel />;
    const rightPanel = chatSide === 'left' ? <DataPanel /> : <ChatPanel />;

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
            <Header onSwapSidebars={swapSidebars} />
            <Group orientation="horizontal" className="flex-1">
                <Panel id="left" defaultSize={22} minSize={15} maxSize={35}>
                    {leftPanel}
                </Panel>
                <Separator className="w-px bg-border hover:bg-primary/30 transition-colors duration-150 cursor-col-resize" />
                <Panel id="center" defaultSize={56} minSize={30}>
                    <Canvas />
                </Panel>
                <Separator className="w-px bg-border hover:bg-primary/30 transition-colors duration-150 cursor-col-resize" />
                <Panel id="right" defaultSize={22} minSize={15} maxSize={35}>
                    {rightPanel}
                </Panel>
            </Group>
        </div>
    );
}
