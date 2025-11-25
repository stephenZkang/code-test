import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import theme from './theme/theme';
import BottomNav from './components/BottomNav';
import HomePage from './pages/HomePage';
import PracticePage from './pages/PracticePage';
import ProgressPage from './pages/ProgressPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';

function App() {
    return (
        <ChakraProvider theme={theme}>
            <Router>
                <Routes>
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/" element={<HomePage />} />
                    <Route path="/practice" element={<PracticePage />} />
                    <Route path="/progress" element={<ProgressPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                </Routes>
                <BottomNav />
            </Router>
        </ChakraProvider>
    );
}

export default App;
