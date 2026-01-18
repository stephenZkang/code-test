import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import SmartQAPage from './pages/SmartQAPage';
import SmartSearchPage from './pages/SmartSearchPage';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/knowledge" element={<KnowledgeBasePage />} />
                    <Route path="/search" element={<SmartSearchPage />} />
                    <Route path="/qa" element={<SmartQAPage />} />
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;
