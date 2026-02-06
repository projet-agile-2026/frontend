import PageCouples from "./pages/PageCouples";
import { Toaster } from "./components/ui/sonner";

export default function App() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="h-16 border-b" />

            <PageCouples />


            <Toaster richColors position="top-right" />
        </div>
    );
}
