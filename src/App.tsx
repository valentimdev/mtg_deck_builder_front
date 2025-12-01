import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DeckManagerPage from './components/DeckManagerPage';
import DeckBuilderPage from './pages/DeckBuilderPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<DeckManagerPage />} />
                <Route path="/deck/:deckId" element={<DeckBuilderPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
