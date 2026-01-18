import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    colors: {
        brand: {
            50: '#E6FFFA',
            100: '#B2F5EA',
            200: '#81E6D9',
            300: '#4FD1C5',
            400: '#38B2AC',
            500: '#2C7A7B',  // Primary blue-green
            600: '#285E61',
            700: '#234E52',
            800: '#1D4044',
            900: '#1A374B',
        },
    },
    config: {
        initialColorMode: 'light',
        useSystemColorMode: false,
    },
    styles: {
        global: {
            body: {
                bg: 'gray.50',
                color: 'gray.800',
            },
        },
    },
    components: {
        Button: {
            defaultProps: {
                colorScheme: 'brand',
            },
        },
        Link: {
            baseStyle: {
                color: 'brand.500',
                _hover: {
                    textDecoration: 'none',
                    color: 'brand.600',
                },
            },
        },
    },
    breakpoints: {
        sm: '320px',
        md: '768px',
        lg: '960px',
        xl: '1200px',
    },
});

export default theme;
