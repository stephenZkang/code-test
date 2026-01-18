import { Box } from '@chakra-ui/react';
import BottomNav from './BottomNav';

function Layout({ children }) {
    return (
        <Box minH="100vh" pb="80px">
            {/* Main content */}
            <Box as="main">
                {children}
            </Box>

            {/* Bottom navigation */}
            <BottomNav />
        </Box>
    );
}

export default Layout;
