import { extendTheme } from '@chakra-ui/react'
import '@fontsource-variable/inter'
import { theme as baseTheme } from '@saas-ui/react'
import components from './components'
import { fontSizes } from './foundations/typography'

// Define your custom colors
const colors = {
  primary: {
    50: '#fff9db',
    100: '#ffefaf',
    200: '#ffe57f',
    300: '#ffda4e',
    400: '#ffd01e', // Main yellow
    500: '#e6b800', // This replaces the purple as primary color
    600: '#b38f00',
    700: '#806600',
    800: '#4d3d00',
    900: '#1a1400',
  },
  // You can keep or modify other colors as needed
}

// Customize the button component
const customComponents = {
  ...components,
  Button: {
    // Extend the current button styles
    variants: {
      primary: {
        bg: 'primary.500',
        color: 'black', // This changes the text color to black
        _hover: {
          bg: 'primary.600',
          color: 'black', // Maintain black text on hover
        },
        _active: {
          bg: 'primary.700',
          color: 'black', // Maintain black text when active
        },
      },
      // You can also customize other button variants here if needed
    },
  },
}

export const theme = extendTheme(
  {
    colors,
    config: {
      initialColorMode: 'light', // Changed from 'dark' to 'light'
      useSystemColorMode: false,
    },
    styles: {
      global: (props: any) => ({
        body: {
          color: 'gray.900',
          bg: 'white',
          fontSize: 'lg',
          _dark: {
            color: 'white',
            bg: 'gray.900',
          },
        },
      }),
    },
    fonts: {
      heading: 'Inter Variable, Inter, sans-serif',
      body: 'Inter Variable, Inter, sans-serif',
    },
    fontSizes,
    components: customComponents, // Use the extended components
  },
  baseTheme,
)