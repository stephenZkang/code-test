import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';

function App() {
    return (
        <Box minH="100vh" pb="80px">
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/practice" element={<PracticePage />} />
                <Route path="/progress" element={<ProgressPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Routes>
            <Navigation />
        </Box>
    );
}

export default App;
