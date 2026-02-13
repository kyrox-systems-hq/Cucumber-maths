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
            {/* Group renders its own div with display:flex, height:100%, width:100%.
                It needs a parent with explicit dimensions — flex-1 + min-h-0 does that. */}
            <div className="flex-1 min-h-0">
                <Group id="main-layout" orientation="horizontal">
                    <Panel id="left" defaultSize={22} minSize={15} maxSize={35}>
                        {leftPanel}
                    </Panel>
                    <Separator />
                    <Panel id="center" defaultSize={56} minSize={30}>
                        <Canvas />
                    </Panel>
                    <Separator />
                    <Panel id="right" defaultSize={22} minSize={15} maxSize={35}>
                        {rightPanel}
                    </Panel>
                </Group>
            </div>
        </div>
    );
}
