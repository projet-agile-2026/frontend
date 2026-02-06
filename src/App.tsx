import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RubriquesPage from "./pages/RubriquesPage";
import QuestionsPage from "./pages/QuestionsPage";
import PageCouples from "./pages/PageCouples";
import { Toaster } from "./components/ui/sonner";

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-background text-foreground">
                <div className="h-16 border-b" />

                <Routes>
                    <Route path="/" element={<RubriquesPage />} />
                    <Route path="/questions" element={<QuestionsPage />} />
                    <Route path="/couples" element={<PageCouples />} />
                </Routes>

                <Toaster richColors position="top-right" />
            </div>
        </Router>
    );
}

export default App;