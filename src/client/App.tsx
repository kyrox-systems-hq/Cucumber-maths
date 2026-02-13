import { Header } from '@client/components/shared/Header';
import { DataPanel } from '@client/components/DataPanel/DataPanel';
import { ChatPanel } from '@client/components/Chat/ChatPanel';
import { Canvas } from '@client/components/Canvas/Canvas';
import { useLayoutPreference } from '@client/hooks/useLayoutPreference';

export default function App() {
    const { chatSide, swapSidebars } = useLayoutPreference();

    const leftPanel = chatSide === 'left' ? <ChatPanel /> : <DataPanel />;
    const rightPanel = chatSide === 'left' ? <DataPanel /> : <ChatPanel />;

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
            <Header onSwapSidebars={swapSidebars} />
            <div className="flex flex-1 min-h-0">
                <aside className="w-[22%] min-w-[240px] max-w-[380px] border-r border-border overflow-hidden">
                    {leftPanel}
                </aside>
                <main className="flex-1 min-w-0 overflow-hidden">
                    <Canvas />
                </main>
                <aside className="w-[22%] min-w-[240px] max-w-[380px] border-l border-border overflow-hidden">
                    {rightPanel}
                </aside>
            </div>
        </div>
    );
}
