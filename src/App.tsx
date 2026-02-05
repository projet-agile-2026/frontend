import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RubriquesPage from './pages/RubriquesPage';
import QuestionsPage from './pages/QuestionsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<RubriquesPage />} />
          <Route path="/questions" element={<QuestionsPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;