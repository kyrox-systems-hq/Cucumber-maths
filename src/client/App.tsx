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
            <div className="flex-1 min-h-0">
                <Group id="main-layout-v6" orientation="horizontal">
                    <Panel
                        id="left"
                        defaultSize={chatSide === 'left' ? 25 : 20}
                        minSize="15"
                        maxSize="35"
                        className="h-full"
                    >
                        {leftPanel}
                    </Panel>
                    <Separator className="w-px bg-border hover:bg-primary/30 transition-colors duration-150 cursor-col-resize" />
                    <Panel id="center" defaultSize={55} minSize="30" className="h-full">
                        <Canvas />
                    </Panel>
                    <Separator className="w-px bg-border hover:bg-primary/30 transition-colors duration-150 cursor-col-resize" />
                    <Panel
                        id="right"
                        defaultSize={chatSide === 'left' ? 20 : 25}
                        minSize="15"
                        maxSize="35"
                        className="h-full"
                    >
                        {rightPanel}
                    </Panel>
                </Group>
            </div>
        </div>
    );
}
